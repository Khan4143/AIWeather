import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';
import { generateResponse } from '../services/geminiService';
import { useWeatherContext } from '../contexts/WeatherContext';
import { UserData } from '../Screens/UserInfo';
import { getApiKey, hasApiKey } from '../utils/apiKeys';

// Define message types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'skylar';
  timestamp: Date;
  loading?: boolean;
}

// Define predefined questions
const predefinedQuestions = [
  { id: '1', text: 'Check today\'s weather' },
  { id: '2', text: 'Will it rain today?' },
  { id: '3', text: 'Will it rain during my lunch break at 1 PM?' },
  { id: '4', text: 'Set lunch reminder' },
  { id: '5', text: 'Check evening forecast' },
  { id: '6', text: 'What\'s the weather like this evening?' },
  { id: '7', text: 'Weather for my commute?' },
  { id: '8', text: 'Do I need an umbrella today?' },
];

// Define fallback responses for common weather questions
const fallbackResponses: Record<string, string> = {
  'default': "I can provide general weather information, but I don't have access to real-time data right now. Please try again later.",
  'rain': "I can't check for rain data at the moment, but I recommend checking your local weather service.",
  'temperature': "I'm not able to retrieve temperature data right now. Please try asking again later.",
  'forecast': "I'm unable to access forecast information right now. Please check back soon.",
  'today': "I can't retrieve today's weather information right now. Please try again later.",
  'check today\'s weather': "I'm sorry, I can't access the current weather data. Please try again later or check your local weather service.",
  'will it rain today': "I'm unable to check rain forecasts at the moment. Please try again later."
};

