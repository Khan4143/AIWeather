// OpenWeather API Service
// This file contains functions for fetching weather data from the OpenWeather API

const API_KEY = '87b449b894656bb5d85c61981ace7d25';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather data interface
export interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  tempMin: number;
  tempMax: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDirection: number;
  sunrise: number;
  sunset: number;
  timezone: number;
  pressure: number;
  visibility: number;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface ForecastDay {
  date: number;
  sunrise: number;
  sunset: number;
  temperature: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feelsLike: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  };
  windSpeed: number;
  windDirection: number;
  clouds: number;
  pop: number; // Probability of precipitation
  rain?: number;
  uvi: number; // UV index
}

export interface ForecastData {
  location: string;
  country: string;
  timezone: number;
  current: WeatherData;
  daily: ForecastDay[];
  hourly: ForecastDay[];
}

/**
 * Validates if a city exists in the OpenWeather API
 * @param city - City name with optional country code e.g. "London, GB"
 * @returns Promise with boolean indicating if the city is valid
 */
export const validateCity = async (city: string): Promise<boolean> => {
  try {
    // Split city name from country code - expected format: "City, CountryCode"
    const [cityName, countryCode] = city.split(',').map(part => part.trim());
    
    // Build the query string - if country code exists, add it to the query
    let query = cityName;
    if (countryCode) {
      query = `${cityName},${countryCode}`;
    }

    // Use the weather endpoint to check if the city exists
    const response = await fetch(
      `${BASE_URL}/weather?q=${query}&appid=${API_KEY}`
    );

    // If we get a 200 response, the city exists in the API
    return response.ok;
  } catch (error) {
    console.error('Error validating city:', error);
    return false;
  }
};

// Helper function to convert temperature from Kelvin to Celsius
const kelvinToCelsius = (kelvin: number): number => {
  return Math.round((kelvin - 273.15) * 10) / 10;
};

// Helper function to convert temperature from Kelvin to Fahrenheit
const kelvinToFahrenheit = (kelvin: number): number => {
  return Math.round(((kelvin - 273.15) * 9/5 + 32) * 10) / 10;
};

/**
 * Fetch current weather data for a specific city
 * @param city - City name with country code e.g. "London, GB"
 * @param units - Units of measurement: 'metric' (Celsius), 'imperial' (Fahrenheit), or 'standard' (Kelvin)
 * @returns Promise with weather data
 */
