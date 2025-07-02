import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ActivityIndicator,
  Modal,
  FlatList,
  PermissionsAndroid,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT } from '../constants/dimesions';
import { UserDataManager } from '../utils/userDataManager';
import Geolocation from 'react-native-geolocation-service';
import { validateCity } from '../services/weatherService';
import debounce from 'lodash/debounce';

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

// List of popular cities available in OpenWeather API
const POPULAR_CITIES = [
  'New York, US',
  'Los Angeles, US',
  'London, GB',
  'Tokyo, JP',
  'Paris, FR',
  'Berlin, DE',
  'Sydney, AU',
  'Mumbai, IN',
  'Beijing, CN',
  'Rio de Janeiro, BR',
  'Cairo, EG',
  'Moscow, RU',
  'Toronto, CA',
  'Rome, IT',
  'Madrid, ES',
  'Amsterdam, NL',
  'Dubai, AE',
  'Mexico City, MX',
  'Bangkok, TH',
  'Singapore, SG',
  'Stockholm, SE',
  'Istanbul, TR',
  'Seoul, KR',
  'Buenos Aires, AR',
  'Nairobi, KE',
  'Vienna, AT',
  'Athens, GR',
  'Copenhagen, DK',
  'Brussels, BE',
  'Helsinki, FI',
  'Lisbon, PT',
  'Zurich, CH',
  'Oslo, NO',
  'Warsaw, PL',
  'Prague, CZ',
  'Budapest, HU',
  'Auckland, NZ',
  'Jakarta, ID',
  'Manila, PH',
  'Kuala Lumpur, MY',
  'Santiago, CL',
  'Bogota, CO',
  'Lima, PE',
  'Johannesburg, ZA',
  'Cape Town, ZA',
];

const API_KEY = '87b449b894656bb5d85c61981ace7d25';

// Add type definition for city objects
interface CityObject {
  key: string;
  display: string;
}

// Google Places API Key
const GOOGLE_PLACES_API_KEY = 'AIzaSyAJcSmb8jAEU5qVlzR3sTRcraWxb38B31w';