const CommuteScreen = () => {
  // Access weather context to get current weather data
  const { currentWeather, forecast, preferredUnits } = useWeatherContext();
  const userLocation = UserData.location || 'your location';
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m Skylar, your weather companion. How can I help you plan your day? ☀️',
      sender: 'skylar',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  
  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Track API failure count for fallback logic
  const [apiFailureCount, setApiFailureCount] = useState<number>(0);

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setShowKeyboard(true);
        scrollToBottom();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setShowKeyboard(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Show toast notification
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    fadeAnim.setValue(0);
    
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToastVisible(false);
      });
    }, 3000);
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Add message to chat
  const addMessage = (text: string, sender: 'user' | 'skylar', isLoading = false) => {
    const timestamp = new Date();
    const uniqueId = `${sender}-${timestamp.getTime()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newMessage: Message = {
      id: uniqueId,
      text,
      sender,
      timestamp,
      loading: isLoading,
    };
    
    // Prevent duplicate error messages (don't add the same error message twice in a row)
    if (text && text.includes("I'm having trouble") || text.includes("technical problem")) {
      setMessages(prevMessages => {
        // Check if the last message was an error message
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && 
            (lastMessage.text.includes("I'm having trouble") || 
             lastMessage.text.includes("technical problem"))) {
          // Don't add duplicate error message
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });
    } else {
      // Regular message, just add it
      setMessages(prevMessages => [...prevMessages, newMessage]);
    }
    
    // Auto scroll to bottom
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return uniqueId;
  };

  // Update a message by its ID
  const updateMessage = (messageId: string, text: string, isLoading = false) => {
    setMessages((prevMessages) => 
      prevMessages.map((msg) => 
        msg.id === messageId 
          ? { ...msg, text, loading: isLoading } 
          : msg
      )
    );
  };

  // Get a fallback response based on the query
  const getFallbackResponse = (query: string): string => {
    // Convert to lowercase for easier matching
    const lowerQuery = query.toLowerCase();
    
    // Check for specific keywords
    if (lowerQuery.includes('rain')) {
      return fallbackResponses['rain'];
    } else if (lowerQuery.includes('temperature') || lowerQuery.includes('hot') || lowerQuery.includes('cold')) {
      return fallbackResponses['temperature']; 
    } else if (lowerQuery.includes('forecast')) {
      return fallbackResponses['forecast'];
    } else if (lowerQuery.includes('today')) {
      return fallbackResponses['today'];
    } else if (fallbackResponses[query]) {
      return fallbackResponses[query];
    }
    
    return fallbackResponses['default'];
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;
    const userInput = inputText.trim();
    
    // Basic content validation
    if (containsInvalidContent(userInput)) {
      // Show error toast
      showToast('Please avoid using inappropriate language or special commands.');
      return;
    }
    
    // Check if API key is available
    if (!hasApiKey('gemini')) {
      showToast('API key not configured. Please add your Gemini API key in settings.');
      // Add a helpful message for the developer/user
      addMessage("To use the chat feature, you need to add your Gemini API key. Please update the API key in src/utils/apiKeys.ts", 'skylar');
      return;
    }
    
    // Add user message
    addMessage(userInput, 'user');
    setInputText('');
    setIsLoading(true);
    
    // If we've had multiple API failures, use fallback responses
    if (apiFailureCount >= 3) {
      const fallbackResponse = getFallbackResponse(userInput);
      setTimeout(() => {
        addMessage(fallbackResponse, 'skylar');
        setIsLoading(false);
      }, 800);
      return;
    }
    
    // Show typing indicator
    const loadingId = addMessage('', 'skylar', true);
    
    try {
      // Prepare weather context for the API
      const weatherInfo = {
        currentWeather: currentWeather,
        forecast: forecast,
        location: userLocation,
        units: preferredUnits
      };
      
      // Get response from Gemini API
      const response = await generateResponse(userInput, weatherInfo);
      
      // Update the message with the actual response
      updateMessage(loadingId, response.text, false);
      
      // Reset API failure count on success
      if (apiFailureCount > 0) {
        setApiFailureCount(0);
      }
    } catch (error: any) {
      console.error('Error getting response:', error);
      
      // Check if the error is related to missing API key
      if (error.message?.includes('API key') || !hasApiKey('gemini')) {
        updateMessage(
          loadingId, 
          "I can't connect because I need a valid Gemini API key. Please update the API key in src/utils/apiKeys.ts", 
          false
        );
      } else {
        updateMessage(
          loadingId, 
          "I'm sorry, I'm having trouble connecting to my weather brain. Please try again later.", 
          false
        );
      }
      
      // Increment API failure count
      setApiFailureCount(count => count + 1);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple validation function to detect potentially invalid content
  const containsInvalidContent = (text: string): boolean => {
    // Convert to lowercase for easier comparison
    const lowerText = text.toLowerCase();
    
    // List of offensive or invalid patterns to check
    const invalidPatterns = [
      // Offensive language patterns
      /\b(f[*\s]?[u\*\s]c?k|sh[i\*\s]t|b[i\*\s]tch|d[i\*\s]ck|a[s\$\*]s|\bc[*\s]?u[*\s]?n[*\s]?t)\b/i,
      // Command injection patterns
      /\b(\/|\\|curl|wget|exec|eval|system|command|passthru|shell_exec)\b/i,
      // SQL injection patterns
      /\b(select\s+from|insert\s+into|update\s+set|delete\s+from|drop\s+table|union\s+select)\b/i
    ];
    
    // Check if any pattern matches
    return invalidPatterns.some(pattern => pattern.test(lowerText));
  };

  // Handle predefined question selection
  const handleQuestionSelect = async (question: string) => {
    // Check if API key is available
    if (!hasApiKey('gemini')) {
      showToast('API key is not configured. Please check your settings.');
      return;
    }
    
    // Add user message
    addMessage(question, 'user');
    setIsLoading(true);
    
    // If we've had multiple API failures, use fallback responses
    if (apiFailureCount >= 3) {
      const fallbackResponse = getFallbackResponse(question);
      setTimeout(() => {
        addMessage(fallbackResponse, 'skylar');
        setIsLoading(false);
      }, 800);
      return;
    }
    
    // Show typing indicator
    const loadingId = addMessage('', 'skylar', true);
    
    try {
      // Prepare weather context for the API
      const weatherInfo = {
        currentWeather: currentWeather,
        forecast: forecast,
        location: userLocation,
        units: preferredUnits
      };
      
      // Get response from Gemini API for predefined question
      const response = await generateResponse(question, weatherInfo);
      
      // Update the message with the actual response
      updateMessage(loadingId, response.text, false);
      
      // Reset API failure count on success
      if (apiFailureCount > 0) {
        setApiFailureCount(0);
      }
    } catch (error: any) {
      console.error('Error getting response for predefined question:', error);
      updateMessage(loadingId, "I'm sorry, I'm having trouble connecting to my weather brain. Please try again later.", false);
      
      // Increment API failure count
      setApiFailureCount(count => count + 1);
    } finally {
      setIsLoading(false);
    }
  };

  // Render message loading state
  const renderMessageContent = (message: Message) => {
    if (message.loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={message.sender === 'user' ? '#fff' : '#4361EE'} />
          <Text style={[
            styles.loadingText,
            message.sender === 'user' ? styles.userMessageText : styles.skylarMessageText
          ]}>Thinking...</Text>
        </View>
      );
    }
    
    return (
      <Text 
        style={[
          styles.messageText,
          message.sender === 'user' ? styles.userMessageText : styles.skylarMessageText
        ]}
      >
        {message.text}
      </Text>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <LinearGradient
        colors={['#b3d4ff', '#4361EE']}
        style={styles.background}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header with different background */}
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={adjust(20)} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Chat with Skylar</Text>
              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={adjust(20)} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerDivider} />
          </View>
          
          {/* Chat messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View 
                key={`message-${message.id}`} 
                style={[
                  styles.messageBubble, 
                  message.sender === 'user' 
                    ? styles.userMessage 
                    : styles.skylarMessage
                ]}
              >
                {message.sender === 'skylar' && (
                  <View style={styles.messageBubbleAvatar}>
                    <Ionicons name="person" size={adjust(18)} color="#fff" />
                  </View>
                )}
                <View 
                  style={[
                    styles.messageContent,
                    message.sender === 'user' 
                      ? styles.userMessageContent 
                      : styles.skylarMessageContent
                  ]}
                >
                  {renderMessageContent(message)}
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Predefined questions slider */}
          {!showKeyboard && (
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.questionsOuterContainer}
              contentContainerStyle={styles.questionsScrollContent}
            >
              {predefinedQuestions.map((question, index) => (
                <TouchableOpacity
                  key={`question-${question.id}`}
                  style={[
                    styles.questionButton, 
                    index % 2 === 0 ? styles.questionButtonYellow : styles.questionButtonBlue
                  ]}
                  onPress={() => handleQuestionSelect(question.text)}
                >
                  <Text 
                    style={[
                      styles.questionText, 
                      index % 2 === 0 ? styles.questionTextYellow : styles.questionTextBlue
                    ]} 
                    numberOfLines={1}
                  >
                    {question.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          {/* Input area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={adjust(10)}
            style={styles.inputContainer}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ask me about today's plans..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={isLoading}
              >
                <MaterialIcons name="send" size={adjust(20)} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          
          {/* Toast notification for invalid input */}
          {toastVisible && (
            <Animated.View 
              style={[
                styles.toast,
                { opacity: fadeAnim }
              ]}
            >
              <MaterialIcons name="error-outline" size={adjust(18)} color="#fff" />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: 'rgba(179, 212, 255, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: adjust(14),
    paddingVertical: adjust(8),
  },
  headerTitle: {
    flex: 1,
    fontSize: adjust(16),
    fontWeight: '600',
    color: '#333',
    marginLeft: adjust(8),
  },
  avatarContainer: {
    width: adjust(36),
    height: adjust(36),
    borderRadius: adjust(18),
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsButton: {
    width: adjust(36),
    height: adjust(36),
    borderRadius: adjust(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: adjust(14),
    paddingBottom: adjust(140),
    paddingTop: adjust(8),
  },
  messageBubble: {
    marginBottom: adjust(14),
    maxWidth: '80%',
    flexDirection: 'row',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  skylarMessage: {
    alignSelf: 'flex-start',
    marginLeft: adjust(5),
  },
  messageBubbleAvatar: {
    width: adjust(28),
    height: adjust(28),
    borderRadius: adjust(14),
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: adjust(6),
    alignSelf: 'flex-start',
  },
  messageContent: {
    borderRadius: adjust(18),
    paddingHorizontal: adjust(14),
    paddingVertical: adjust(10),
  },
  userMessageContent: {
    backgroundColor: '#4361EE', // Blue for user
  },
  skylarMessageContent: {
    backgroundColor: '#fff', // White for skylar
  },
  messageText: {
    fontSize: adjust(12),
    lineHeight: adjust(14),
  },
  userMessageText: {
    color: '#fff',
  },
  skylarMessageText: {
    color: '#333',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: adjust(8),
    paddingHorizontal: adjust(14),
    height: adjust(54),
    justifyContent: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: adjust(22),
    paddingLeft: adjust(14),
    paddingRight: adjust(4),
    height: adjust(36),
  },
  input: {
    flex: 1,
    paddingVertical: adjust(6),
    fontSize: adjust(13),
    color: '#777',
  },
  sendButton: {
    width: adjust(28),
    height: adjust(28),
    borderRadius: adjust(14),
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: adjust(4),
  },
  questionsOuterContainer: {
    position: 'absolute',
    bottom: adjust(60),
    left: 0,
    right: 0,
    maxHeight: adjust(50),
  },
  questionsScrollContent: {
    paddingHorizontal: adjust(14),
    paddingVertical: adjust(5),
  },
  questionButton: {
    borderRadius: adjust(20),
    paddingHorizontal: adjust(16),
    paddingVertical: adjust(8),
    marginRight: adjust(10),
    justifyContent: 'center',
    minHeight: adjust(36),
  },
  questionButtonBlue: {
    backgroundColor: '#4361EE',
  },
  questionButtonYellow: {
    backgroundColor: '#FFD859',
  },
  questionText: {
    fontSize: adjust(12),
    fontWeight: '500',
    flexShrink: 1,
    lineHeight: adjust(18),
  },
  questionTextBlue: {
    color: '#fff',
  },
  questionTextYellow: {
    color: '#333',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(67, 97, 238, 0.2)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: adjust(20),
    minWidth: adjust(80),
    paddingHorizontal: adjust(5),
    paddingVertical: adjust(3),
  },
  loadingText: {
    marginLeft: adjust(8),
    fontSize: adjust(12),
    fontStyle: 'italic',
  },
  toast: {
    position: 'absolute',
    bottom: adjust(70),
    left: adjust(20),
    right: adjust(20),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: adjust(10),
    paddingHorizontal: adjust(16),
    borderRadius: adjust(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: adjust(14),
    marginLeft: adjust(8),
    fontWeight: '500',
  },
});

export default CommuteScreen; 