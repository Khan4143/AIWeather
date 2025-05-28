import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icons from 'react-native-vector-icons/Feather';
import { UserDataManager } from '../utils/userDataManager';

const WelcomeScreen = ({ navigation }: { navigation: any }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Hide header on mount
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false
      });
    }

    // Check if user data already exists, then redirect to main app
    // But only if not intentionally accessing onboarding from profile
    const checkExistingUser = async () => {
      const route = navigation.getState().routes.find((r: any) => r.name === 'Welcome');
      const bypassCheck = route?.params?.bypassOnboardingCheck;
      
      // Skip the redirect if we're intentionally going to onboarding
      if (bypassCheck) return;
      
      const userData = UserDataManager.getAllUserData();
      const hasUserData = userData.profile && 
                         userData.profile.location && 
                         userData.dailyRoutine && 
                         userData.preferences;
                          
      if (hasUserData) {
        navigation.replace('MainApp');
      }
    };
    
    checkExistingUser();

    const unsubscribe = navigation.addListener('focus', () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleNavigate = () => {
    navigation.navigate('UserInfo');
  };

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  const needsScrollView = contentHeight > SCREEN_HEIGHT;

  const renderContent = () => (
    <LinearGradient
      colors={['#b3d4ff', '#5c85e6']}
      style={styles.background}
    >
      {/* Background Bubbles */}
      <View style={[styles.bubble, { top: '10%', left: '10%', width: SCREEN_WIDTH * 0.2, height: SCREEN_WIDTH * 0.2, opacity: 0.15 }]} />
      <View style={[styles.bubble, { top: '35%', right: '2%', width: SCREEN_WIDTH * 0.15, height: SCREEN_WIDTH * 0.15, opacity: 0.1 }]} />
      <View style={[styles.bubble, { bottom: '65%', left: '15%', width: SCREEN_WIDTH * 0.18, height: SCREEN_WIDTH * 0.18, opacity: 0.12 }]} />
      {/* <View style={[styles.bubble, { bottom: '20%', right: '8%', width: SCREEN_WIDTH * 0.22, height: SCREEN_WIDTH * 0.22, opacity: 0.15 }]} /> */}

      {/* Weather Icon Cloud with Sun */}
      <View style={styles.logoContainer}>
        <View style={styles.cloudSunContainer}>
          <View style={styles.iconContainer}>
            <Icon name="cloud-outline" size={adjust(120)} color="#7490E5" />
            <View style={styles.sunPosition}>
              <Icons name="sun" size={adjust(40)} color="#FFC857" />
            </View>
          </View>
        </View>
      </View>

      {/* Welcome Text */}
      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeTitle}>Welcome to Skylar</Text>
        <Text style={styles.welcomeSubtitle}>
          Weather shouldn't just inform—it{'\n'}should guide your day.
        </Text>
      </View>

      {/* Weather Icons Grid */}
      <View style={styles.iconsGrid}>
        <View style={styles.iconRow}>
          <View style={styles.iconCircle}>
            <Feather name="sun" size={adjust(24)} color="#ffffff80" />
          </View>
          <View style={styles.iconCircle}>
            <Feather name="cloud-rain" size={adjust(24)} color="#ffffff80" />
          </View>
        </View>
        <View style={styles.iconRow}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="run" size={adjust(24)} color="#ffffff80" />
          </View>
          <View style={styles.iconCircle}>
            <Ionicons name="umbrella-outline" size={adjust(24)} color="#ffffff80" />
          </View>
        </View>
        <View style={styles.iconRow}>
          <View style={styles.iconCircle}>
            <Feather name="cloud" size={adjust(24)} color="#ffffff80" />
          </View>
          <View style={styles.iconCircle}>
            <Ionicons name="cafe-outline" size={adjust(24)} color="#ffffff80" />
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity 
        style={styles.button} 
        activeOpacity={0.8}
        onPress={handleNavigate}
      >
        <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
          Let's Personalize Your Weather Experience
        </Text>
      </TouchableOpacity>

      {/* Tagline */}
      <Text style={styles.tagline}>Your Lifestyle. Your Forecast. AI-Powered</Text>

      {/* Progress Indicator */}
      {/* <View style={styles.progressContainer}>
        <View style={styles.progressIndicator} />
      </View> */}
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <View 
        ref={contentRef} 
        onLayout={handleContentLayout} 
        style={[styles.measureContainer, { position: 'absolute', opacity: 0 }]}
      >
        {renderContent()}
      </View>
      
      {needsScrollView ? (
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      ) : (
        renderContent()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3d4ff',
  },
  measureContainer: {
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: adjust(24),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? adjust(15) : (StatusBar.currentHeight || 0) + adjust(15),
    paddingBottom: adjust(30),
    minHeight: SCREEN_HEIGHT,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: adjust(40),
    marginBottom: adjust(40),
    height: adjust(120),
    width: '100%',
    zIndex: 2,
  },
  cloudSunContainer: {
    position: 'relative',
    width: '100%',
    height: adjust(120),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunPosition: {
    position: 'absolute',
    top: adjust(42),
    zIndex: 2,
  },
  cloud: {
    position: 'absolute',
    width: adjust(100),
    height: adjust(55),
    borderRadius: adjust(30),
    backgroundColor: 'rgba(126, 152, 238, 0.6)',
    borderWidth: adjust(2),
    borderColor: '#ffffff',
    zIndex: 1,
    top: adjust(30),
  },
  sunOuter: {
    position: 'absolute',
    width: adjust(45),
    height: adjust(45),
    borderRadius: adjust(22.5),
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    top: adjust(5),
  },
  sun: {
    width: adjust(30),
    height: adjust(30),
    borderRadius: adjust(15),
    backgroundColor: '#FFD700',
  },
  ray: {
    position: 'absolute',
    width: adjust(10),
    height: adjust(2),
    backgroundColor: '#FFD700',
    borderRadius: adjust(1),
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: adjust(40),
  },
  welcomeTitle: {
    fontSize: adjust(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: adjust(10),
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: adjust(14),
    color: '#555',
    textAlign: 'center',
    lineHeight: adjust(20),
  },
  iconsGrid: {
    width: '100%',
    marginBottom: adjust(40),
    opacity: 0.6,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: adjust(20),
  },
  iconCircle: {
    width: adjust(40),
    height: adjust(40),
    borderRadius: adjust(18),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#517FE0',
    paddingVertical: adjust(14),
    borderRadius: adjust(30),
    alignItems: 'center',
    marginBottom: adjust(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    paddingHorizontal: adjust(10),
  },
  buttonText: {
    color: '#fff',
    fontSize: adjust(12),
    fontWeight: 'bold',
  },
  tagline: {
    color: '#black',
    fontSize: adjust(12),
    fontWeight: '400',
    marginBottom: adjust(20),
  },
  progressContainer: {
    width: '70%',
    height: adjust(4),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: adjust(2),
  },
  progressIndicator: {
    width: '33%',
    height: '100%',
    backgroundColor: '#444',
    borderRadius: adjust(2),
  },
});

export default WelcomeScreen;