const UserInfo = ({ navigation }: { navigation: any }) => {
  // State for form fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<CityObject[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Add a ref for the input field
  const locationInputRef = useRef<TextInput>(null);

  // Fetch from Google Places API
  const searchPlaces = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setPlacesResults([]);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Clear any previous results
      setPlacesResults([]);
      
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${GOOGLE_PLACES_API_KEY}`;
      console.log('Request URL (without API key):', url.replace(GOOGLE_PLACES_API_KEY, 'API_KEY'));
      
      const response = await fetch(url);
      console.log('Places API Response Status:', response.status);
      console.log('Places API Response Status Text:', response.statusText);
      
      const data = await response.json();
      console.log('Places API Response:', data);
      
      if (data.error) {
        console.error('Places API Error:', {
          code: data.error.code,
          message: data.error.message,
          status: data.error.status,
          details: data.error.details
        });
        return;
      }
      
      if (data.status === 'OK' && data.predictions) {
        const formattedResults = data.predictions.map((prediction: any) => ({
          place_id: prediction.place_id,
          description: prediction.description,
          structured_formatting: {
            main_text: prediction.structured_formatting.main_text,
            secondary_text: prediction.structured_formatting.secondary_text
          }
        }));
        
        setPlacesResults(formattedResults);
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('REQUEST_DENIED - Common causes:');
        console.error('1. Places API not enabled in Google Cloud Console');
        console.error('2. Invalid API key');
        console.error('3. Billing not enabled');
        console.error('4. API key restrictions preventing access');
      }
    } catch (error) {
      console.error('Error in searchPlaces:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Debounced search handler
  const debouncedSearchPlaces = useCallback(
    debounce((query: string) => {
      searchPlaces(query);
    }, 300),
    [searchPlaces]
  );
  
  // Handle text input change
  const handleLocationTextChange = (text: string) => {
    setManualLocation(text);
    setSearchQuery(text);
    setShowCitySuggestions(true); // Always show suggestions when typing
    
    if (text.length < 2) {
      setPlacesResults([]);
    } else {
      debouncedSearchPlaces(text);
    }
  };
  
  // Handle place selection
  const handlePlaceSelected = async (placeId: string, description: string) => {
    try {
      setShowCitySuggestions(false); // Hide suggestions when a place is selected
      
      // Get detailed place information
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,name&key=${GOOGLE_PLACES_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        const cityName = data.result.name;
        const formattedAddress = data.result.formatted_address;
        
        // Update location
        setManualLocation(formattedAddress || description);
        setSearchQuery('');
        Keyboard.dismiss();
      }
    } catch (error) {
      console.error('Error selecting place:', error);
    }
  };

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

  // Request location permissions (Android)
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return await Geolocation.requestAuthorization('whenInUse');
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Skylar needs access to your location to provide accurate weather updates.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
  };

  // Reverse geocode coordinates to city name
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // Use OpenWeather's reverse geocoding API
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get location name');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Format as object with key and display properties
        return {
          key: `geo-${data[0].name}-${data[0].country}`,
          display: `${data[0].name}, ${data[0].country}`
        };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      return null;
    }
  };

  // Handle gender selection
  const handleSelectGender = (selectedGender: string) => {
    setGender(selectedGender);
  };

  // Detect current location
  const handleDetectLocation = async () => {
    setIsLocating(true);
    
    try {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Please enable location permissions in your device settings to use this feature.',
          [{ text: 'OK' }]
        );
        setIsLocating(false);
        return;
      }
      
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const cityObj = await reverseGeocode(latitude, longitude);
          
          if (cityObj) {
            setManualLocation(cityObj.display);
            setSearchQuery('');
            setShowCitySuggestions(false);
          } else {
            Alert.alert(
              'Location Error',
              'Could not determine your city. Please enter your location manually.',
              [{ text: 'OK' }]
            );
          }
          setIsLocating(false);
        },
        (error) => {
          Alert.alert(
            'Location Error',
            'Unable to get your current location. Please try again or enter your location manually.',
            [{ text: 'OK' }]
          );
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      setIsLocating(false);
      Alert.alert(
        'Error',
        'Something went wrong while getting your location. Please try again.',
        [{ text: 'OK' }]
      );
    }
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
    const locationToSave = manualLocation || 'New York, US';
    UserData.setAll({
      age,
      gender,
      occupation,
      location: locationToSave
    });
    
    // Save to AsyncStorage
    try {
      await UserDataManager.saveUserProfile();
    } catch (error) {
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

  // Modify the useEffect for keyboard handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // When keyboard shows and suggestions are visible, scroll to ensure they're visible
        if (showCitySuggestions && scrollViewRef.current) {
          setTimeout(() => {
            if (locationInputRef.current) {
              locationInputRef.current.measureInWindow((x, y, width, height) => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({ 
                    y: y - 120, // Scroll to position input at top with space for suggestions
                    animated: true 
                  });
                }
              });
            }
          }, 100);
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [showCitySuggestions]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LinearGradient colors={['#b3d4ff', '#5c85e6']} style={styles.background}>
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            disabled={isLocating}
          >
            <Ionicons name="location" size={adjust(16)} color="#fff" />
            <Text style={styles.locationDetectText}>
              {isLocating ? 'Detecting...' : 'Detect my Location'}
            </Text>
            {isLocating && (
              <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 5 }} />
            )}
          </TouchableOpacity>
            
          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
            
          {/* Manual Location Input */}
          <View style={styles.placesInputContainer}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="search" size={adjust(16)} color="#666" />
            </View>
            <TextInput
              ref={locationInputRef}
              style={styles.locationInput}
              placeholder="Enter your city or area"
              placeholderTextColor="#8e9aaf"
              value={manualLocation}
              onChangeText={handleLocationTextChange}
              onFocus={() => setShowCitySuggestions(true)}
            />
          </View>

          {/* City suggestions dropdown */}
          {showCitySuggestions && manualLocation.length > 0 && (
            <View style={styles.suggestionsWrapper}>
              <View style={styles.suggestionsCard}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#4361EE" />
                    <Text style={styles.loadingText}>Finding cities...</Text>
                  </View>
                ) : placesResults.length > 0 ? (
                  <ScrollView 
                    style={styles.suggestionsList}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                  >
                    {placesResults.map((item) => (
                      <TouchableOpacity 
                        key={item.place_id}
                        style={styles.suggestionItem}
                        onPress={() => handlePlaceSelected(item.place_id, item.description)}
                      >
                        <Ionicons name="location-outline" size={adjust(16)} color="#666" />
                        <View style={styles.suggestionTextContainer}>
                          <Text style={styles.suggestionMainText}>
                            {item.structured_formatting?.main_text || item.description.split(',')[0]}
                          </Text>
                          {(item.structured_formatting?.secondary_text || item.description.includes(',')) && (
                            <Text style={styles.suggestionSecondaryText}>
                              {item.structured_formatting?.secondary_text || 
                               item.description.split(',').slice(1).join(',').trim()}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyResultContainer}>
                    <Text style={styles.emptyResultText}>No cities found</Text>
                  </View>
                )}
              </View>
            </View>
          )}
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
    position: 'relative',
    marginTop: adjust(8),
    zIndex: 1000,
  },
  locationIconContainer: {
    position: 'absolute',
    left: adjust(10),
    top: adjust(13),
    zIndex: 1001,
  },
  locationInput: {
    height: adjust(42),
    paddingHorizontal: adjust(12),
    paddingLeft: adjust(35),
    fontSize: adjust(13),
    color: '#333',
    backgroundColor: '#f8f9fa',
    borderRadius: adjust(8),
    borderColor: '#e0e0e0',
    borderWidth: 1,
    zIndex: 1,
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
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cityItemText: {
    fontSize: adjust(14),
    color: '#333',
    marginLeft: adjust(10),
  },
  suggestionsWrapper: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 2,
    zIndex: 1002,
  },
  suggestionsCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(8),
    minHeight: adjust(50),
    maxHeight: adjust(200),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  suggestionsList: {
    maxHeight: adjust(200),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  suggestionTextContainer: {
    flex: 1,
    marginLeft: adjust(8),
  },
  suggestionMainText: {
    fontSize: adjust(14),
    color: '#333',
    fontWeight: '500',
  },
  suggestionSecondaryText: {
    fontSize: adjust(12),
    color: '#666',
    marginTop: adjust(2),
  },
  loadingContainer: {
    padding: adjust(15),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: adjust(10),
    fontSize: adjust(14),
    color: '#4361EE',
  },
  emptyResultContainer: {
    padding: adjust(15),
    alignItems: 'center',
  },
  emptyResultText: {
    fontSize: adjust(14),
    color: '#666',
  },
});

export default UserInfo;