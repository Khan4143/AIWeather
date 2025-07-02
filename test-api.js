const https = require('https');

const API_KEY = '87b449b894656bb5d85c61981ace7d25';
// Test with just one city for forecast (more data)
const city = 'Los Angeles';

console.log(`Testing OpenWeatherMap forecast API for city: ${city}`);

// Make the API request for forecast
https.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`, (resp) => {
  let data = '';

  // A chunk of data has been received
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received
  resp.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response status:', resp.statusCode);
      console.log('City:', response.city?.name);
      console.log('Country:', response.city?.country);
      
      if (response.list && response.list.length > 0) {
        console.log(`\nReceived ${response.list.length} forecast items`);
        
        // Check the first few forecasts
        console.log('\nSample forecast items:');
        for (let i = 0; i < Math.min(3, response.list.length); i++) {
          const item = response.list[i];
          const date = new Date(item.dt * 1000);
          console.log(`\nForecast for ${date.toLocaleString()}:`);
          console.log('Weather main:', item.weather[0].main);
          console.log('Weather description:', item.weather[0].description);
          console.log('Weather icon:', item.weather[0].icon);
        }
        
        // Group forecasts by day to see weather transitions
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
            icon: item.weather[0].icon
          });
        });
        
        console.log('\nDaily forecast summary:');
        dayMap.forEach((items, day) => {
          console.log(`\nDate: ${day}`);
          items.forEach(item => {
            console.log(`  ${item.time}: ${item.main} (${item.description}) - Icon: ${item.icon}`);
          });
        });
      } else {
        console.log('No forecast data in the response');
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
      console.log('Raw response:', data);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
}); 