export const fetchCurrentWeather = async (
  city: string, 
  units: 'metric' | 'imperial' | 'standard' = 'metric'
): Promise<WeatherData> => {
  try {
    // Split city name from country code - expected format: "City, CountryCode"
    const [cityName, countryCode] = city.split(',').map(part => part.trim());
    
    // Build the query string - if country code exists, add it to the query
    let query = cityName;
    if (countryCode) {
      query = `${cityName},${countryCode}`;
    }

    console.log(`Fetching current weather for: ${query}`);
    const response = await fetch(
      `${BASE_URL}/weather?q=${query}&appid=${API_KEY}&units=${units}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch weather data');
    }

    const data = await response.json();
    
    // Log the weather condition for debugging
    console.log('Weather condition received:', data.weather[0].main);
    console.log('Weather description received:', data.weather[0].description);
    console.log('Weather icon code received:', data.weather[0].icon);
    
    // Verify weather condition matches the description and icon
    verifyWeatherCondition(data.weather[0]);
    
    // Map the API response to our WeatherData interface
    const weatherData: WeatherData = {
      location: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      tempMin: data.main.temp_min,
      tempMax: data.main.temp_max,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timezone: data.timezone,
      pressure: data.main.pressure,
      visibility: data.visibility,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
    };

    console.log('Successfully fetched current weather for:', city);
    return weatherData;
  } catch (error: any) {
    console.error('Error fetching current weather:', error.message);
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
};

// Helper function to verify weather condition matches the description and icon
function verifyWeatherCondition(weatherData: { main: string, description: string, icon: string }) {
  // Mappings based on OpenWeather API documentation
  // https://openweathermap.org/weather-conditions
  const conditionIconMap: { [key: string]: string[] } = {
    'Clear': ['01d', '01n'],
    'Clouds': ['02d', '02n', '03d', '03n', '04d', '04n'],
    'Rain': ['09d', '09n', '10d', '10n'],
    'Drizzle': ['09d', '09n'],
    'Thunderstorm': ['11d', '11n'],
    'Snow': ['13d', '13n'],
    'Mist': ['50d', '50n'],
    'Smoke': ['50d', '50n'],
    'Haze': ['50d', '50n'],
    'Dust': ['50d', '50n'],
    'Fog': ['50d', '50n'],
    'Sand': ['50d', '50n'],
    'Ash': ['50d', '50n'],
    'Squall': ['50d', '50n'],
    'Tornado': ['50d', '50n'],
  };

  // Check if icon is valid for the main condition
  const validIcons = conditionIconMap[weatherData.main] || [];
  const isIconValid = validIcons.includes(weatherData.icon);
  
  console.log(`Weather condition validation:
    - Main condition: ${weatherData.main}
    - Description: ${weatherData.description}
    - Icon code: ${weatherData.icon}
    - Is icon valid for condition: ${isIconValid}
  `);
  
  // If not valid, still use what we received but log the warning
  if (!isIconValid) {
    console.warn(`Warning: Icon code ${weatherData.icon} might not be appropriate for ${weatherData.main} condition`);
  }
}

/**
 * Fetch weather forecast for a specific city
 * @param city - City name with country code e.g. "London, GB"
 * @param units - Units of measurement: 'metric' (Celsius), 'imperial' (Fahrenheit), or 'standard' (Kelvin)
 * @returns Promise with forecast data
 */
export const fetchWeatherForecast = async (
  city: string,
  units: 'metric' | 'imperial' | 'standard' = 'metric'
): Promise<ForecastData> => {
  try {
    // First get the current weather
    const currentWeather = await fetchCurrentWeather(city, units);
    
    // Split city name from country code - expected format: "City, CountryCode"
    const [cityName, countryCode] = city.split(',').map(part => part.trim());
    
    // Build the query string - if country code exists, add it to the query
    let query = cityName;
    if (countryCode) {
      query = `${cityName},${countryCode}`;
    }

    console.log(`Fetching forecast for: ${query}`);
    // Get the 5 day / 3 hour forecast
    const response = await fetch(
      `${BASE_URL}/forecast?q=${query}&appid=${API_KEY}&units=${units}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch forecast data');
    }

    const data = await response.json();

    // Extract daily forecasts (noon time for each day)
    // Note: API returns data in 3-hour intervals for 5 days
    const seenDates = new Set<string>();
    const dailyForecasts: any[] = [];
    
    // Helper to get date string (YYYY-MM-DD) from timestamp
    const getDateString = (timestamp: number) => {
      const date = new Date(timestamp * 1000);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // Find one forecast per day (we'll use the noon forecast if available)
    data.list.forEach((item: any) => {
      const dateStr = getDateString(item.dt);
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        dailyForecasts.push(item);
        
        // Log daily forecast data for debugging
        console.log(`Daily forecast for ${dateStr}:`, 
          item.weather[0].main, 
          item.weather[0].description, 
          item.weather[0].icon
        );
        
        // Verify weather condition
        verifyWeatherCondition(item.weather[0]);
      }
    });

    // Extract hourly forecasts for the next 24 hours
    const hourlyForecasts = data.list.slice(0, 8); // Next 24 hours (3-hour intervals)
    
    // Log hourly forecast data for debugging
    console.log('Hourly forecasts for the next 24 hours:');
    hourlyForecasts.forEach((item: any, index: number) => {
      const time = new Date(item.dt * 1000).toLocaleTimeString();
      console.log(`Hour ${index} (${time}):`, 
        item.weather[0].main, 
        item.weather[0].description, 
        item.weather[0].icon
      );
      
      // Verify weather condition
      verifyWeatherCondition(item.weather[0]);
    });
    
    // Map the API response to our ForecastData interface
    const forecastData: ForecastData = {
      location: currentWeather.location,
      country: currentWeather.country,
      timezone: data.city.timezone || 0,
      current: currentWeather,
      daily: dailyForecasts.map(dayData => ({
        date: dayData.dt,
        // Free tier doesn't provide sunrise/sunset times in forecast
        sunrise: currentWeather.sunrise,  // Use current day as placeholder
        sunset: currentWeather.sunset,    // Use current day as placeholder
        temperature: {
          day: dayData.main.temp,
          min: dayData.main.temp_min,
          max: dayData.main.temp_max,
          night: dayData.main.temp,
          eve: dayData.main.temp,
          morn: dayData.main.temp,
        },
        feelsLike: {
          day: dayData.main.feels_like,
          night: dayData.main.feels_like,
          eve: dayData.main.feels_like,
          morn: dayData.main.feels_like,
        },
        pressure: dayData.main.pressure,
        humidity: dayData.main.humidity,
        weather: {
          id: dayData.weather[0].id,
          main: dayData.weather[0].main,
          description: dayData.weather[0].description,
          icon: dayData.weather[0].icon,
        },
        windSpeed: dayData.wind.speed,
        windDirection: dayData.wind.deg,
        clouds: dayData.clouds.all,
        pop: dayData.pop || 0,
        rain: dayData.rain ? dayData.rain['3h'] : undefined,
        uvi: 0, // UV index not available in free tier
      })),
      hourly: hourlyForecasts.map((hourData: any) => ({
        date: hourData.dt,
        sunrise: currentWeather.sunrise,
        sunset: currentWeather.sunset,
        temperature: {
          day: hourData.main.temp,
          min: hourData.main.temp_min,
          max: hourData.main.temp_max,
          night: hourData.main.temp,
          eve: hourData.main.temp,
          morn: hourData.main.temp,
        },
        feelsLike: {
          day: hourData.main.feels_like,
          night: hourData.main.feels_like,
          eve: hourData.main.feels_like,
          morn: hourData.main.feels_like,
        },
        pressure: hourData.main.pressure,
        humidity: hourData.main.humidity,
        weather: {
          id: hourData.weather[0].id,
          main: hourData.weather[0].main,
          description: hourData.weather[0].description,
          icon: hourData.weather[0].icon,
        },
        windSpeed: hourData.wind.speed,
        windDirection: hourData.wind.deg,
        clouds: hourData.clouds.all,
        pop: hourData.pop || 0,
        rain: hourData.rain ? hourData.rain['3h'] : undefined,
        uvi: 0, // UV index not available in free tier
      })),
    };

    console.log('Successfully fetched forecast for:', city);
    return forecastData;
  } catch (error: any) {
    console.error('Error fetching weather forecast:', error.message);
    throw new Error(`Failed to fetch forecast: ${error.message}`);
  }
};

