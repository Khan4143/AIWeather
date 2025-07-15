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


exports.saveDeviceData = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { deviceId, token, timezone, location, city } = req.body;

  if (!deviceId) {
    return res.status(400).send('Missing deviceId');
  }

  const updateData = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (token) updateData.token = token;
  if (timezone) updateData.timezone = timezone;
  if (location) updateData.location = location;
  if (city) updateData.city = city;

  try {
    await admin.firestore().collection('deviceTokens').doc(deviceId).set(updateData, { merge: true });
    return res.status(200).send('Device data saved');
  } catch (error) {
    console.error('❌ Error saving device data:', error);
    return res.status(500).send('Failed to save device data');
  }
});

// Function to save device metadata (location, timezone, etc.)
exports.saveDeviceMeta = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { deviceId, timezone, location, city } = req.body;

  if (!deviceId) {
    return res.status(400).json({ success: false, error: 'Missing deviceId' });
  }

  try {
    // Save device metadata to the deviceTokens collection instead of deviceMeta
    // This ensures all device data is in one place
    await admin.firestore().collection('deviceTokens').doc(deviceId).set({
      deviceId,
      timezone,
      location,
      city,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`✅ Device metadata saved for device: ${deviceId}`);
    return res.status(200).json({ success: true, message: 'Device metadata saved successfully' });
  } catch (error) {
    console.error('❌ Error saving device metadata:', error);
    return res.status(500).json({ success: false, error: 'Failed to save device metadata' });
  }
});

// Function to save FCM token for push notifications
exports.saveDeviceToken = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { deviceId, token } = req.body;

  if (!deviceId || !token) {
    return res.status(400).json({ success: false, error: 'Missing deviceId or token' });
  }

  try {
    // Save FCM token to Firestore
    await admin.firestore().collection('deviceTokens').doc(deviceId).set({
      token,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`✅ FCM token saved for device: ${deviceId}`);
    return res.status(200).json({ success: true, message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
    return res.status(500).json({ success: false, error: 'Failed to save FCM token' });
  }
});

// Send a test notification to a specific device
exports.sendTestNotification = functions.https.onCall(async (data, context) => {
  const { deviceId } = data;
  
  if (!deviceId) {
    throw new functions.https.HttpsError('invalid-argument', 'Device ID is required');
  }
  
  try {
    // Get the device token from Firestore
    const deviceDoc = await admin.firestore().collection('deviceTokens').doc(deviceId).get();
    
    if (!deviceDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Device not found');
    }
    
    const deviceData = deviceDoc.data();
    
    if (!deviceData.token) {
      throw new functions.https.HttpsError('failed-precondition', 'Device has no FCM token');
    }
    
    // Send a test notification
    await admin.messaging().send({
      token: deviceData.token,
      notification: {
        title: 'Weather Alert Test',
        body: 'This is a test notification from Skylar Weather App',
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    });
    
    return { success: true, message: 'Test notification sent' };
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send test notification', error);
  }
});
  



  