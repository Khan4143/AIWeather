import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';
import Umbrella from 'react-native-vector-icons/FontAwesome5'
import { UserDataManager } from '../utils/userDataManager';
import { useNotification, requestNotificationPermission } from '../Notifications/UseNotification';
import { useDeviceMeta } from '../Notifications/Location';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';

// Google Places API Key
const GOOGLE_PLACES_API_KEY = 'AIzaSyAJcSmb8jAEU5qVlzR3sTRcraWxb38B31w';

const OnboardingScreen = ({ navigation }: { navigation: any }) => {
  useNotification(); 
  const { saveDeviceMeta } = useDeviceMeta();
  const [isLoading, setIsLoading] = useState(false);
  
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return await Geolocation.requestAuthorization('whenInUse');
    }
    
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Weather app needs access to your location to provide accurate weather forecasts.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  };

  const getCurrentLocation = () => {
    return new Promise<{latitude: number, longitude: number, cityDisplay: string}>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            let cityDisplay = "Unknown location";
            
            try {
              // Get city name using reverse geocoding with Google API
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`
              );
              const data = await response.json();
              
              console.log('Google Geocoding API response status:', data.status);
              
              if (data.status === 'OK' && data.results && data.results.length > 0) {
                // Define type for address component
                type AddressComponent = {
                  long_name: string;
                  short_name: string;
                  types: string[];
                };
                
                // Try to extract city name from address components
                // Check through multiple results (from most specific to least specific)
                let cityComponent = null;
                
                // Function to find city component in a result
                const findCityInResult = (result: any) => {
                  const addressComponents = result.address_components;
                  
                  // First try to get locality (city)
                  let component = addressComponents.find((component: AddressComponent) => 
                    component.types.includes('locality')
                  );
                  
                  // If not found, try sublocality_level_1
                  if (!component) {
                    component = addressComponents.find((component: AddressComponent) => 
                      component.types.includes('sublocality_level_1')
                    );
                  }
                  
                  // If not found, try administrative_area_level_2 (county/district)
                  if (!component) {
                    component = addressComponents.find((component: AddressComponent) => 
                      component.types.includes('administrative_area_level_2')
                    );
                  }
                  
                  // If still not found, try administrative_area_level_1 (state/province)
                  if (!component) {
                    component = addressComponents.find((component: AddressComponent) => 
                      component.types.includes('administrative_area_level_1')
                    );
                  }
                  
                  return component;
                };
                
                // Try to find city in each result, starting from the most specific
                for (const result of data.results) {
                  cityComponent = findCityInResult(result);
                  if (cityComponent) break;
                }
                
                // If found any component, use its name
                if (cityComponent) {
                  cityDisplay = cityComponent.long_name;
                  console.log('Found city name:', cityDisplay);
                } else {
                  // If still no city found, use formatted_address of first result
                  if (data.results[0].formatted_address) {
                    const parts = data.results[0].formatted_address.split(',');
                    if (parts.length > 1) {
                      // Use the second part of the address (often the city)
                      cityDisplay = parts[1].trim();
                      console.log('Using formatted address part as city:', cityDisplay);
                    }
                  }
                }
              } else {
                // If Google API fails, try fallback method with OpenStreetMap Nominatim API
                console.log('Google API failed, trying fallback method...');
                await tryFallbackGeocoding(latitude, longitude);
              }
            } catch (error) {
              console.error('Error with Google Geocoding API:', error);
              // Try fallback method
              await tryFallbackGeocoding(latitude, longitude);
            }
            
            // Fallback geocoding method using OpenStreetMap Nominatim
            async function tryFallbackGeocoding(lat: number, lng: number) {
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                  {
                    headers: {
                      'User-Agent': 'SkylarWeatherApp/1.0',
                      'Accept-Language': 'en-US,en'
                    }
                  }
                );
                const data = await response.json();
                
                if (data && data.address) {
                  // Try to get city name from various fields
                  cityDisplay = data.address.city || 
                               data.address.town || 
                               data.address.village || 
                               data.address.county || 
                               data.address.state || 
                               "Unknown location";
                  
                  console.log('Found city name from fallback API:', cityDisplay);
                }
              } catch (fallbackError) {
                console.error('Fallback geocoding failed:', fallbackError);
              }
            }
            
            resolve({ latitude, longitude, cityDisplay });
          } catch (error) {
            console.error('Error getting location details:', error);
            resolve({ 
              latitude: position.coords.latitude, 
              longitude: position.coords.longitude, 
              cityDisplay: "Unknown location" 
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  const [contentHeight, setContentHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Hide header on mount
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false
      });
    }

    const unsubscribe = navigation.addListener('focus', () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEnableNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Request notification permission
      const notificationPermission = await requestNotificationPermission();
      
      // Request location permission
      const locationPermission = await requestLocationPermission();
      
      if (locationPermission) {
        // Get current location and save device metadata
        const locationData = await getCurrentLocation();
        const result = await saveDeviceMeta(locationData);
        
        if (!result.success) {
          console.error('Failed to save device metadata:', result.error);
          Alert.alert(
            "Warning",
            "We were able to get your location, but there was an issue saving it. You may not receive location-based weather alerts.",
            [{ text: 'OK' }]
          );
        } else {
          console.log('Successfully saved device metadata');
        }
      } else {
        Alert.alert(
          "Location Permission Denied",
          "Without location permission, we can't provide accurate weather forecasts. You can enable it in settings later."
        );
      }
      
      // Navigate to next screen
      navigation.navigate('Intro');
    } catch (error) {
      console.error('Error during permission setup:', error);
      Alert.alert(
        "Setup Error",
        "There was an error setting up notifications and location. You can try again in the settings later.",
        [{ text: 'OK' }]
      );
      navigation.navigate('Intro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaybeLater = () => {
    // Navigate but don't enable notifications
    navigation.navigate('Intro');
  };

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  const needsScrollView = contentHeight > SCREEN_HEIGHT * 0.9;

  const handleComplete = async () => {
    try {
      // Save all user data and navigate to main app
      await UserDataManager.saveAllData();
      navigation.navigate('MainApp');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const renderContent = () => (
    <View style={styles.contentContainer} onLayout={handleContentLayout}>
      {/* Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          activeOpacity={0.8}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={adjust(20)} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Umbrella Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Umbrella name="umbrella" size={adjust(90)} color="#ffffff" />
        </View>
      </View>

      {/* Title and Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Never Caught Off Guard{'\n'}Again!</Text>
        <Text style={styles.description}>
          Skylar sends personalized notifications{'\n'}
          so weather never interrupts your plans.{'\n'}
          Always know exactly what to wear, when{'\n'}
          to commute, and when to stay safe.
        </Text>
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialsContainer}>
        {/* First testimonial */}
        <View style={styles.testimonialCard}>
          <View style={styles.testimonialIcon}>
            <Feather name="check-circle" size={adjust(16)} color="#fff" />
          </View>
          <Text style={styles.testimonialText}>
            90% of Skylar users say alerts helped them avoid discomfort or delays. You'll love it too!
          </Text>
        </View>

        {/* Second testimonial */}
        <View style={styles.testimonialCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={adjust(16)} color="#fff" />
            </View>
          </View>
          <Text style={styles.testimonialText}>
            I'll only alert you when it matters most
          </Text>
        </View>
      </View>

      {/* Call to Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.enableButton}
          activeOpacity={0.9}
          onPress={handleEnableNotifications}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <View style={styles.buttonIconContainer}>
                <Feather name="check-circle" size={adjust(16)} color="#fff" />
              </View>
              <Text style={styles.enableButtonText}>Enable Notifications</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleMaybeLater}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Text style={[styles.laterText, isLoading && styles.disabledText]}>
            Maybe Later (miss important alerts!)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea} >
      {/* <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" /> */}
      <LinearGradient
        colors={['#b3d4ff', '#5c85e6']}
        style={styles.background}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#b3d4ff', // Match the gradient start color
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: adjust(20),
    paddingBottom: adjust(20),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: adjust(10),
    paddingBottom: adjust(4),
    marginBottom: adjust(5),
  },
  backButton: {
    width: adjust(32),
    height: adjust(32),
    borderRadius: adjust(18),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: adjust(8),
    marginTop: adjust(10),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: adjust(5),
    marginBottom: adjust(30),
    // zIndex: 1,
  },
  iconCircle: {
    width: adjust(170),
    height: adjust(170),
    borderRadius: adjust(85),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    // zIndex: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: adjust(30),
  },
  title: {
    fontSize: adjust(20),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: adjust(15),
  },
  description: {
    fontSize: adjust(14),
    color: '#333',
    textAlign: 'center',
    lineHeight: adjust(20),
  },
  testimonialsContainer: {
    marginBottom: adjust(30),
  },
  testimonialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: adjust(12),
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(16),
    marginBottom: adjust(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  testimonialIcon: {
    width: adjust(24),
    height: adjust(24),
    borderRadius: adjust(12),
    backgroundColor: '#4361ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: adjust(10),
  },
  avatarContainer: {
    marginRight: adjust(10),
  },
  avatar: {
    width: adjust(24),
    height: adjust(24),
    borderRadius: adjust(12),
    backgroundColor: '#4361ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialText: {
    flex: 1,
    fontSize: adjust(12),
    color: '#333',
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: adjust(10),
  },
  enableButton: {
    flexDirection: 'row',
    backgroundColor: '#517FE0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: adjust(25),
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(20),
    width: '100%',
    marginBottom: adjust(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonIconContainer: {
    marginRight: adjust(8),
  },
  enableButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: adjust(14),
  },
  laterText: {
    color: '#333',
    fontSize: adjust(12),
  },
  disabledText: {
    color: 'rgba(51, 51, 51, 0.5)', // Faded version of #333
  },
});

export default OnboardingScreen;
