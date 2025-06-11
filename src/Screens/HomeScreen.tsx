import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';
import { CommonActions } from '@react-navigation/native';
import { useWeatherContext } from '../contexts/WeatherContext';
import { UserData } from '../Screens/UserInfo';
import { useFocusEffect } from '@react-navigation/native';

// Helper function to get the time of day greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Helper function to format time from Unix timestamp - Update to include AM/PM
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Simple function to format time for hourly display
const formatHour = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', hour12: true });
};

// Helper function to get weather icon based on OpenWeather icon code - for Feather icons
const getWeatherIcon = (iconCode: string) => {
  if (!iconCode) return 'cloud';
  
  const iconMap: {[key: string]: string} = {
    '01d': 'sun', // clear sky day
    '01n': 'moon', // clear sky night
    '02d': 'cloud-sun', // few clouds day
    '02n': 'cloud-moon', // few clouds night
    '03d': 'cloud', // scattered clouds day
    '03n': 'cloud', // scattered clouds night
    '04d': 'cloud', // broken clouds day
    '04n': 'cloud', // broken clouds night
    '09d': 'cloud-rain', // shower rain day
    '09n': 'cloud-rain', // shower rain night
    '10d': 'cloud-drizzle', // rain day
    '10n': 'cloud-drizzle', // rain night
    '11d': 'cloud-lightning', // thunderstorm day
    '11n': 'cloud-lightning', // thunderstorm night
    '13d': 'cloud-snow', // snow day
    '13n': 'cloud-snow', // snow night
    '50d': 'wind', // mist day
    '50n': 'wind', // mist night
  };
  
  // Default icon if we don't have a mapping
  return iconMap[iconCode] || 'cloud';
};

// Helper function to get MaterialCommunityIcons weather icons
const getWeatherIconMaterial = (iconCode: string) => {
  if (!iconCode) return 'weather-cloudy';
  
  const materialIconMap: {[key: string]: string} = {
    '01d': 'weather-sunny', // clear sky day
    '01n': 'weather-night', // clear sky night
    '02d': 'weather-partly-cloudy', // few clouds day
    '02n': 'weather-night-partly-cloudy', // few clouds night
    '03d': 'weather-cloudy', // scattered clouds day
    '03n': 'weather-cloudy', // scattered clouds night
    '04d': 'weather-cloudy', // broken clouds day
    '04n': 'weather-cloudy', // broken clouds night
    '09d': 'weather-pouring', // shower rain day
    '09n': 'weather-pouring', // shower rain night
    '10d': 'weather-rainy', // rain day
    '10n': 'weather-rainy', // rain night
    '11d': 'weather-lightning', // thunderstorm day
    '11n': 'weather-lightning', // thunderstorm night
    '13d': 'weather-snowy', // snow day
    '13n': 'weather-snowy', // snow night
    '50d': 'weather-fog', // mist day
    '50n': 'weather-fog', // mist night
  };
  
  // Default icon if we don't have a mapping
  return materialIconMap[iconCode] || 'weather-cloudy';
};

// Helper to get appropriate icon color
const getWeatherIconColor = (iconCode: string) => {
  if (!iconCode) return '#87CEEB';
  
  if (iconCode.startsWith('01')) return '#FFD700'; // sunny/clear - gold
  if (iconCode.startsWith('02')) return '#87CEEB'; // partly cloudy - sky blue
  if (iconCode.startsWith('03') || iconCode.startsWith('04')) return '#A9A9A9'; // cloudy - gray
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) return '#4169E1'; // rain - royal blue
  if (iconCode.startsWith('11')) return '#9370DB'; // thunderstorm - purple
  if (iconCode.startsWith('13')) return '#E0FFFF'; // snow - light cyan
  if (iconCode.startsWith('50')) return '#708090'; // mist - slate gray
  return '#87CEEB'; // default - sky blue
};

