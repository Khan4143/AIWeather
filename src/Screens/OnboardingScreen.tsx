import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';
import Umbrella from 'react-native-vector-icons/FontAwesome5'
import { UserDataManager } from '../utils/userDataManager';

const OnboardingScreen = ({ navigation }: { navigation: any }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Hide header on mount
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false
      });
    }

    const unsubscribe = navigation.addListener('focus', () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEnableNotifications = () => {
    // Logic to request notification permissions would go here
    // Then navigate to next screen
    navigation.navigate('Intro');
  };

  const handleMaybeLater = () => {
    // Navigate but don't enable notifications
    navigation.navigate('Intro');
  };

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  const needsScrollView = contentHeight > SCREEN_HEIGHT * 0.9;

  const handleComplete = async () => {
    try {
      // Save all user data and navigate to main app
      await UserDataManager.saveAllData();
      navigation.navigate('MainApp');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

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

      {/* Umbrella Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Umbrella name="umbrella" size={adjust(90)} color="#ffffff" />
        </View>
      </View>

      {/* Title and Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Never Caught Off Guard{'\n'}Again!</Text>
        <Text style={styles.description}>
          Skylar sends personalized notifications{'\n'}
          so weather never interrupts your plans.{'\n'}
          Always know exactly what to wear, when{'\n'}
          to commute, and when to stay safe.
        </Text>
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialsContainer}>
        {/* First testimonial */}
        <View style={styles.testimonialCard}>
          <View style={styles.testimonialIcon}>
            <Feather name="check-circle" size={adjust(16)} color="#fff" />
          </View>
          <Text style={styles.testimonialText}>
            90% of Skylar users say alerts helped them avoid discomfort or delays. You'll love it too!
          </Text>
        </View>

        {/* Second testimonial */}
        <View style={styles.testimonialCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={adjust(16)} color="#fff" />
            </View>
          </View>
          <Text style={styles.testimonialText}>
            I'll only alert you when it matters most
          </Text>
        </View>
      </View>

      {/* Call to Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.enableButton}
          activeOpacity={0.9}
          onPress={handleEnableNotifications}
        >
          <View style={styles.buttonIconContainer}>
            <Feather name="check-circle" size={adjust(16)} color="#fff" />
          </View>
          <Text style={styles.enableButtonText}>Enable Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleMaybeLater}
          activeOpacity={0.7}
        >
          <Text style={styles.laterText}>Maybe Later (miss important alerts!)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LinearGradient
        colors={['#b3d4ff', '#5c85e6']}
        style={styles.background}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#b3d4ff', // Match the gradient start color
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: adjust(20),
    paddingBottom: adjust(20),
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
    width: adjust(32),
    height: adjust(32),
    borderRadius: adjust(18),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: adjust(8),
    marginTop: adjust(10),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: adjust(5),
    marginBottom: adjust(30),
    // zIndex: 1,
  },
  iconCircle: {
    width: adjust(170),
    height: adjust(170),
    borderRadius: adjust(85),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    // zIndex: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: adjust(30),
  },
  title: {
    fontSize: adjust(20),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: adjust(15),
  },
  description: {
    fontSize: adjust(14),
    color: '#333',
    textAlign: 'center',
    lineHeight: adjust(20),
  },
  testimonialsContainer: {
    marginBottom: adjust(30),
  },
  testimonialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: adjust(12),
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(16),
    marginBottom: adjust(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  testimonialIcon: {
    width: adjust(24),
    height: adjust(24),
    borderRadius: adjust(12),
    backgroundColor: '#4361ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: adjust(10),
  },
  avatarContainer: {
    marginRight: adjust(10),
  },
  avatar: {
    width: adjust(24),
    height: adjust(24),
    borderRadius: adjust(12),
    backgroundColor: '#4361ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialText: {
    flex: 1,
    fontSize: adjust(12),
    color: '#333',
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: adjust(10),
  },
  enableButton: {
    flexDirection: 'row',
    backgroundColor: '#517FE0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: adjust(25),
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(20),
    width: '100%',
    marginBottom: adjust(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonIconContainer: {
    marginRight: adjust(8),
  },
  enableButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: adjust(14),
  },
  laterText: {
    color: '#333',
    fontSize: adjust(12),
  },
});

export default OnboardingScreen;
