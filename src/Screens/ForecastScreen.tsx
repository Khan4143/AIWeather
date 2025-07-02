import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Image,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import adjust from '../utils/adjust';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants/dimesions';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import useWeather from '../hooks/useWeather';
import { format } from 'date-fns';
import { ForecastData, WeatherData, validateCity } from '../services/weatherService';
import { useWeatherContext } from '../contexts/WeatherContext';
import { UserData } from '../Screens/UserInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash/debounce';
import { UserDataManager } from '../utils/userDataManager';

type ForecastScreenProps = {
  navigation: StackNavigationProp<any>;
};

// Storage key for saved cities
const SAVED_CITIES_KEY = 'skylar_saved_cities';

const POPULAR_CITIES = [
  'New York, US', 'Los Angeles, US', 'London, GB', 'Tokyo, JP', 'Paris, FR', 'Berlin, DE', 'Sydney, AU',
  'Mumbai, IN', 'Beijing, CN', 'Rio de Janeiro, BR', 'Cairo, EG', 'Moscow, RU', 'Toronto, CA', 'Rome, IT',
  'Madrid, ES', 'Amsterdam, NL', 'Dubai, AE', 'Mexico City, MX', 'Bangkok, TH', 'Singapore, SG',
  'Stockholm, SE', 'Istanbul, TR', 'Seoul, KR', 'Buenos Aires, AR', 'Nairobi, KE', 'Vienna, AT',
  'Athens, GR', 'Copenhagen, DK', 'Brussels, BE', 'Helsinki, FI', 'Lisbon, PT', 'Zurich, CH', 'Oslo, NO',
  'Warsaw, PL', 'Prague, CZ', 'Budapest, HU', 'Auckland, NZ', 'Jakarta, ID', 'Manila, PH', 'Kuala Lumpur, MY',
  'Santiago, CL', 'Bogota, CO', 'Lima, PE', 'Johannesburg, ZA', 'Cape Town, ZA',
];
const API_KEY = '87b449b894656bb5d85c61981ace7d25';
interface CityObject { key: string; display: string; isDefault?: boolean; }

// Google Places API Key
const GOOGLE_PLACES_API_KEY = 'AIzaSyAJcSmb8jAEU5qVlzR3sTRcraWxb38B31w';

type RouteParams = {
  openCityModal?: boolean;
  fromHomeScreen?: boolean;
};

