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

    const response = await fetch(
      `${BASE_URL}/weather?q=${query}&appid=${API_KEY}&units=${units}`
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

    console.log('Successfully fetched current weather for:', city);
    return weatherData;
  } catch (error: any) {
    console.error('Error fetching current weather:', error.message);
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
};

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
    // First get current weather (this gives us city coordinates and current weather)
    const currentWeather = await fetchCurrentWeather(city, units);
    
    // Split city name from country code - expected format: "City, CountryCode"
    const [cityName, countryCode] = city.split(',').map(part => part.trim());
    
    // Build the query string - if country code exists, add it to the query
    let query = cityName;
    if (countryCode) {
      query = `${cityName},${countryCode}`;
    }
    
    // Use the 5-day/3-hour forecast API which is available in free tier
    const response = await fetch(
      `${BASE_URL}/forecast?q=${query}&appid=${API_KEY}&units=${units}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch forecast data');
    }

    const data = await response.json();
    
    // The 5-day forecast API returns data in 3-hour increments
    // Process it to get daily forecasts
    const dailyForecasts = processForecastData(data.list);
    
    // Extract the next 24 hours of forecast data (first 8 entries, as each is 3 hours)
    const hourlyForecasts = data.list.slice(0, 8);
    
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
  
  // Get one forecast per day (noon or closest to noon)
  dayMap.forEach((items, day) => {
    // Sort by timestamp
    items.sort((a, b) => a.dt - b.dt);
    
    // Find forecast closest to noon
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
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}; 