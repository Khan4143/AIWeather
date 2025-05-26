import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    // Hide header on mount
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false
      });
    }
  }, [navigation]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleGetStarted = () => {
    navigation.navigate('UserInfo');
  };

  const handleSkip = () => {
    navigation.navigate('UserInfo');
  };

  const handleMeetSkylar = () => {
    // Play video or show intro animation
    console.log('Play Skylar intro video');
  };

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  const needsScrollView = contentHeight > SCREEN_HEIGHT * 0.9;

  const renderContent = () => (
    <View style={styles.contentContainer} onLayout={handleContentLayout}>
      {/* Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          activeOpacity={0.8}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={adjust(20)} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Sun Icon */}
      <View style={styles.sunContainer}>
        <View style={styles.sunCircle}>
          <Feather name="sun" size={adjust(24)} color="#FFFFFF" style={styles.sunIcon} />
        </View>
      </View>

      {/* Welcome Message */}
      <View style={styles.messageContainer}>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            Hi! I'm Skylar, your weather companion. I'll ensure weather never disrupts your plans again!
          </Text>
        </View>
      </View>

      {/* Feature Cards */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureRow}>
          {/* Personalized Forecasts */}
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.9}>
            <View style={styles.featureIconContainer}>
              <Feather name="sun" size={adjust(18)} color="#4361ee" />
            </View>
            <Text style={styles.featureLabel}>Personalized{'\n'}Forecasts</Text>
          </TouchableOpacity>

          {/* Smart Outfit Tips */}
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.9}>
            <View style={styles.featureIconContainer}>
              <Feather name="shopping-bag" size={adjust(18)} color="#4361ee" />
            </View>
            <Text style={styles.featureLabel}>Smart{'\n'}Outfit Tips</Text>
          </TouchableOpacity>

          {/* Weather-proof Plans */}
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.9}>
            <View style={styles.featureIconContainer}>
              <Feather name="calendar" size={adjust(18)} color="#4361ee" />
            </View>
            <Text style={styles.featureLabel}>Weather-{'\n'}proof Plans</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Meet Skylar Video */}
      <View style={styles.videoContainer}>
        <TouchableOpacity 
          style={styles.videoBox}
          activeOpacity={0.9}
          onPress={handleMeetSkylar}
        >
          <View style={styles.playButton}>
            <Ionicons name="play" size={adjust(24)} color="#4361ee" />
          </View>
          <Text style={styles.videoText}>Meet Skylar (30 sec)</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.getStartedButton}
          activeOpacity={0.9}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>Get Started 🚀</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#c9e3ff', '#7698ee']}
        style={styles.background}
      >
        {needsScrollView ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        ) : (
          renderContent()
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#c9e3ff', // Match the blue color from the background
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: adjust(20),
    paddingBottom: adjust(30),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: adjust(10),
    paddingBottom: adjust(4),
    marginBottom: adjust(5),
  },
  backButton: {
    width: adjust(36),
    height: adjust(36),
    borderRadius: adjust(18),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: adjust(8),
  },
  sunContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: adjust(20),
    marginBottom: adjust(30),
  },
  sunCircle: {
    width: adjust(120),
    height: adjust(120),
    borderRadius: adjust(60),
    backgroundColor: '#FFD700', // Bright yellow for the sun
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunIcon: {
    color: '#FFFFFF',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: adjust(25),
  },
  messageBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: adjust(20),
    paddingVertical: adjust(15),
    paddingHorizontal: adjust(20),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: adjust(14),
    color: '#333',
    textAlign: 'center',
    lineHeight: adjust(20),
  },
  featuresContainer: {
    marginBottom: adjust(25),
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: adjust(15),
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(10),
    alignItems: 'center',
    width: SCREEN_WIDTH / 3.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIconContainer: {
    width: adjust(36),
    height: adjust(36),
    borderRadius: adjust(18),
    backgroundColor: 'rgba(200, 220, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: adjust(8),
  },
  featureLabel: {
    fontSize: adjust(10),
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: adjust(14),
  },
  videoContainer: {
    alignItems: 'center',
    marginBottom: adjust(25),
  },
  videoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: adjust(15),
    paddingVertical: adjust(20),
    paddingHorizontal: adjust(20),
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  playButton: {
    width: adjust(50),
    height: adjust(50),
    borderRadius: adjust(25),
    backgroundColor: 'rgba(200, 220, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: adjust(10),
  },
  videoText: {
    fontSize: adjust(14),
    color: '#333',
    fontWeight: '500',
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: adjust(10),
  },
  getStartedButton: {
    backgroundColor: '#4361ee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: adjust(25),
    paddingVertical: adjust(14),
    paddingHorizontal: adjust(20),
    width: '100%',
    marginBottom: adjust(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  getStartedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: adjust(16),
  },
  skipText: {
    color: '#333',
    fontSize: adjust(14),
    marginTop: adjust(5),
  },
});

export default HomeScreen;
