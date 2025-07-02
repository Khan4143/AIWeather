const https = require('https');

const API_KEY = '87b449b894656bb5d85c61981ace7d25';
const city = 'Mingora,PK'; // Mingora, Swat, Pakistan

console.log(`Testing OpenWeatherMap API for ${city}`);

// First test current weather
https.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`, (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\nCURRENT WEATHER:');
      console.log('Response status:', resp.statusCode);
      
      if (response.weather && response.weather[0]) {
        console.log('Location:', response.name);
        console.log('Weather main:', response.weather[0].main);
        console.log('Weather description:', response.weather[0].description);
        console.log('Weather icon:', response.weather[0].icon);
        console.log('Temperature:', Math.round((response.main.temp - 273.15) * 10) / 10, '°C');
        console.log('Humidity:', response.main.humidity, '%');
        console.log(`Icon URL: https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);
      } else {
        console.log('No weather data in the response');
      }
      
      // Now test forecast
      testForecast(city);
    } catch (e) {
      console.error('Error parsing current weather JSON:', e);
      console.log('Raw response:', data);
    }
  });
}).on("error", (err) => {
  console.log("Error fetching current weather: " + err.message);
});

function testForecast(city) {
  https.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`, (resp) => {
    let data = '';
  
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    resp.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\nFORECAST DATA:');
        console.log('Response status:', resp.statusCode);
        
        if (response.list && response.list.length > 0) {
          console.log(`Received ${response.list.length} forecast items\n`);
          
          // Group forecasts by day
          const dayMap = new Map();
          response.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
            
            if (!dayMap.has(dayKey)) {
              dayMap.set(dayKey, []);
            }
            
            dayMap.get(dayKey).push({
              time: date.toLocaleTimeString(),
              main: item.weather[0].main,
              description: item.weather[0].description,
              icon: item.weather[0].icon,
              temp: Math.round((item.main.temp - 273.15) * 10) / 10
            });
          });
          
          console.log('Daily forecast summary:');
          dayMap.forEach((items, day) => {
            console.log(`\nDate: ${day}`);
            items.forEach(item => {
              console.log(`  ${item.time}: ${item.main} (${item.description}) - Icon: ${item.icon}, Temp: ${item.temp}°C`);
            });
          });
          
          // Test our new processForecastData function on this data
          console.log('\nPROCESSED FORECAST DATA (with our fix):');
          const processedData = processForecastData(response.list);
          processedData.forEach((item, i) => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            console.log(`Day ${i+1} (${date}):`, 
              item.weather[0].main,
              item.weather[0].description,
              item.weather[0].icon,
              `Temp: ${Math.round((item.main.temp - 273.15) * 10) / 10}°C`
            );
          });
          
        } else {
          console.log('No forecast data in the response');
        }
      } catch (e) {
        console.error('Error parsing forecast JSON:', e);
        console.log('Raw response:', data);
      }
    });
  }).on("error", (err) => {
    console.log("Error fetching forecast: " + err.message);
  });
}

// Implementation of the fixed processForecastData function
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