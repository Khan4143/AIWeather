import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT } from '../constants/dimesions';
import { UserDataManager } from '../utils/userDataManager';
import Geolocation from 'react-native-geolocation-service';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const STANDARD_SPACING = adjust(15);

// Create a global object to store user data
interface UserDataType {
  age: string;
  gender: string;
  occupation: string;
  location: string;
}

export const UserData = {
  age: '',
  gender: '',
  occupation: '',
  location: '',
  getAll: function(): UserDataType {
    return {
      age: this.age,
      gender: this.gender,
      occupation: this.occupation,
      location: this.location
    };
  },
  setAll: function(data: Partial<UserDataType>): void {
    this.age = data.age || '';
    this.gender = data.gender || '';
    this.occupation = data.occupation || '';
    this.location = data.location || '';
  }
};

// Add a function to convert coordinates to location name using Nominatim API
const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Using the free Nominatim API (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
      {
        headers: {
          'User-Agent': 'SkylarWeatherApp/1.0',
          'Accept-Language': 'en'
        }
      }
    );
    
    const data = await response.json();
    console.log('Geocoding response:', data);
    
    if (data && data.address) {
      // Build a location string from the address components
      const { city, town, village, county, state, country } = data.address;
      
      // Try to get the most specific location name available
      const locationName = city || town || village || county || '';
      const regionName = state || '';
      const countryName = country || '';
      
      let locationString = '';
      
      if (locationName) {
        locationString = locationName;
        if (regionName && locationName !== regionName) {
          locationString += `, ${regionName}`;
        }
        if (countryName && regionName !== countryName) {
          locationString += `, ${countryName}`;
        }
      } else if (regionName) {
        locationString = regionName;
        if (countryName) {
          locationString += `, ${countryName}`;
        }
      } else if (countryName) {
        locationString = countryName;
      }
      
      // If we couldn't parse a proper name, use display_name as fallback
      return locationString || data.display_name || 'Location detected';
    }
    
    throw new Error('No location data found');
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return 'Location detected'; // Fallback
  }
};