const HomeScreen = ({ navigation }: { navigation: any }) => {
  // Add state for modal
  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState('');
  const { 
    currentWeather, 
    forecast, 
    isLoading, 
    error, 
    fetchForecastForCity, 
    preferredUnits,
    forceRefresh 
  } = useWeatherContext();
  const [userName, setUserName] = useState('');

  // Get temperature unit symbol
  const tempUnit = preferredUnits === 'imperial' ? 'F' : 'C';

  // Fetch weather data when the screen mounts or on location change
  useEffect(() => {
    if (UserData.location) {
      console.log("HomeScreen - Fetching weather for location:", UserData.location);
      fetchForecastForCity(UserData.location);
    }
    // Set user name
    setUserName(UserData.gender === 'female' ? 'Sarah' : UserData.gender === 'male' ? 'Michael' : 'User');
  }, [UserData.location]);

  // Use useFocusEffect to detect when the HomeScreen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("HomeScreen - Screen focused");
      // Force refresh weather data when returning to this screen
      if (UserData.location) {
        console.log("HomeScreen - Refreshing weather on focus for:", UserData.location);
        forceRefresh();
      }
      
      return () => {
        // Cleanup function that runs when the screen is unfocused
        console.log("HomeScreen - Screen unfocused");
      };
    }, [forceRefresh])
  );

  // Navigation handlers
  const handleSeeMoreDetails = () => {
    setActiveModal('details');
    setModalVisible(true);
  };

  const handleViewStyles = () => {
    setActiveModal('styles');
    setModalVisible(true);
  };

  const handleAdjustSchedule = () => {
    setActiveModal('schedule');
    setModalVisible(true);
  };

  const handleHealthTips = () => {
    setActiveModal('health');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Render different popup content based on activeModal
  const renderModalContent = () => {
    switch (activeModal) {
      case 'details':
        return (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="weather-windy" size={adjust(22)} color="#4361EE" />
              <Text style={styles.modalTitle}>Weather Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={adjust(20)} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Current temperature is {currentWeather?.temperature.toFixed(1)}°{currentWeather?.windSpeed ? ` with ${currentWeather?.windSpeed < 10 ? 'light' : 'strong'} wind (${currentWeather?.windSpeed.toFixed(1)}mph)` : ''}
              </Text>
              <View style={styles.modalItem}>
                <Feather name="droplet" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Humidity: {currentWeather?.humidity || 65}%</Text>
              </View>
              <View style={styles.modalItem}>
                <Feather name="thermometer" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Feels like: {currentWeather?.feelsLike.toFixed(1) || 74}°</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="weather-sunset-up" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Sunrise: {currentWeather?.sunrise ? formatTime(currentWeather.sunrise) : '6:24 AM'}</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="weather-sunset-down" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Sunset: {currentWeather?.sunset ? formatTime(currentWeather.sunset) : '8:15 PM'}</Text>
              </View>
            </View>
          </View>
        );
      case 'styles':
        return (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="shirt-outline" size={adjust(22)} color="#4361EE" />
              <Text style={styles.modalTitle}>Outfit Styles</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={adjust(20)} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Recommended outfit for today:</Text>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="tshirt-crew" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Light cotton t-shirt</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="pants" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Casual jeans or chinos</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="shoe-sneaker" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Running shoes for comfort</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="glasses" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Sunglasses for UV protection</Text>
              </View>
            </View>
          </View>
        );
      case 'schedule':
        return (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <FontAwesome5 name="running" size={adjust(22)} color="#4361EE" />
              <Text style={styles.modalTitle}>Schedule Adjustment</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={adjust(20)} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Suggested changes to your schedule:</Text>
              <View style={styles.modalItem}>
                <Ionicons name="time-outline" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Reschedule soccer to 7:00 PM</Text>
              </View>
              <View style={styles.modalItem}>
                <Ionicons name="sunny-outline" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Best time for outdoor run: 8:00 AM</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="umbrella" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Bring umbrella between 6-7 PM</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="shield-sun" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Apply sunscreen before 10 AM run</Text>
              </View>
            </View>
          </View>
        );
      case 'health':
        return (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="alert-circle-outline" size={adjust(22)} color="#4361EE" />
              <Text style={styles.modalTitle}>Health Tips</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={adjust(20)} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Health recommendations for today:</Text>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="flower" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Use allergy medication before going outside</Text>
              </View>
              <View style={styles.modalItem}>
                <Ionicons name="water-outline" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Stay hydrated: aim for 3L of water today</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="sunglasses" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Wear UV-blocking sunglasses when outside</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="hat-fedora" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Use a hat for additional sun protection</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  // Helper function to get proper high/low temperatures
  const getMinMaxTemps = () => {
    if (!currentWeather) return { high: '--', low: '--' };
    
    // If we have forecast data, extract the real min/max for today
    if (forecast && forecast.daily && forecast.daily.length > 0) {
      const todayForecast = forecast.daily[0];
      if (todayForecast.temperature.max !== todayForecast.temperature.min) {
        return {
          high: todayForecast.temperature.max.toFixed(0),
          low: todayForecast.temperature.min.toFixed(0)
        };
      }
    }
    
    // If min and max temps from current weather are the same or not meaningful,
    // create a range around the current temperature
    const baseTemp = currentWeather.temperature;
    const variation = Math.max(2, baseTemp * 0.1); // Use at least 2 degrees variation
    
    return {
      high: Math.round(baseTemp + variation).toString(),
      low: Math.round(baseTemp - variation).toString()
    };
  };

  if (isLoading && !currentWeather) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <LinearGradient
          colors={['#b3d4ff', '#5c85e6']}
          style={[styles.background, styles.centerContent]}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Determine weather description for info card
  const getWeatherDescription = () => {
    if (!currentWeather) return "Perfect weather for your 7 AM run";
    
    const temp = currentWeather.temperature;
    const windSpeed = currentWeather.windSpeed || 0;
    const description = currentWeather.description || '';
    const icon = currentWeather.icon || '';
    
    // Simple logic based on weather conditions
    if (temp < 10) return "It's cold today. Bundle up with a warm jacket!";
    if (temp > 30) return "It's hot out there! Stay hydrated and use sunscreen.";
    
    // Check the weather description/icon
    if (icon.startsWith('01')) return "It's a clear, beautiful day. Enjoy the sunshine!";
    if (description.includes('rain') || icon.startsWith('09') || icon.startsWith('10')) 
      return "It's rainy today. Don't forget your umbrella!";
    if (icon.startsWith('11')) return "Thunderstorms in the area. Stay indoors if possible.";
    if (icon.startsWith('13')) return "It's snowing! Bundle up and drive carefully.";
    if (icon.startsWith('50')) return "Foggy conditions. Take care when driving.";
    
    if (windSpeed > 15) return "It's chilly & windy today. Wear your favorite windbreaker & cap!";
    if (description.includes('cloud')) return "It's cloudy today, but mild. Light jacket recommended.";
    
    // Default description
    return "Pleasant weather today. Enjoy your day!";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LinearGradient
        colors={['#b3d4ff', '#5c85e6']}
        style={styles.background}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header with greeting */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}, {userName}!</Text>
              <Text style={styles.subGreeting}>{currentWeather?.description ? currentWeather.description : "Loading weather..."}</Text>
            </View>
          </View>

          {/* Weather Card */}
          <View style={styles.weatherCard}>
            {/* Current temperature */}
            <View style={styles.currentTemp}>
              <Text style={styles.tempValue}>{currentWeather?.temperature.toFixed(0) || '--'}°{tempUnit}</Text>
              {/* Weather icon */}
              <View style={styles.weatherIcon}>
                {currentWeather?.icon ? (
                  <MaterialCommunityIcons 
                    name={getWeatherIconMaterial(currentWeather.icon)} 
                    size={adjust(28)} 
                    color={getWeatherIconColor(currentWeather.icon)} 
                  />
                ) : (
                  <MaterialCommunityIcons name="weather-partly-cloudy" size={adjust(28)} color="#A9A9A9" />
                )}
              </View>
            </View>
            
            {/* High/Low temperature */}
            <View style={styles.tempMinMax}>
              <Text style={styles.tempRangeText}>Hi {getMinMaxTemps().high}° Lo {getMinMaxTemps().low}°</Text>
            </View>

            {/* Hourly forecast */}
            {forecast && forecast.hourly && forecast.hourly.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hourlyForecastScroll}
              >
                {forecast.hourly.map((hour, index) => {
                  // Format the timestamp to get the hour
                  const date = new Date(hour.date * 1000);
                  const timeDisplay = index === 0 ? 'Now' : formatHour(hour.date);
                  
                  return (
                    <View key={`hour-${index}`} style={styles.hourBlock}>
                      <Text style={styles.hourText}>{timeDisplay}</Text>
                      <MaterialCommunityIcons 
                        name={getWeatherIconMaterial(hour.weather.icon)} 
                        size={adjust(18)} 
                        color={getWeatherIconColor(hour.weather.icon)} 
                      />
                      <Text style={styles.hourTemp}>{hour.temperature.day.toFixed(0)}°</Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.hourlyForecast}>
                <View style={styles.hourBlock}>
                  <Text style={styles.hourText}>--</Text>
                  <ActivityIndicator size="small" color="#4361EE" />
                  <Text style={styles.hourTemp}>--°</Text>
                </View>
              </View>
            )}
          </View>

          {/* Weather Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <MaterialCommunityIcons 
                name="weather-windy" 
                size={adjust(20)} 
                color="#4361EE" 
                style={styles.infoIcon} 
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoText}>
                  {getWeatherDescription()}
                </Text>
                <Text style={styles.commuteText}>
                  {currentWeather?.location ? `Weather in ${currentWeather.location}, ${currentWeather.country}` : "Loading location data..."}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={handleSeeMoreDetails}
            >
              <Text style={styles.detailsButtonText}>See More Details</Text>
            </TouchableOpacity>
          </View>

          {/* Outfit Card */}
          <View style={styles.outfitCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="shirt-outline" size={adjust(18)} color="#4361EE" />
              <Text style={styles.cardTitle}>Today's Outfit</Text>
            </View>
            <Text style={styles.outfitText}>
              Skylar's picked today's best casual look for cool weather
            </Text>
            <TouchableOpacity 
              style={styles.outfitButton}
              onPress={handleViewStyles}
            >
              <Text style={styles.outfitButtonText}>View Styles</Text>
            </TouchableOpacity>
          </View>

          {/* Routine Card */}
          <View style={styles.routineCard}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="running" size={adjust(18)} color="#4361EE" />
              <Text style={styles.cardTitle}>Routine Suggestion</Text>
            </View>
            <Text style={styles.routineText}>
              Evening soccer at 5 PM might see rain. Skylar recommends indoor practice or delaying to 7 PM.
            </Text>
            <TouchableOpacity 
              style={styles.routineButton}
              onPress={handleAdjustSchedule}
            >
              <Text style={styles.routineButtonText}>Adjust Schedule</Text>
            </TouchableOpacity>
          </View>

          {/* Health Alert Card */}
          <View style={styles.healthCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="alert-circle-outline" size={adjust(18)} color="#4361EE" />
              <Text style={styles.cardTitle}>Health Alert</Text>
            </View>
            <View style={styles.healthAlerts}>
              <View style={styles.healthAlert}>
                <Ionicons name="arrow-forward" size={adjust(12)} color="#4361EE" />
                <Text style={styles.healthAlertText}>High pollen count today</Text>
              </View>
              <View style={styles.healthAlert}>
                <Ionicons name="sunny-outline" size={adjust(12)} color="#4361EE" />
                <Text style={styles.healthAlertText}>Strong UV rays 1-4 PM</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.healthButton}
              onPress={handleHealthTips}
            >
              <Text style={styles.healthButtonText}>More Health Tips</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal for popup cards */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                {renderModalContent()}
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#b3d4ff',
  },
  background: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: adjust(16),
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: adjust(20),
    paddingBottom: adjust(20),
  },
  header: {
    marginTop: adjust(10),
    marginBottom: adjust(15),
  },
  greeting: {
    fontSize: adjust(20),
    fontWeight: '600',
    color: '#333',
  },
  subGreeting: {
    fontSize: adjust(14),
    color: '#666',
    marginTop: adjust(2),
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(16),
    marginBottom: adjust(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentTemp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: adjust(5),
  },
  tempValue: {
    fontSize: adjust(45),
    fontWeight: '600',
    color: '#333',
  },
  tempMinMax: {
    marginBottom: adjust(20),
  },
  tempRangeText: {
    fontSize: adjust(14),
    color: '#666',
    fontWeight: '500',
  },
  weatherIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourlyForecastScroll: {
    paddingHorizontal: adjust(5),
    flexDirection: 'row',
  },
  hourlyForecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: adjust(8),
    paddingHorizontal: adjust(5),
  },
  hourBlock: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: adjust(10),
    paddingVertical: adjust(8),
    paddingHorizontal: adjust(10),
    marginRight: adjust(10),
    minWidth: adjust(48),
  },
  hourText: {
    fontSize: adjust(12),
    color: '#333',
    marginBottom: adjust(6),
    fontWeight: '500',
  },
  hourTemp: {
    fontSize: adjust(14),
    color: '#333',
    fontWeight: '600',
    marginTop: adjust(6),
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(14),
    marginBottom: adjust(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContent: {
    flexDirection: 'row',
    marginBottom: adjust(12),
  },
  infoIcon: {
    marginRight: adjust(12),
    marginTop: adjust(2),
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: adjust(13),
    color: '#333',
    marginBottom: adjust(4),
    lineHeight: adjust(18),
  },
  commuteText: {
    fontSize: adjust(11),
    color: '#666',
    fontStyle: 'italic',
  },
  detailsButton: {
    backgroundColor: '#4974FF',
    borderRadius: adjust(10),
    paddingVertical: adjust(10),
    paddingHorizontal: adjust(22),
    alignSelf: 'center',
    width: '80%',
  },
  detailsButtonText: {
    fontSize: adjust(12),
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  outfitCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(14),
    marginBottom: adjust(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(10),
  },
  cardTitle: {
    fontSize: adjust(13),
    fontWeight: '600',
    color: '#333',
    marginLeft: adjust(8),
  },
  outfitText: {
    fontSize: adjust(12),
    color: '#666',
    marginBottom: adjust(12),
    lineHeight: adjust(18),
  },
  outfitButton: {
    backgroundColor: '#f9d057',
    borderRadius: adjust(10),
    paddingVertical: adjust(10),
    paddingHorizontal: adjust(22),
    alignSelf: 'center',
    width: '80%',
  },
  outfitButtonText: {
    fontSize: adjust(12),
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  routineCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(14),
    marginBottom: adjust(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routineText: {
    fontSize: adjust(12),
    color: '#666',
    marginBottom: adjust(12),
    lineHeight: adjust(18),
  },
  routineButton: {
    backgroundColor: '#4974FF',
    borderRadius: adjust(10),
    paddingVertical: adjust(10),
    paddingHorizontal: adjust(22),
    alignSelf: 'center',
    width: '80%',
  },
  routineButtonText: {
    fontSize: adjust(12),
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(14),
    marginBottom: adjust(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthAlerts: {
    marginBottom: adjust(12),
  },
  healthAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(6),
  },
  healthAlertText: {
    fontSize: adjust(12),
    color: '#666',
    marginLeft: adjust(8),
  },
  healthButton: {
    backgroundColor: '#f9d057',
    borderRadius: adjust(10),
    paddingVertical: adjust(10),
    paddingHorizontal: adjust(22),
    alignSelf: 'center',
    width: '80%',
  },
  healthButtonText: {
    fontSize: adjust(12),
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    width: '85%',
    padding: adjust(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(15),
  },
  modalTitle: {
    fontSize: adjust(16),
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: adjust(10),
  },
  closeButton: {
    width: adjust(28),
    height: adjust(28),
    borderRadius: adjust(14),
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: adjust(5),
  },
  modalText: {
    fontSize: adjust(14),
    color: '#666',
    marginBottom: adjust(15),
    lineHeight: adjust(20),
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(12),
  },
  modalItemIcon: {
    marginRight: adjust(10),
  },
  modalItemText: {
    fontSize: adjust(13),
    color: '#333',
  },
});

export default HomeScreen;