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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';

// Define message types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'skylar';
  timestamp: Date;
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

const CommuteScreen = () => {
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);

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

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Add message to chat
  const addMessage = (text: string, sender: 'user' | 'skylar') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    // Auto scroll to bottom
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    // Add user message
    addMessage(inputText, 'user');
    setInputText('');
    
    // Simulate response after delay
    setTimeout(() => {
      respondToMessage(inputText);
    }, 1000);
  };

  // Handle predefined question selection
  const handleQuestionSelect = (question: string) => {
    addMessage(question, 'user');
    
    // Simulate response after delay
    setTimeout(() => {
      respondToMessage(question);
    }, 1000);
  };

  // Generate responses based on user input
  const respondToMessage = (text: string) => {
    let response = '';
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('rain') && lowerText.includes('lunch') && lowerText.includes('1 pm')) {
      response = 'No rain forecasted at 1 PM ☀️\nThe temperature will be perfect for outdoor dining at 72°F!';
    } else if (lowerText.includes('rain today')) {
      response = 'There\'s a 20% chance of light rain this evening around 8 PM, but the day should be mostly clear.';
    } else if (lowerText.includes('check today') || lowerText.includes('today\'s weather')) {
      response = 'Today will be mostly sunny with temperatures between 65°F and 78°F. Perfect day to be outside!';
    } else if (lowerText.includes('evening') || lowerText.includes('tonight')) {
      response = 'This evening will be cool and comfortable, around 65°F with clear skies. Great for outdoor activities!';
    } else if (lowerText.includes('lunch reminder')) {
      response = 'I\'ve set a reminder for your lunch at 1 PM. I\'ll notify you 15 minutes before with a weather update.';
    } else if (lowerText.includes('commute')) {
      response = 'Your morning commute looks clear with temperatures around 68°F. The evening commute may have light traffic due to good weather conditions.';
    } else if (lowerText.includes('umbrella')) {
      response = 'You shouldn\'t need an umbrella today! The forecast shows less than 10% chance of precipitation.';
    } else {
      response = 'I\'m here to help with your weather-related questions. Feel free to ask about today\'s forecast, rain chances, or your commute!';
    }
    
    addMessage(response, 'skylar');
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
                key={message.id} 
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
                  <Text 
                    style={[
                      styles.messageText,
                      message.sender === 'user' 
                        ? styles.userMessageText 
                        : styles.skylarMessageText
                    ]}
                  >
                    {message.text}
                  </Text>
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
              <TouchableOpacity
                style={[styles.questionButton, styles.questionButtonYellow]}
                onPress={() => handleQuestionSelect('Check today\'s weather')}
              >
                <Text style={[styles.questionText, styles.questionTextYellow]} numberOfLines={1}>
                  Check today's weather
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.questionButton, styles.questionButtonBlue]}
                onPress={() => handleQuestionSelect('Will it rain today?')}
              >
                <Text style={[styles.questionText, styles.questionTextBlue]} numberOfLines={1}>
                  Will it rain today?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.questionButton, styles.questionButtonYellow]}
                onPress={() => handleQuestionSelect('Will it rain during my lunch break at 1 PM?')}
              >
                <Text style={[styles.questionText, styles.questionTextYellow]} numberOfLines={1}>
                  Will it rain during my lunch break at 1 PM?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.questionButton, styles.questionButtonBlue]}
                onPress={() => handleQuestionSelect('Set lunch reminder')}
              >
                <Text style={[styles.questionText, styles.questionTextBlue]} numberOfLines={1}>
                  Set lunch reminder
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.questionButton, styles.questionButtonYellow]}
                onPress={() => handleQuestionSelect('Check evening forecast')}
              >
                <Text style={[styles.questionText, styles.questionTextYellow]} numberOfLines={1}>
                  Check evening forecast
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.questionButton, styles.questionButtonBlue]}
                onPress={() => handleQuestionSelect('What\'s the weather like this evening?')}
              >
                <Text style={[styles.questionText, styles.questionTextBlue]} numberOfLines={1}>
                  What's the weather like this evening?
                </Text>
              </TouchableOpacity>
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
              >
                <MaterialIcons name="send" size={adjust(20)} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
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
});

export default CommuteScreen; 