const UserInfo = ({ navigation }: { navigation: any }) => {
  // State for form fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const googlePlacesRef = useRef<any>(null);

  useEffect(() => {
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false,
      });
    }
    
    const unsubscribe = navigation.addListener('focus', () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }
      });

    return unsubscribe;
  }, [navigation]);

  // Handle gender selection
  const handleSelectGender = (selectedGender: string) => {
    setGender(selectedGender);
  };

  // Request location permissions
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to provide weather updates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // For iOS, we don't need to explicitly request permission
        // The requestAuthorization call happens internally in getCurrentPosition
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    setIsDetectingLocation(true);
    
    // Set a timeout to prevent endless loading
    const locationTimeout = setTimeout(() => {
      if (isDetectingLocation) {
        setIsDetectingLocation(false);
        Alert.alert(
          'Location Timeout',
          'Location detection is taking too long. Please try again or enter your location manually.',
          [{ text: 'OK' }]
        );
      }
    }, 15000);
    
    try {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        clearTimeout(locationTimeout);
        setIsDetectingLocation(false);
        Alert.alert(
          'Permission Denied',
          'Location permission was denied. Please enter your location manually.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // For debugging purposes
      console.log('Getting location...');
      
      // Use a Promise-based approach to handle geolocation
      const position = await new Promise<Geolocation.GeoPosition>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (error) => reject(error),
          { 
            enableHighAccuracy: false, // Set to false for faster response
            timeout: 10000,
            maximumAge: 1000 
          }
        );
      });
      
      clearTimeout(locationTimeout);
      console.log('Location obtained:', position);
      
      // Get the location name from coordinates
      const { latitude, longitude } = position.coords;
      
      // Show coordinates temporarily while we fetch the location name
      setManualLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
      setUseLocation(true);
      
      // Convert coordinates to human-readable location name
      try {
        const locationName = await reverseGeocode(latitude, longitude);
        console.log('Location name:', locationName);
        
        // Update with the proper location name
        setManualLocation(locationName);
      } catch (err) {
        console.error('Error in reverse geocoding:', err);
        // Keep the coordinates as fallback
        setManualLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
      }
    } catch (error: any) {
      clearTimeout(locationTimeout);
      console.error('Error getting location:', error);
      
      let errorMessage = 'Could not get your location. Please enter it manually.';
      if (error.code === 1) {
        errorMessage = 'Location permission denied. Please enter your location manually.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your device settings and try again.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again or enter your location manually.';
      }
      
      Alert.alert(
        'Location Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Handle location detection button press
  const handleDetectLocation = () => {
    console.log("Location detection requested");
    getCurrentLocation();
  };

  // Handle next button press
  const handleNext = async () => {
    // Validate inputs
    if (!age) {
      Alert.alert('Missing Information', 'Please enter your age.');
      return;
    }

    if (!gender) {
      Alert.alert('Missing Information', 'Please select your gender.');
      return;
    }
    
    // Save data to UserData global object
    const locationToSave = manualLocation || (useLocation ? 'New York, NY' : '');
    UserData.setAll({
      age,
      gender,
      occupation,
      location: locationToSave
    });
    
    // Save to AsyncStorage
    try {
      await UserDataManager.saveUserProfile();
      console.log('User profile data saved successfully');
    } catch (error) {
      console.error('Error saving user profile data:', error);
    }
    
    // Navigate to next screen
    navigation.navigate('DailyRoutine');
  };

  // Show info dialog about why we ask for this info
  const showWhyWeAsk = () => {
    Alert.alert(
      'Why We Ask For Your Information',
      'Skylar uses your age, gender, and location to provide personalized weather recommendations, clothing suggestions, and health tips relevant to your demographic and local conditions.',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LinearGradient colors={['#b3d4ff', '#5c85e6']} style={styles.background}>
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          enabled
        >
          <ScrollView 
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={styles.scrollContent}
      >
        {/* Custom Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
                <Ionicons name="chevron-back" size={adjust(20)} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.headerText}>Let's get to know you better!</Text>
        </View>

        <Text style={styles.subHeaderText}>
          Skylar uses this info to give you smarter, personalized advice every day.
        </Text>

        {/* Age Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>How old are you?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your age"
            placeholderTextColor="#8e9aaf"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
          />
        </View>

        {/* Gender Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Select your gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.selectedGender,
              ]}
              onPress={() => handleSelectGender('male')}
            >
              <MaterialIcons 
                name="male" 
                size={adjust(22)} 
                color={gender === 'male' ? '#4361ee' : '#333'} 
              />
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.selectedGender,
              ]}
              onPress={() => handleSelectGender('female')}
            >
              <MaterialIcons 
                name="female" 
                size={adjust(22)} 
                color={gender === 'female' ? '#4361ee' : '#333'} 
              />
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'other' && styles.selectedGender,
              ]}
              onPress={() => handleSelectGender('other')}
            >
              <MaterialIcons 
                name="people" 
                size={adjust(22)} 
                color={gender === 'other' ? '#4361ee' : '#333'} 
              />
              <Text style={styles.genderText}>Other</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Occupation Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>What's your occupation?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your occupation"
            placeholderTextColor="#8e9aaf"
            value={occupation}
            onChangeText={setOccupation}
          />
          <Text style={styles.inputHelperText}>
            This helps Skylar tailor fashion & routine tips
          </Text>
        </View>

        {/* Location Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Where are you located?</Text>
          
          {/* Button to detect location */}
          <TouchableOpacity
            style={styles.locationDetectButton}
            onPress={handleDetectLocation}
            disabled={isDetectingLocation}
          >
            <Ionicons name="location" size={adjust(16)} color="#fff" />
            <Text style={styles.locationDetectText}>
              {isDetectingLocation ? 'Detecting...' : 'Detect My Location'}
            </Text>
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          {/* Google Places Autocomplete */}
          <View style={styles.placesInputContainer}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="search" size={adjust(16)} color="#666" />
            </View>
            <TextInput
              style={{
                height: adjust(42),
                paddingHorizontal: adjust(12),
                paddingLeft: adjust(35),
                fontSize: adjust(13),
                color: '#333',
                backgroundColor: '#f8f9fa',
                borderRadius: adjust(8),
                borderColor: '#e0e0e0',
                borderWidth: 1,
              }}
              placeholder="Enter your city or area"
              placeholderTextColor="#8e9aaf"
              value={manualLocation}
              onChangeText={(text) => setManualLocation(text)}
            />
          </View>
          
          {/* Selected Location Display */}
          {manualLocation ? (
            <View style={styles.selectedLocationContainer}>
              <Ionicons name="checkmark-circle" size={adjust(18)} color="#4CD964" />
              <Text style={styles.selectedLocationText}>{manualLocation}</Text>
            </View>
          ) : null}
        </View>

        {/* Why do we ask this */}
        <TouchableOpacity 
          style={styles.whyContainer}
          onPress={showWhyWeAsk}
        >
          <Ionicons name="information-circle-outline" size={adjust(18)} color="#333" />
          <Text style={styles.whyText}>Why do we ask this?</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!age || !gender) && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!age || !gender}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={adjust(16)} color="#fff" />
        </TouchableOpacity>
          </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>

    {/* Loading Overlay */}
    <Modal
      transparent={true}
      animationType="fade"
      visible={isDetectingLocation}
      onRequestClose={() => setIsDetectingLocation(false)}
    >
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4361EE" />
          <Text style={styles.loadingText}>Detecting your location...</Text>
        </View>
      </View>
    </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3d4ff',
  },
  background: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: adjust(12),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? adjust(1) : StatusBar.currentHeight ? StatusBar.currentHeight + adjust(1) : adjust(1),
    paddingLeft: adjust(5),
    marginBottom: adjust(20),
  },
  backButton: {
    width: adjust(32),
    height: adjust(32),
    borderRadius: adjust(18),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: adjust(6),
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: adjust(4),
  },
  headerText: {
    fontSize: adjust(20),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: adjust(4),
  },
  subHeaderText: {
    fontSize: adjust(12),
    color: '#666',
    textAlign: 'center',
    marginBottom: adjust(16),
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: adjust(12),
    padding: adjust(12),
    marginBottom: adjust(12),
  },
  inputLabel: {
    fontSize: adjust(13),
    fontWeight: '600',
    color: '#333',
    marginBottom: adjust(8),
  },
  textInput: {
    height: adjust(42),
    paddingHorizontal: adjust(12),
    fontSize: adjust(13),
    color: '#333',
    backgroundColor: '#f8f9fa',
    borderRadius: adjust(8),
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  inputHelperText: {
    fontSize: adjust(11),
    color: '#666',
    marginTop: adjust(6),
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: adjust(4),
  },
  genderButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: adjust(12),
    backgroundColor: '#f1f1f1',
    borderRadius: adjust(8),
    marginHorizontal: adjust(4),
  },
  selectedGender: {
    backgroundColor: '#e0f0ff',
    borderWidth: 1,
    borderColor: '#4361ee',
  },
  genderText: {
    fontSize: adjust(12),
    color: '#333',
    marginTop: adjust(6),
  },
  locationDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4361EE',
    borderRadius: adjust(8),
    paddingVertical: adjust(12),
    marginTop: STANDARD_SPACING,
  },
  locationDetectText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: adjust(8),
    fontSize: adjust(14),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: STANDARD_SPACING,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    marginHorizontal: adjust(10),
    color: '#666',
    fontSize: adjust(12),
  },
  placesInputContainer: {
    marginBottom: STANDARD_SPACING,
    position: 'relative',
  },
  locationIconContainer: {
    position: 'absolute',
    left: adjust(10),
    top: adjust(15),
    zIndex: 10,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: adjust(10),
    padding: adjust(12),
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    borderRadius: adjust(8),
    borderWidth: 1,
    borderColor: 'rgba(76, 217, 100, 0.3)',
  },
  selectedLocationText: {
    fontSize: adjust(15),
    color: '#333',
    marginLeft: adjust(8),
    fontWeight: '500',
  },
  whyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: adjust(12),
  },
  whyText: {
    fontSize: adjust(12),
    color: '#333',
    marginLeft: adjust(8),
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#517FE0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: adjust(30),
    paddingVertical: adjust(15),
    marginBottom: adjust(15),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: adjust(14),
    fontWeight: 'bold',
    marginRight: adjust(8),
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  // Loading styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: adjust(250),
    height: adjust(120),
    backgroundColor: '#fff',
    borderRadius: adjust(12),
    padding: adjust(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: adjust(10),
    fontSize: adjust(14),
    color: '#333',
    fontWeight: '500',
  },
});

export default UserInfo;