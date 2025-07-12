const functions = require("firebase-functions");
const { OpenAI } = require("openai");
const { openai_api_key } = require("./apikey");
const admin = require("firebase-admin");
admin.initializeApp();


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openai_api_key, // Set this in Firebase config
});

exports.getChatResponse = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, model = "gpt-3.5-turbo" } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are Skylar, a friendly and knowledgeable weather assistant. When answering weather-related questions, be direct and specific, using the actual weather data provided. Only mention being a weather assistant if the question is not weather-related."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    // Return the response
    res.status(200).json({
      success: true,
      response: completion.choices[0].message.content,
      model: model,
      usage: completion.usage
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Handle different types of errors
    if (error.status === 401) {
      res.status(401).json({ error: 'Invalid OpenAI API key' });
    } else if (error.status === 429) {
      res.status(429).json({ error: 'OpenAI API rate limit exceeded' });
    } else if (error.status === 500) {
      res.status(500).json({ error: 'OpenAI API server error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Alternative function for streaming responses
exports.getChatResponseStream = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Content-Type', 'text/event-stream');
  res.set('Cache-Control', 'no-cache');
  res.set('Connection', 'keep-alive');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, model = "gpt-3.5-turbo" } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    const stream = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: message }],
      stream: true,
      max_tokens: 150,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Streaming Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
    res.end();
  }
});


exports.saveDeviceToken = functions.https.onRequest(async (req, res) => {
  const { deviceId, token } = req.body;

  if (!deviceId || !token) return res.status(400).send("Missing data");

  await admin.firestore().collection("deviceTokens").doc(deviceId).set({
    token,
    createdAt: Date.now(),
  });

  res.send("Token saved for device");
});

  