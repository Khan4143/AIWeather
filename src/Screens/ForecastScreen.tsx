import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import adjust from '../utils/adjust';
import { SCREEN_WIDTH } from '../constants/dimesions';
import { StackNavigationProp } from '@react-navigation/stack';
import useWeather from '../hooks/useWeather';
import { format } from 'date-fns';
import { ForecastData, WeatherData } from '../services/weatherService';
import { useWeatherContext } from '../contexts/WeatherContext';
import { UserData } from '../Screens/UserInfo';

type ForecastScreenProps = {
  navigation: StackNavigationProp<any>;
};

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
interface CityObject { key: string; display: string; }

const ForecastScreen = ({ navigation }: ForecastScreenProps) => {
  const [selectedDay, setSelectedDay] = useState(0);

  // Use WeatherContext for current location and forecast
  const { forecast, isLoading: isLoadingWeather, error, fetchForecastForCity } = useWeatherContext();
  const [location, setLocation] = useState<string | null>(null);

  // On mount, set location to user's current location (from context forecast)
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
      console.log("ForecastScreen - No forecast data, fetching for location:", userDataLocation);
      fetchForecastForCity(userDataLocation);
    } 
    // If we don't have a location set in UserData, use a default location
    else if (!forecast && !isLoadingWeather && !userDataLocation) {
      console.log("ForecastScreen - No location set, using default location");
      // Use a default location if no user location is set
      const defaultLocation = "London, GB";
      fetchForecastForCity(defaultLocation);
      
      // This is temporary - we're not updating UserData permanently
      console.log("ForecastScreen - Using temporary default location:", defaultLocation);
    }
  }, [forecast, isLoadingWeather, fetchForecastForCity]);
  
  // Use forecast as weatherData
  const weatherData: ForecastData | null = forecast;

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

  if (!weatherData && isLoadingWeather) {
    return (
      <View style={{ flex: 1, backgroundColor: '#b3d4ff' }}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4361EE" />
            <Text style={styles.loadingText}>Loading weather data...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#b3d4ff' }}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header with location */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={adjust(16)} color="#4361EE" />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        {/* Main scrollable content */}
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Daily forecast cards - edge-to-edge */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forecastDaysScrollContent}
            style={styles.forecastDaysScroll}
          >
            {weatherData?.daily.map((day, index) => (
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
          <View style={{ height: adjust(16) }} />
          {/* Detailed forecast for the selected day */}
          {renderDetailedForecast()}
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
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
    paddingHorizontal: adjust(20),
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
    justifyContent: 'flex-start', // Align to the start
    alignItems: 'center',
    marginTop: adjust(10),
    marginBottom: adjust(10),
    paddingHorizontal: adjust(20),
    height: adjust(40), // Give header a fixed height for stability
  },
  locationContainer: {
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: adjust(16),
    marginHorizontal: adjust(6),
    paddingVertical: adjust(16),
    paddingHorizontal: adjust(18),
    minWidth: adjust(70),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    color: '#4361EE',
  },
  selectedDayCard: {
    backgroundColor: '#4361EE',
    shadowOpacity: 0.18,
    // transform: [{ scale: 1.08 }],
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
    padding: adjust(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateHeader: {
    fontSize: adjust(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: adjust(16),
  },
  currentConditionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: adjust(20),
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
  },
  conditionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionText: {
    fontSize: adjust(14),
    color: '#333',
    textAlign: 'center',
    marginTop: adjust(5),
  },
  sectionTitle: {
    fontSize: adjust(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: adjust(12),
    marginTop: adjust(16),
  },
  hourlyForecastContainer: {
    paddingBottom: adjust(8),
  },
  hourlyForecastItem: {
    alignItems: 'center',
    marginRight: adjust(20),
    width: adjust(60),
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
  forecastDaysScroll: {
    marginHorizontal: -adjust(20),
    backgroundColor: 'transparent',
  },
  forecastDaysScrollContent: {
    paddingHorizontal: adjust(20),
    alignItems: 'center',
  },
});

export default ForecastScreen; 