const ForecastScreen = ({ navigation }: ForecastScreenProps) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [citySearchModalVisible, setCitySearchModalVisible] = useState(false);
  const route = useRoute();
  const params = route.params as RouteParams;

  // Use WeatherContext for current location and forecast
  const { forecast, isLoading: isLoadingWeather, error, fetchForecastForCity } = useWeatherContext();
  const [location, setLocation] = useState<string | null>(null);

  // State for city search and management
  const [searchQuery, setSearchQuery] = useState('');
  const [savedCities, setSavedCities] = useState<CityObject[]>([]);
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);

  // When the forecast updates, update our displayed location
  useEffect(() => {
    if (forecast && forecast.location) {
      setLocation(forecast.location);
    }
  }, [forecast]);

  // Ensure we have weather data on initial load
  useEffect(() => {
    const userDataLocation = UserData.location;
    
    // If we don't have forecast data, but we do have a location, fetch it
    if (!forecast && !isLoadingWeather && userDataLocation) {
      fetchForecastForCity(userDataLocation);
    }
  }, [forecast, isLoadingWeather, fetchForecastForCity]);

  // Watch for changes to UserData.location
  useEffect(() => {
    const userDataLocation = UserData.location;
    if (userDataLocation) {
      // Update saved cities to reflect new default location
      const updatedCities = savedCities.map(city => ({
        ...city,
        isDefault: city.display === userDataLocation
      }));
      
      // If the default location isn't in the list, add it
      if (!updatedCities.some(city => city.display === userDataLocation)) {
        updatedCities.push({
          key: `default-${userDataLocation}-${Date.now()}`,
          display: userDataLocation,
          isDefault: true
        });
      }
      
      setSavedCities(updatedCities);
      saveCities(updatedCities);
    }
  }, [UserData.location]);

  // Use forecast as weatherData
  const weatherData: ForecastData | null = forecast;

  // Map OpenWeather icon codes to MaterialCommunityIcons
  const mapWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': 'weather-sunny',
      '01n': 'weather-night',
      '02d': 'weather-partly-cloudy',
      '02n': 'weather-night-partly-cloudy',
      '03d': 'weather-cloudy',
      '03n': 'weather-cloudy',
      '04d': 'weather-cloudy',
      '04n': 'weather-cloudy',
      '09d': 'weather-pouring',
      '09n': 'weather-pouring',
      '10d': 'weather-rainy',
      '10n': 'weather-rainy',
      '11d': 'weather-lightning',
      '11n': 'weather-lightning',
      '13d': 'weather-snowy',
      '13n': 'weather-snowy',
      '50d': 'weather-fog',
      '50n': 'weather-fog'
    };

    return iconMap[iconCode] || 'weather-cloudy';
  };

  // Get weather icon based on condition
  const getWeatherIcon = (iconCode: string): string => {
    console.log('Received weather icon code:', iconCode);
    if (!iconCode) return 'weather-cloudy';
    
    // Enhanced icon mapping with more accurate weather states
    const materialIconMap: {[key: string]: string} = {
      // Clear sky
      '01d': 'weather-sunny', // clear sky day
      '01n': 'weather-night', // clear sky night
      
      // Few clouds (11-25%)
      '02d': 'weather-partly-cloudy', // few clouds day
      '02n': 'weather-night-partly-cloudy', // few clouds night
      
      // Scattered clouds (25-50%)
      '03d': 'weather-cloudy', // scattered clouds day
      '03n': 'weather-cloudy', // scattered clouds night
      
      // Broken/overcast clouds (51-100%)
      '04d': 'weather-cloudy', // broken clouds day
      '04n': 'weather-cloudy', // broken clouds night
      
      // Shower rain - intermittent intense rain
      '09d': 'weather-pouring', // shower rain day
      '09n': 'weather-pouring', // shower rain night
      
      // Rain - continuous precipitation
      '10d': 'weather-rainy', // rain day
      '10n': 'weather-rainy', // rain night
      
      // Thunderstorm
      '11d': 'weather-lightning', // thunderstorm day
      '11n': 'weather-lightning', // thunderstorm night
      
      // Snow
      '13d': 'weather-snowy', // snow day
      '13n': 'weather-snowy', // snow night
      
      // Mist/fog/haze
      '50d': 'weather-fog', // mist day
      '50n': 'weather-fog', // mist night
    };
    
    // Get the mapped icon or fall back to cloudy
    const iconName = materialIconMap[iconCode] || 'weather-cloudy';
    console.log('Mapped to icon:', iconName);
    return iconName;
  };

  // Get appropriate icon color based on weather condition
  const getWeatherIconColor = (iconCode: string): string => {
    if (!iconCode) return '#4361EE'; // Default color
    
    // Extract the condition code and day/night indicator
    const conditionCode = iconCode.substring(0, 2);
    const isDayTime = iconCode.endsWith('d');
    
    // Color mapping based on weather condition and time of day
    switch(conditionCode) {
      case '01': // clear sky
        return isDayTime ? '#FF9500' : '#3A4CA8'; // orange for day, navy for night
      
      case '02': // few clouds
        return isDayTime ? '#4361EE' : '#3A4CA8'; // app blue for day, darker blue for night
      
      case '03': // scattered clouds
      case '04': // broken clouds
        return isDayTime ? '#4361EE' : '#2B3990'; // app blue for day, darker blue for night
      
      case '09': // shower rain
        return isDayTime ? '#4361EE' : '#2B3990'; // app blue for day, darker blue for night
      
      case '10': // rain
        return isDayTime ? '#5D9CEC' : '#2B3990'; // lighter blue for day, darker blue for night
      
      case '11': // thunderstorm
        return isDayTime ? '#9370DB' : '#6A0DAD'; // medium purple for day, darker purple for night
      
      case '13': // snow
        return isDayTime ? '#5D9CEC' : '#2B3990'; // light blue for day, darker blue for night
      
      case '50': // mist/fog
        return isDayTime ? '#4361EE' : '#2B3990'; // app blue for day, darker blue for night
    }
    
    // Default fallback - use app's primary blue
    return '#4361EE';
  };

  // Format time from a date string
  const formatTime = (timeStr: string): string => {
    try {
      const date = new Date(timeStr);
      return format(date, 'h a'); // Example: "3 PM"
    } catch (e) {
      return timeStr;
    }
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return format(date, 'EEE, MMM d'); // Example: "Mon, Jan 1"
    } catch (e) {
      return dateStr;
    }
  };

  // Render the current day's detailed forecast
  const renderDetailedForecast = () => {
    if (!weatherData || isLoadingWeather) {
      return <ActivityIndicator size="large" color="#4361EE" />;
    }

    const currentForecast = weatherData.daily[selectedDay];
    const currentWeather = selectedDay === 0 ? weatherData.current : null;
    // For hourly, use weatherData.hourly (first 8 for today, or filter by date for other days)
    let hourlyData = weatherData.hourly;
    if (selectedDay !== 0) {
      const selectedDate = new Date(currentForecast.date * 1000).getDate();
      hourlyData = weatherData.hourly.filter(h => new Date(h.date * 1000).getDate() === selectedDate);
    } else {
      hourlyData = weatherData.hourly.slice(0, 8);
    }

    return (
      <View style={styles.detailedForecastContainer}>
        <Text style={styles.dateHeader}>
          {selectedDay === 0 
            ? 'Today, ' + formatDate(new Date(currentForecast.date * 1000).toISOString())
            : formatDate(new Date(currentForecast.date * 1000).toISOString())}
        </Text>
        <View style={styles.currentConditionsContainer}>
          <View style={styles.temperatureContainer}>
            <Text style={styles.currentTemp}>
              {selectedDay === 0
                ? `${Math.round(currentWeather?.temperature || 0)}°C`
                : `${Math.round(currentForecast.temperature.max)}°C`}
            </Text>
            <Text style={styles.minMaxTemp}>
              {`${Math.round(currentForecast.temperature.max)}°/${Math.round(currentForecast.temperature.min)}°`}
            </Text>
          </View>
          <View style={styles.conditionContainer}>
            <MaterialCommunityIcons
              name={getWeatherIcon(currentForecast.weather.icon)}
              size={adjust(48)}
              color={getWeatherIconColor(currentForecast.weather.icon)}
            />
            <Text style={styles.conditionText}>{currentForecast.weather.description}</Text>
          </View>
        </View>
        {/* Horizontal scrollable weather details */}
        <Text style={styles.sectionTitle}>Hourly Forecast</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourlyForecastContainer}
        >
          {hourlyData.map((hour, index) => (
            <View key={index} style={styles.hourlyForecastItem}>
              <Text style={styles.hourlyTime}>{formatTime(new Date(hour.date * 1000).toISOString())}</Text>
              <MaterialCommunityIcons
                name={getWeatherIcon(hour.weather.icon)}
                size={adjust(24)}
                color={getWeatherIconColor(hour.weather.icon)}
              />
              <Text style={styles.hourlyTemp}>{Math.round(hour.temperature.day)}°</Text>
              <View style={styles.rainChanceContainer}>
                <MaterialCommunityIcons name="water" size={adjust(12)} color="#5D9CEC" />
                <Text style={styles.rainChanceText}>{Math.round((hour.pop || 0) * 100)}%</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        {/* Additional weather details */}
        <Text style={styles.sectionTitle}>Weather Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="weather-windy" size={adjust(20)} color="#4361EE" />
            <Text style={styles.detailLabel}>Wind</Text>
            <Text style={styles.detailValue}>
              {selectedDay === 0
                ? `${currentWeather?.windSpeed} km/h`
                : `${currentForecast.windSpeed} km/h`}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="water-percent" size={adjust(20)} color="#4361EE" />
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>
              {selectedDay === 0
                ? `${currentWeather?.humidity}%`
                : `${currentForecast.humidity}%`}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="weather-sunset-up" size={adjust(20)} color="#4361EE" />
            <Text style={styles.detailLabel}>Sunrise</Text>
            <Text style={styles.detailValue}>{new Date(currentForecast.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="weather-sunset-down" size={adjust(20)} color="#4361EE" />
            <Text style={styles.detailLabel}>Sunset</Text>
            <Text style={styles.detailValue}>{new Date(currentForecast.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="sunglasses" size={adjust(20)} color="#4361EE" />
            <Text style={styles.detailLabel}>UV Index</Text>
            <Text style={styles.detailValue}>{currentForecast.uvi}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="weather-rainy" size={adjust(20)} color="#4361EE" />
            <Text style={styles.detailLabel}>Rain Chance</Text>
            <Text style={styles.detailValue}>{Math.round((currentForecast.pop || 0) * 100)}%</Text>
          </View>
        </View>
      </View>
    );
  };

  // Load saved cities on mount
  useEffect(() => {
    loadSavedCities();
  }, []);

  // Load saved cities from storage
  const loadSavedCities = async () => {
    try {
      const savedCitiesJson = await AsyncStorage.getItem(SAVED_CITIES_KEY);
      if (savedCitiesJson) {
        const cities = JSON.parse(savedCitiesJson);
        // Update isDefault flag based on UserData.location
        const updatedCities = cities.map((city: CityObject) => ({
          ...city,
          isDefault: city.display === UserData.location
        }));
        setSavedCities(updatedCities);
        saveCities(updatedCities); // Save the updated cities back to storage
      } else if (UserData.location) {
        // If no saved cities but we have a default location, add it
        const defaultCity: CityObject = {
          key: `default-${UserData.location}-${Date.now()}`,
          display: UserData.location,
          isDefault: true
        };
        setSavedCities([defaultCity]);
        saveCities([defaultCity]);
      }
    } catch (error) {
      console.error('Error loading saved cities:', error);
    }
  };

  // Save cities to storage
  const saveCities = async (cities: CityObject[]) => {
    try {
      await AsyncStorage.setItem(SAVED_CITIES_KEY, JSON.stringify(cities));
    } catch (error) {
      console.error('Error saving cities:', error);
    }
  };

  // Remove a saved city
  const removeSavedCity = useCallback((cityKey: string) => {
    const cityToRemove = savedCities.find(city => city.key === cityKey);
    if (cityToRemove?.isDefault) {
      Alert.alert(
        "Can't Remove Default Location",
        "This is your default location set in your profile. You can change it in the Settings screen.",
        [{ text: 'OK' }]
      );
      return;
    }
    
    const updatedCities = savedCities.filter(city => city.key !== cityKey);
    setSavedCities(updatedCities);
    saveCities(updatedCities);
  }, [savedCities, saveCities]);

  // Fetch from Google Places API
  const searchPlaces = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setPlacesResults([]);
      return;
    }
    
    try {
      setIsPlacesLoading(true);
      
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
      setIsPlacesLoading(false);
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
  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
    
    if (text.length < 2) {
      setPlacesResults([]);
    } else {
      debouncedSearchPlaces(text);
    }
  };
  
  // Handle place selection
  const handlePlaceSelected = async (placeId: string, description: string) => {
    try {
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
        
        // Create city object
        const cityObj: CityObject = {
          key: `${placeId}-${Date.now()}`,
          display: formattedAddress || description,
          isDefault: false
        };
        
        // Process the selected city
        selectCity(cityObj);
        
        // Clear search
        setSearchQuery('');
        setPlacesResults([]);
      }
    } catch (error) {
      console.error('Error selecting place:', error);
    }
  };

  // Select a city to display weather for
  const selectCity = useCallback((city: CityObject) => {
    // Update the UserData location directly
    UserData.location = city.display;
    
    // Update local state for UI
    setLocation(city.display);
    
    // Fetch forecast for the selected city
    fetchForecastForCity(city.display);
    
    // Save to persistent storage via UserDataManager
    UserDataManager.saveUserProfile();
    
    // If this isn't a saved city yet, add it
    const isSaved = savedCities.some(savedCity => savedCity.display === city.display);
    if (!isSaved) {
      // Check if this is the default location from UserData
      const isDefaultLocation = city.display === UserData.location;
      const updatedCities = [...savedCities, { ...city, isDefault: isDefaultLocation }];
      setSavedCities(updatedCities);
      saveCities(updatedCities);
    }
    
    // Close the modal and handle navigation
    setCitySearchModalVisible(false);
    if (params?.fromHomeScreen) {
      navigation.goBack();
    }
  }, [fetchForecastForCity, savedCities, saveCities, navigation, params?.fromHomeScreen]);

  // Add a city to saved cities
  const addCity = useCallback((city: CityObject) => {
    if (!savedCities.some(savedCity => savedCity.display === city.display)) {
      const updatedCities = [...savedCities, { ...city, isDefault: false }];
      setSavedCities(updatedCities);
      saveCities(updatedCities);
      
      // Select the city after adding it
      selectCity(city);
    }
  }, [savedCities, saveCities, selectCity]);

  // Toggle the city search modal
  const toggleCitySearchModal = () => {
    setCitySearchModalVisible(!citySearchModalVisible);
    // If closing modal and we came from HomeScreen, navigate back
    if (citySearchModalVisible && params?.fromHomeScreen) {
      navigation.goBack();
    }
    if (!citySearchModalVisible) {
      setSearchQuery('');
      setPlacesResults([]);
    }
  };

  // Effect to handle modal opening from route params
  useEffect(() => {
    if (params?.openCityModal) {
      setCitySearchModalVisible(true);
    }
  }, [params?.openCityModal]);

  if (!weatherData && isLoadingWeather) {
    return (
      <View style={{ flex: 1, backgroundColor: '#b3d4ff' }}>
        <SafeAreaViewRN style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4361EE" />
            <Text style={styles.loadingText}>Loading weather data...</Text>
          </View>
        </SafeAreaViewRN>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#b3d4ff' }}>
      <SafeAreaViewRN style={styles.safeArea}>
        {/* Header with location */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={toggleCitySearchModal}
          >
            <MaterialIcons name="location-on" size={adjust(16)} color="#4361EE" />
            <Text style={styles.locationText}>{location}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addCityButton}
            onPress={toggleCitySearchModal} 
          >
            <Ionicons name="add" size={adjust(24)} color="#4361EE" />
          </TouchableOpacity>
        </View>

        {/* Main scrollable content */}
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* 5-Day forecast cards */}
          <View style={styles.forecastCardsContainer}>
            <Text style={styles.forecastCardsTitle}>5-Day Forecast</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.forecastDaysScrollContent}
              style={styles.forecastDaysScroll}
            >
              {weatherData?.daily.slice(0, 5).map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.forecastDayCard,
                    selectedDay === index && styles.selectedDayCard,
                  ]}
                  onPress={() => setSelectedDay(index)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.forecastDayText,
                      selectedDay === index && styles.selectedDayText,
                    ]}
                  >
                    {index === 0 ? 'Today' : format(new Date(day.date * 1000), 'EEE')}
                  </Text>
                  <MaterialCommunityIcons
                    name={getWeatherIcon(day.weather.icon)}
                    size={adjust(28)}
                    color={selectedDay === index ? '#FFF' : getWeatherIconColor(day.weather.icon)}
                    style={{ marginVertical: adjust(2) }}
                  />
                  <Text
                    style={[
                      styles.forecastDayTemp,
                      selectedDay === index && styles.selectedDayText,
                    ]}
                  >
                    {Math.round(day.temperature.max)}°/{Math.round(day.temperature.min)}°
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.spacer} />
          {/* Detailed forecast for the selected day */}
          {renderDetailedForecast()}
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaViewRN>
      
      {/* City Search Modal */}
      <Modal
        visible={citySearchModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={toggleCitySearchModal}
      >
        <LinearGradient
          colors={['#b3d4ff', '#5c85e6']}
          style={{flex: 1}}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}
          >
            <SafeAreaViewRN style={styles.cityModalContainer}>
              {/* Header */}
              <View style={styles.modalHeaderContainer}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.cityModalTitle}>Search & Manage Cities</Text>
                </View>
                <TouchableOpacity 
                  onPress={toggleCitySearchModal}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={adjust(20)} color="#333" />
                </TouchableOpacity>
              </View>
              
              {/* City Search Input */}
              <View style={styles.citySearchInputContainer}>
                <Ionicons name="search" size={adjust(20)} color="#666" style={styles.citySearchIcon} />
                <TextInput
                  style={styles.citySearchInput}
                  placeholder="Search for a city..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearchInputChange}
                  returnKeyType="search"
                  autoCapitalize="words"
                  autoComplete="off"
                />
              </View>
              
              {/* City Search Results */}
              {searchQuery.length > 0 && (
                <View style={styles.citySuggestionsContainer}>
                  {isPlacesLoading ? (
                    <View style={styles.cityLoadingContainer}>
                      <ActivityIndicator size="small" color="#4361EE" />
                      <Text style={styles.cityLoadingText}>Searching cities...</Text>
                    </View>
                  ) : placesResults.length > 0 ? (
                    <View style={styles.suggestionsCard}>
                      <FlatList
                        data={placesResults}
                        keyExtractor={(item) => item.place_id}
                        renderItem={({ item }) => (
                          <TouchableOpacity 
                            style={styles.citySuggestionItem}
                            onPress={() => handlePlaceSelected(item.place_id, item.description)}
                          >
                            <View style={styles.citySuggestionTextContainer}>
                              <Ionicons name="location-outline" size={adjust(16)} color="#4361EE" />
                              <View style={styles.cityTextWrapper}>
                                <Text style={styles.cityMainText}>
                                  {item.structured_formatting?.main_text || item.description.split(',')[0]}
                                </Text>
                                {(item.structured_formatting?.secondary_text || item.description.includes(',')) && (
                                  <Text style={styles.citySecondaryText}>
                                    {item.structured_formatting?.secondary_text || 
                                     item.description.split(',').slice(1).join(',').trim()}
                                  </Text>
                                )}
                              </View>
                            </View>
                            <TouchableOpacity 
                              style={styles.addCityIcon}
                              onPress={(e) => {
                                e.stopPropagation();
                                const parts = item.description.split(',').map((part: string) => part.trim());
                                const city = parts[0];
                                const countryCode = parts.length > 1 ? parts[parts.length - 1] : '';
                                const cityObj: CityObject = {
                                  key: `${city}-${countryCode}-${Date.now()}`,
                                  display: item.description,
                                  isDefault: false
                                };
                                addCity(cityObj);
                              }}
                            >
                              <Ionicons name="add-circle" size={adjust(22)} color="#4361EE" />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        )}
                        style={styles.citySuggestionsList}
                      />
                    </View>
                  ) : (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No cities found</Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* Saved Cities Section */}
              <View style={styles.savedCitiesSection}>
                <Text style={styles.savedCitiesTitle}>Saved Cities</Text>
                <View style={styles.savedCitiesList}>
                  {savedCities.length === 0 ? (
                    <Text style={styles.noSavedCitiesText}>
                      No saved cities yet. Search for a city and tap the + icon to save it.
                    </Text>
                  ) : (
                    <FlatList
                      data={savedCities}
                      keyExtractor={(item) => item.key}
                      renderItem={({ item }) => (
                        <View style={styles.savedCityItem}>
                          <TouchableOpacity 
                            style={styles.savedCityTextContainer}
                            onPress={() => selectCity(item)}
                          >
                            <Ionicons 
                              name={item.isDefault ? "location" : "location-outline"} 
                              size={adjust(16)} 
                              color="#4361EE" 
                            />
                            <Text style={styles.savedCityText}>{item.display}</Text>
                          </TouchableOpacity>
                          {!item.isDefault && (
                            <TouchableOpacity 
                              onPress={() => removeSavedCity(item.key)}
                              style={styles.removeCityButton}
                            >
                              <Ionicons name="close-circle" size={adjust(20)} color="#FF6B6B" />
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    />
                  )}
                </View>
              </View>
            </SafeAreaViewRN>
          </KeyboardAvoidingView>
        </LinearGradient>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: adjust(15),
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: adjust(10),
    fontSize: adjust(16),
    color: '#4361EE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: adjust(16),
    paddingVertical: adjust(8),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: adjust(16),
    fontWeight: '600',
    color: '#333',
    marginLeft: adjust(5),
  },
  forecastDayCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(12),
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedDayCard: {
    backgroundColor: '#4361EE',
    shadowOpacity: 0.18,
  },
  forecastDayText: {
    fontSize: adjust(12),
    fontWeight: '500',
    color: '#333',
    marginBottom: adjust(5),
  },
  selectedDayText: {
    color: 'white',
  },
  forecastDayTemp: {
    fontSize: adjust(12),
    fontWeight: '500',
    color: '#333',
    marginTop: adjust(5),
  },
  detailedForecastContainer: {
    backgroundColor: 'white',
    borderRadius: adjust(16),
    marginHorizontal: adjust(0),
    marginBottom: adjust(0),
  },
  dateHeader: {
    fontSize: adjust(18),
    fontWeight: '600',
    color: '#333',
    paddingTop: adjust(16),
    paddingHorizontal: adjust(16),
    paddingBottom: adjust(12),
  },
  currentConditionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: adjust(16),
    paddingBottom: adjust(16),
  },
  temperatureContainer: {
    flex: 1,
  },
  currentTemp: {
    fontSize: adjust(36),
    fontWeight: '700',
    color: '#333',
  },
  minMaxTemp: {
    fontSize: adjust(14),
    color: '#666',
    marginTop: adjust(4),
  },
  conditionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionText: {
    fontSize: adjust(14),
    color: '#333',
    textAlign: 'center',
    marginTop: adjust(8),
  },
  sectionTitle: {
    fontSize: adjust(16),
    fontWeight: '600',
    color: '#333',
    paddingTop: adjust(16),
    paddingHorizontal: adjust(16),
    paddingBottom: adjust(12),
  },
  hourlyForecastContainer: {
    paddingBottom: adjust(16),
    paddingHorizontal: adjust(16),
  },
  hourlyForecastItem: {
    alignItems: 'center',
    marginRight: adjust(20),
    width: adjust(40),
  },
  hourlyTime: {
    fontSize: adjust(12),
    color: '#666',
    marginBottom: adjust(5),
  },
  hourlyTemp: {
    fontSize: adjust(14),
    fontWeight: '500',
    color: '#333',
    marginVertical: adjust(5),
  },
  rainChanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rainChanceText: {
    fontSize: adjust(12),
    color: '#5D9CEC',
    marginLeft: adjust(2),
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: adjust(8),
    marginRight: adjust(10),
    marginLeft: adjust(10),
  },
  detailItem: {
    width: '48%',
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: adjust(12),
    padding: adjust(12),
    marginBottom: adjust(10),
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: adjust(12),
    color: '#666',
    marginTop: adjust(4),
  },
  detailValue: {
    fontSize: adjust(14),
    fontWeight: '500',
    color: '#333',
    marginTop: adjust(2),
  },
  spacer: {
    height: adjust(40),
  },
  forecastCardsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: adjust(16),
    marginTop: adjust(12),
    marginBottom: adjust(0),
    marginHorizontal: adjust(0),
  },
  forecastCardsTitle: {
    fontSize: adjust(18),
    fontWeight: '600',
    color: '#333',
    paddingTop: adjust(16),
    paddingHorizontal: adjust(16),
    paddingBottom: adjust(12),
  },
  forecastDaysScroll: {
    paddingBottom: adjust(16),
  },
  forecastDaysScrollContent: {
    paddingHorizontal: adjust(16),
    gap: adjust(12),
  },
  cityModalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: adjust(16),
    paddingTop: adjust(16),
    paddingBottom: adjust(12),
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityModalTitle: {
    fontSize: adjust(18),
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: adjust(8),
    borderRadius: adjust(20),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginLeft: adjust(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  citySearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: adjust(10),
    margin: adjust(16),
    marginBottom: adjust(8),
    padding: adjust(12),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  citySearchIcon: {
    marginRight: adjust(10),
    marginLeft: adjust(5),
    color: '#4361EE',
  },
  citySearchInput: {
    flex: 1,
    fontSize: adjust(16),
    color: '#333',
    padding: adjust(4),
  },
  citySuggestionsContainer: {
    margin: adjust(16),
    marginTop: adjust(4),
    marginBottom: adjust(8),
    maxHeight: SCREEN_HEIGHT * 0.3,
  },
  suggestionsCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(10),
    padding: adjust(8),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  cityLoadingContainer: {
    padding: adjust(16),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: adjust(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cityLoadingText: {
    marginLeft: adjust(10),
    fontSize: adjust(14),
    color: '#666',
  },
  noResultsContainer: {
    padding: adjust(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: adjust(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noResultsText: {
    fontSize: adjust(14),
    color: '#666',
  },
  citySuggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  citySuggestionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityTextWrapper: {
    flex: 1,
    marginLeft: adjust(8),
    justifyContent: 'center',
  },
  cityMainText: {
    fontSize: adjust(16),
    fontWeight: '500',
    color: '#333',
  },
  citySecondaryText: {
    fontSize: adjust(13),
    color: '#666',
    marginTop: adjust(2),
  },
  addCityIcon: {
    padding: adjust(8),
  },
  savedCitiesSection: {
    margin: adjust(16),
    marginTop: adjust(8),
    marginBottom: adjust(24),
    backgroundColor: '#fff',
    borderRadius: adjust(10),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  savedCitiesTitle: {
    fontSize: adjust(18),
    fontWeight: '600',
    color: '#333',
    padding: adjust(16),
    paddingBottom: adjust(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  savedCitiesList: {
    padding: adjust(4),
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  savedCityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  savedCityTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savedCityText: {
    fontSize: adjust(16),
    color: '#333',
    marginLeft: adjust(8),
  },
  noSavedCitiesText: {
    fontSize: adjust(14),
    color: '#666',
    textAlign: 'center',
    padding: adjust(16),
  },
  removeCityButton: {
    padding: adjust(8),
  },
  addCityButton: {
    width: adjust(36),
    height: adjust(36),
    borderRadius: adjust(18),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  citySuggestionsList: {
    marginTop: adjust(0),
  },
  googlePlacesContainer: {
    marginHorizontal: adjust(16),
    marginTop: adjust(8),
    marginBottom: adjust(16),
    zIndex: 10,
  },
  googleSearchIcon: {
    marginLeft: adjust(10),
    marginRight: adjust(5),
  },
});

export default ForecastScreen; 