/**
 * Process the 3-hour forecast data to get daily forecasts
 * @param forecastList - List of 3-hour forecasts
 * @returns Array of daily forecasts
 */
function processForecastData(forecastList: any[]): any[] {
  const dailyData: any[] = [];
  const dayMap = new Map<string, any[]>();
  
  // Group forecasts by day
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, []);
    }
    
    dayMap.get(dayKey)?.push(item);
  });
  
  // For each day, compute true min/max from all 3-hourly entries
  dayMap.forEach((items, day) => {
    // Sort by timestamp
    items.sort((a, b) => a.dt - b.dt);
    // Find forecast closest to noon for representative 'day' temp
    let closestToNoon = items[0];
    let minDiff = Number.MAX_SAFE_INTEGER;
    items.forEach(item => {
      const date = new Date(item.dt * 1000);
      const hour = date.getHours();
      const diff = Math.abs(hour - 12);
      if (diff < minDiff) {
        minDiff = diff;
        closestToNoon = item;
      }
    });
    // Compute true min/max for the day
    let minTemp = items[0].main.temp_min;
    let maxTemp = items[0].main.temp_max;
    items.forEach(item => {
      if (item.main.temp_min < minTemp) minTemp = item.main.temp_min;
      if (item.main.temp_max > maxTemp) maxTemp = item.main.temp_max;
    });
    // Attach min/max to the representative forecast
    closestToNoon.main.temp_min = minTemp;
    closestToNoon.main.temp_max = maxTemp;
    dailyData.push(closestToNoon);
  });
  // Sort by timestamp
  return dailyData.sort((a, b) => a.dt - b.dt);
}

/**
 * Fetch weather data by geolocation coordinates
 * @param lat - Latitude
 * @param lon - Longitude
 * @param units - Units of measurement: 'metric' (Celsius), 'imperial' (Fahrenheit), or 'standard' (Kelvin)
 * @returns Promise with weather data
 */
export const fetchWeatherByCoordinates = async (
  lat: number,
  lon: number,
  units: 'metric' | 'imperial' | 'standard' = 'metric'
): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch weather data');
    }

    const data = await response.json();
    
    // Map the API response to our WeatherData interface
    const weatherData: WeatherData = {
      location: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      tempMin: data.main.temp_min,
      tempMax: data.main.temp_max,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timezone: data.timezone,
      pressure: data.main.pressure,
      visibility: data.visibility,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
    };

    console.log('Successfully fetched weather for coordinates:', lat, lon);
    return weatherData;
  } catch (error: any) {
    console.error('Error fetching weather by coordinates:', error.message);
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
};

// Export weather icon URL helper
export const getWeatherIconUrl = (iconCode: string): string => {
  // Log icon code before generating URL
  console.log('Generating icon URL for code:', iconCode);
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}; 