const functions = require("firebase-functions");
const axios = require("axios");
const cors = require('cors')({ origin: true });

// New Gemini API endpoint
exports.getGeminiData = functions.https.onRequest(async (_, response) => {
  try {
    // Example Gemini public API URL (BTC/USD ticker)
    const geminiApiUrl = "https://api.gemini.com/v1/pubticker/btcusd";

    // Call Gemini API
    const geminiResponse = await axios.get(geminiApiUrl);

    // Return Gemini data to frontend
    response.status(200).json({
      success: true,
      data: geminiResponse.data
    });
  } catch (error) {
    console.error("Error fetching Gemini data:", error);
    response.status(500).json({
      success: false,
      message: "Error fetching Gemini data"
    });
  }
});

exports.generateResponse = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { userPrompt, weatherContext } = req.body;
      
      // Your existing Gemini API logic here
      const API_KEY = process.env.GEMINI_API_KEY;
      
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
        {
          contents: [{
            parts: [{
              text: `You are a weather assistant named Skylar. Use the following weather data to answer the user's question in a helpful and conversational way. 
              Current weather data: ${JSON.stringify(weatherContext)}
              User's question: ${userPrompt}
              Please provide a natural, conversational response that directly addresses the user's question using the weather data provided. 
              If the question is not weather-related, politely inform them that you're a weather assistant and can help with weather-related questions.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': API_KEY
          }
        }
      );

      res.json({
        text: response.data.candidates[0].content.parts[0].text,
        isWeatherRelated: true
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        text: "I'm having trouble processing your request. Please try again in a moment.",
        isWeatherRelated: false
      });
    }
  });
});
