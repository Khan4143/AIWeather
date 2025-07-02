// Test script to verify weather service fix

// Mock the weather data to simulate different scenarios
const mockCurrentWeather = {
  weather: [{
    main: 'Clear',
    description: 'clear sky',
    icon: '01d'
  }]
};

// Mock forecast with incorrect rain icons for a clear day
const mockForecast = {
  list: [
    // First day - with incorrect icon
    {
      dt: 1719792000, // July 1, 2024
      main: {
        temp: 25,
        temp_min: 22,
        temp_max: 28,
        feels_like: 26,
        pressure: 1013,
        humidity: 65
      },
      weather: [{
        id: 500,
        main: 'Clear', // Mismatch: Clear condition but rain icon
        description: 'clear sky',
        icon: '10d'  // This is the mismatch - rain icon with clear condition
      }],
      wind: {
        speed: 2.5,
        deg: 180
      },
      clouds: {
        all: 10
      },
      pop: 0.2
    },
    // Same day - with correct icon
    {
      dt: 1719802800, // July 1, 2024 (3 hours later)
      main: {
        temp: 27,
        temp_min: 24,
        temp_max: 29,
        feels_like: 28,
        pressure: 1012,
        humidity: 60
      },
      weather: [{
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'  // Correct icon for clear sky
      }],
      wind: {
        speed: 3.0,
        deg: 190
      },
      clouds: {
        all: 5
      },
      pop: 0
    }
  ]
};

// Import the processForecastData function
// Note: This is just to simulate its behavior for testing
function processForecastData(forecastList) {
  const dailyData = [];
  const dayMap = new Map();
  
  // Group forecasts by day
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, []);
    }
    
    dayMap.get(dayKey).push(item);
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
    
    // Check if current day forecast is for clear or cloudy conditions
    const mainCondition = closestToNoon.weather[0].main;
    const iconCode = closestToNoon.weather[0].icon;
    
    // Detect if we have a rain icon (10d, 09d, etc.) for a clear or cloudy day
    if ((mainCondition === 'Clear' || mainCondition === 'Clouds') && 
        (iconCode.startsWith('09') || iconCode.startsWith('10') || iconCode.startsWith('11'))) {
      
      console.log(`Potential weather icon mismatch detected for ${day}: ${mainCondition} with icon ${iconCode}`);
      
      // Try to find a more appropriate forecast for this day
      for (const item of items) {
        const itemCondition = item.weather[0].main;
        const itemIcon = item.weather[0].icon;
        
        if ((itemCondition === 'Clear' && itemIcon.startsWith('01')) || 
            (itemCondition === 'Clouds' && (itemIcon.startsWith('02') || itemIcon.startsWith('03') || itemIcon.startsWith('04')))) {
          // Found a more appropriate forecast
          console.log(`Found more appropriate forecast: ${itemCondition} with icon ${itemIcon}`);
          closestToNoon = item;
          break;
        }
      }
    }
    
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
    
    // Double check the weather icon consistency
    console.log(`Selected forecast for ${day}: ${closestToNoon.weather[0].main} (${closestToNoon.weather[0].description}) - Icon: ${closestToNoon.weather[0].icon}`);
    
    dailyData.push(closestToNoon);
  });
  
  return dailyData.sort((a, b) => a.dt - b.dt);
}

// Run the test
console.log('Running weather fix test...');
console.log('Initial forecast data:');
mockForecast.list.forEach((item, i) => {
  const date = new Date(item.dt * 1000);
  console.log(`Item ${i} (${date.toLocaleString()}):`, 
    item.weather[0].main,
    item.weather[0].description,
    item.weather[0].icon
  );
});

console.log('\nProcessed forecast data:');
const processedData = processForecastData(mockForecast.list);
processedData.forEach((item, i) => {
  const date = new Date(item.dt * 1000);
  console.log(`Processed ${i} (${date.toLocaleString()}):`, 
    item.weather[0].main,
    item.weather[0].description,
    item.weather[0].icon
  );
});

console.log('\nTest complete. The fix should have selected the correct icon (01d) for clear sky.'); 