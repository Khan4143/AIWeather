// Gemini AI API Service for handling chat interactions
// This service focuses on weather-related questions and responses

import { getApiKey } from '../utils/apiKeys';
import { WeatherData, ForecastData } from './weatherService';

// Try modern API endpoint first
const PRIMARY_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';
// Fallback to legacy API endpoint if needed
const FALLBACK_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const MAX_RETRIES = 2; // Maximum number of retry attempts for API calls

export interface GeminiResponse {
  text: string;
  isWeatherRelated: boolean;
}

interface WeatherInfo {
  currentWeather?: WeatherData | null;
  forecast?: ForecastData | null;
  location?: string;
  units?: 'metric' | 'imperial';
}

/**
 * Check if a user's question is weather-related
 * @param query - The user's question
 * @returns - Boolean indicating if the question is weather-related
 */
export const isWeatherQuestion = async (query: string): Promise<boolean> => {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      const API_KEY = getApiKey('gemini');
      
      if (!API_KEY) {
        console.error('Gemini API key is missing');
        return true; // Default to true to prevent blocking legitimate queries
      }
      
      // Use simpler keyword-based approach rather than making another API call
      const weatherKeywords = [
        'weather', 'rain', 'temperature', 'hot', 'cold', 'sunny', 'cloudy', 
        'forecast', 'humidity', 'storm', 'wind', 'precipitation', 'climate',
        'snow', 'umbrella', 'celsius', 'fahrenheit', 'degrees', 'sunrise', 'sunset',
        'outside', 'jacket', 'wear', 'clothing', 'outdoor', 'activity'
      ];
      
      // Convert query to lowercase for case-insensitive matching
      const lowerQuery = query.toLowerCase();
      
      // If any weather keyword is found, return true
      for (const keyword of weatherKeywords) {
        if (lowerQuery.includes(keyword)) {
          console.log(`Weather-related query detected: keyword "${keyword}" found in "${query}"`);
          return true;
        }
      }
      
      // No keywords found, but let's make a lightweight API call as fallback
      console.log(`No weather keywords found in query, calling API for validation: "${query}"`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(`${PRIMARY_API_URL}?key=${API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `Is the query "${query}" related to weather, climate, or outdoor activities? Answer Yes or No.` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,  // Low temperature for more deterministic responses
              maxOutputTokens: 5,
              topP: 1,
              topK: 1
            }
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          // If validation API call fails, default to true (accept all queries)
          console.error(`Validation API request failed with status: ${response.status}`);
          return true; // Accept the query if API fails
        }

        const data = await response.json();
        
        // Extract the validation result
        let result = '';
        if (data.candidates && 
            data.candidates[0] && 
            data.candidates[0].content && 
            data.candidates[0].content.parts && 
            data.candidates[0].content.parts[0] && 
            data.candidates[0].content.parts[0].text) {
          result = data.candidates[0].content.parts[0].text.trim().toUpperCase();
          console.log('Validation result:', result);
        }

        // If we get YES/NO response, use it, otherwise default to accepting the query
        return !result.includes('NO');
      } catch (error) {
        console.error('API call error during validation:', error);
        return true; // Default to allowing the query if API fails
      }
      
    } catch (error: any) {
      console.error('Error validating weather question:', error);
      return true; // Default to true on error to prevent blocking legitimate queries
    }
  }
  
  return true; // Default fallback after all retries
};

/**
 * Generate a response using the Gemini API
 * @param prompt - The user's question or prompt
 * @param weatherInfo - Current weather data to enhance responses
 * @returns - Response text and whether it's weather related
 */
export const generateResponse = async (
  prompt: string, 
  weatherInfo?: WeatherInfo
): Promise<GeminiResponse> => {
  let retries = 0;
  let currentApiUrl = PRIMARY_API_URL;
  
  while (retries <= MAX_RETRIES) {
    try {
      const API_KEY = getApiKey('gemini');
      
      if (!API_KEY) {
        console.error('Gemini API key is missing');
        return {
          text: "I'm unable to access my weather brain right now. Please check your API configuration.",
          isWeatherRelated: false
        };
      }
      
      // Log masked API key for debugging (only showing first 4 chars)
      const maskedKey = API_KEY.substring(0, 4) + '...' + API_KEY.substring(API_KEY.length - 4);
      console.log(`Using API key starting with: ${maskedKey}`);
      
      // First, check if the prompt is weather-related using our much faster keyword check
      const isWeatherRelated = await isWeatherQuestion(prompt);
      
      // If not weather-related, return a predefined response
      if (!isWeatherRelated) {
        return {
          text: "I'm your weather assistant. I can only answer questions related to weather, forecasts, climate, or outdoor planning. Please ask me about the weather or how it might affect your plans!",
          isWeatherRelated: false
        };
      }
      
      // Format current weather data for the prompt
      let weatherContext = '';
      if (weatherInfo?.currentWeather) {
        const w = weatherInfo.currentWeather;
        const tempUnit = weatherInfo?.units === 'imperial' ? 'F' : 'C';
        
        weatherContext = `
Current weather in ${weatherInfo.location || 'the user\'s location'}:
- Temperature: ${w.temperature}°${tempUnit} (feels like ${w.feelsLike}°${tempUnit})
- Conditions: ${w.description}
- Humidity: ${w.humidity}%
- Wind: ${w.windSpeed} ${weatherInfo?.units === 'imperial' ? 'mph' : 'm/s'} ${w.windDirection}°
`;

        // Add forecast data if available
        if (weatherInfo?.forecast && weatherInfo.forecast.hourly && weatherInfo.forecast.hourly.length > 0) {
          weatherContext += '\nForecast for the next hours:\n';
          
          // Only include the next few forecast points to keep context manageable
          const nextForecastPoints = weatherInfo.forecast.hourly.slice(0, 3);
          nextForecastPoints.forEach(point => {
            const date = new Date(point.date * 1000);
            weatherContext += `- ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}: ${point.weather.description}, ${point.temperature.day}°${tempUnit}\n`;
          });
        }
      } else {
        // No weather data available
        weatherContext = 'Note: I don\'t have current weather data for your location at the moment.';
      }
      
      // Prepare prompt with context about being a weather assistant
      const enhancedPrompt = `As Skylar, an AI weather assistant in a mobile app, answer this weather-related question with helpful information.
${weatherContext ? 'Use this weather data to inform your response:' : ''}
${weatherContext}

User question: "${prompt}"

Keep responses concise and focused on weather insights. If the weather data doesn't directly answer the question, you can provide general weather advice but make it clear you're not using real-time data for that specific question.`;
      
      // Call the Gemini API
      console.log(`Calling Gemini API attempt ${retries + 1}/${MAX_RETRIES + 1}`);
      console.log(`Using API endpoint: ${currentApiUrl}`);
      console.log(`Full URL: ${currentApiUrl}?key=[MASKED]`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`${currentApiUrl}?key=${API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: enhancedPrompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 100,
              topP: 0.8,
              topK: 40
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const statusText = response.statusText;
          const status = response.status;
          console.error(`API request failed with status: ${status} - ${statusText}`);
          
          // Try to get more details from the error response
          try {
            const errorData = await response.text();
            console.error(`Error details: ${errorData}`);
          } catch (e) {
            console.error('Could not parse error response');
          }
          
          // If this is an auth error, don't bother retrying
          if (status === 401 || status === 403) {
            return {
              text: "I can't connect to my weather intelligence service due to authentication issues. Please check your API configuration.",
              isWeatherRelated: false
            };
          }
          
          // For 404 Not Found errors, try the old API endpoint format if we haven't already
          if (status === 404 && currentApiUrl === PRIMARY_API_URL) {
            console.log('Switching to fallback API endpoint');
            currentApiUrl = FALLBACK_API_URL;
            
            // Don't increment retries for endpoint switching
            continue;
          }
          
          // For server errors, retry
          if (status >= 500) {
            if (retries < MAX_RETRIES) {
              retries++;
              const delay = 1000 * Math.pow(2, retries); // Exponential backoff
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          throw new Error(`API request failed with status: ${status}`);
        }

        const data = await response.json();
        
        // Extract the response text from the API result
        let responseText = '';
        if (data.candidates && 
            data.candidates[0] && 
            data.candidates[0].content && 
            data.candidates[0].content.parts && 
            data.candidates[0].content.parts[0] && 
            data.candidates[0].content.parts[0].text) {
          responseText = data.candidates[0].content.parts[0].text.trim();
          console.log('Successful API response received');
        } else {
          console.error('Unexpected API response structure:', JSON.stringify(data));
          responseText = "I'm having trouble understanding the weather data right now. Let me try to answer based on general knowledge instead.";
        }

        return {
          text: responseText,
          isWeatherRelated: true
        };
      } catch (error) {
        clearTimeout(timeoutId);
        throw error; // Re-throw to the outer catch
      }
    } catch (error: any) {
      console.error('Error generating Gemini response:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        console.error('API request timed out');
        if (retries < MAX_RETRIES) {
          retries++;
          console.log(`Retrying after timeout (${retries}/${MAX_RETRIES})...`);
          continue;
        }
        return {
          text: "My weather service is taking too long to respond. Let's try again in a moment!",
          isWeatherRelated: false
        };
      } else if (error.message?.includes('Network request failed')) {
        if (retries < MAX_RETRIES) {
          retries++;
          const delay = 1000 * Math.pow(2, retries); // Exponential backoff
          console.log(`Network error, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        return {
          text: "I'm having trouble connecting to my weather information service. Please check your internet connection and try again.",
          isWeatherRelated: false
        };
      } else {
        // For unknown errors, try the fallback endpoint if we haven't already
        if (currentApiUrl === PRIMARY_API_URL && !retries) {
          console.log('Switching to fallback API endpoint after error');
          currentApiUrl = FALLBACK_API_URL;
          retries++;
          continue;
        }
        
        // If we've already tried the fallback or this is a second retry
        retries++;
        if (retries > MAX_RETRIES) {
          break;
        }
      }
    }
  }
  
  // Default fallback response after all retries failed
  return {
    text: "I'm having trouble processing your weather question right now. Please try again in a moment.",
    isWeatherRelated: false
  };
}; 