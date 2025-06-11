import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { WeatherData, ForecastData } from '../services/weatherService';
import useWeather from '../hooks/useWeather';
import { UserData } from '../Screens/UserInfo';

interface WeatherContextType {
  currentWeather: WeatherData | null;
  forecast: ForecastData | null;
  isLoading: boolean;
  error: string | null;
  fetchWeatherForCity: (city: string) => Promise<WeatherData | null>;
  fetchForecastForCity: (city: string) => Promise<ForecastData | null>;
  setPreferredUnits: (units: 'metric' | 'imperial') => void;
  preferredUnits: 'metric' | 'imperial';
  forceRefresh: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

interface WeatherProviderProps {
  children: ReactNode;
}

export const WeatherProvider: React.FC<WeatherProviderProps> = ({ children }) => {
  const [preferredUnits, setPreferredUnits] = useState<'metric' | 'imperial'>('metric');
  const [userLocation, setUserLocation] = useState<string | undefined>(undefined);
  const [lastFetchedLocation, setLastFetchedLocation] = useState<string | undefined>(undefined);
  
  const { 
    currentWeather, 
    forecast, 
    isLoading, 
    error, 
    fetchWeather,
    fetchForecast
  } = useWeather({ units: preferredUnits, autoFetch: false });

  // Force refresh function to manually trigger weather data refresh
  const forceRefresh = useCallback(() => {
    if (userLocation) {
      console.log("ForceRefresh: Refreshing weather data for:", userLocation);
      fetchForecast(userLocation);
      setLastFetchedLocation(userLocation);
    }
  }, [userLocation, fetchForecast]);

  // Update user location when UserData changes
  useEffect(() => {
    const userDataLocation = UserData.location;
    console.log("Weather Context - User Location:", userDataLocation);
    console.log("Weather Context - Last Fetched Location:", lastFetchedLocation);
    
    if (userDataLocation && userDataLocation !== '') {
      // Set the user location regardless
      setUserLocation(userDataLocation);
      
      // Only fetch if the location has changed or we haven't fetched for this location yet
      if (userDataLocation !== lastFetchedLocation) {
        console.log("Weather Context - Location changed, fetching forecast for:", userDataLocation);
        fetchForecast(userDataLocation);
        setLastFetchedLocation(userDataLocation);
      }
    }
  }, [UserData.location, lastFetchedLocation, fetchForecast]);
  
  // Add effect to handle navigation state changes (when coming back to the app or switching screens)
  useEffect(() => {
    // Focus listener will run when the screen is navigated to
    const handleAppFocus = () => {
      // Check if we have a location and if there's a difference between UserData.location and lastFetchedLocation
      if (UserData.location && UserData.location !== '' && UserData.location !== lastFetchedLocation) {
        console.log("App focus: Location changed, refreshing forecast for:", UserData.location);
        fetchForecast(UserData.location);
        setLastFetchedLocation(UserData.location);
      }
    };
    
    // Call once when the component mounts (equivalent to componentDidMount)
    handleAppFocus();
    
    // Set up an interval to check for location changes periodically
    const checkInterval = setInterval(() => {
      if (UserData.location && UserData.location !== '' && UserData.location !== lastFetchedLocation) {
        console.log("Periodic check: Location changed, refreshing forecast for:", UserData.location);
        fetchForecast(UserData.location);
        setLastFetchedLocation(UserData.location);
      }
    }, 5000); // Check every 5 seconds
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [lastFetchedLocation, fetchForecast]);
  
  // Refresh weather data periodically (every 30 minutes)
  useEffect(() => {
    if (!userLocation || userLocation === '') return;
    
    const refreshInterval = setInterval(() => {
      console.log("Refreshing weather data for:", userLocation);
      fetchForecast(userLocation);
      setLastFetchedLocation(userLocation);
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(refreshInterval);
  }, [userLocation, fetchForecast]);

  const fetchWeatherForCity = useCallback((city: string) => {
    if (city !== userLocation) {
      setUserLocation(city);
    }
    setLastFetchedLocation(city);
    return fetchWeather(city);
  }, [userLocation, fetchWeather]);

  const fetchForecastForCity = useCallback((city: string) => {
    if (city !== userLocation) {
      setUserLocation(city);
    }
    setLastFetchedLocation(city);
    return fetchForecast(city);
  }, [userLocation, fetchForecast]);

  return (
    <WeatherContext.Provider
      value={{
        currentWeather,
        forecast,
        isLoading,
        error,
        fetchWeatherForCity,
        fetchForecastForCity,
        setPreferredUnits,
        preferredUnits,
        forceRefresh
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeatherContext = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeatherContext must be used within a WeatherProvider');
  }
  return context;
};

export default WeatherContext; 