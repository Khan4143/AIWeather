import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import adjust from '../utils/adjust';
import { SCREEN_WIDTH } from '../constants/dimesions';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserDataManager } from '../utils/userDataManager';
import { useFocusEffect } from '@react-navigation/native';

// Add interfaces that match the actual data structures
interface UserDataType {
  age: string;
  gender: string;
  occupation: string;
  location: string;
  name?: string; // Added for compatibility
}

interface DailyRoutineType {
  morningActivity: string | null;
  commuteMethod: string | null;
  commuteTime: {
    hours: number;
    minutes: number;
    isAM: boolean;
  };
  eveningActivity: string | null;
  selectedActivity: string | null;
  selectedActivities: string[];
  activities: string[];
}

interface PreferenceDataType {
  style: string | null;
  healthConcerns: string[];
  activities: string[];
  notifications?: {
    commute?: boolean;
    clothing?: boolean;
    health?: boolean;
    events?: boolean;
  };
  units?: {
    temperature?: string;
  };
  language?: string;
}

type ProfileScreenProps = {
  navigation: StackNavigationProp<any>;
};

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  // State for toggle switches
  const [commuteAlerts, setCommuteAlerts] = useState(false);
  const [clothingSuggestions, setClothingSuggestions] = useState(false);
  const [healthTips, setHealthTips] = useState(false);
  const [eventReminders, setEventReminders] = useState(false);
  
  // User data state
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userGender, setUserGender] = useState('');
  const [userOccupation, setUserOccupation] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [temperatureUnit, setTemperatureUnit] = useState('°F');
  const [languagePreference, setLanguagePreference] = useState('English');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // Morning activities
  const allMorningActivities = [
    { id: '1', name: 'Running', icon: 'run', selected: false },
    { id: '2', name: 'Yoga', icon: 'yoga', selected: false },
    { id: '3', name: 'Coffee', icon: 'coffee', selected: false },
    { id: '4', name: 'Reading', icon: 'book', selected: false },
    { id: '5', name: 'Gym', icon: 'weight-lifter', selected: false },
  ];

  const [morningActivities, setMorningActivities] = useState(allMorningActivities);
  const [userCommuteMethod, setUserCommuteMethod] = useState('');
  const [userCommuteTime, setUserCommuteTime] = useState({ hours: 8, minutes: 0, isAM: true });
  const [userEveningActivity, setUserEveningActivity] = useState('');

  // Load user data when the component mounts and when screen comes into focus
  useEffect(() => {
    loadUserData();
  }, []);

  // Reload data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("Profile screen focused - reloading user data");
      loadUserData();
      return () => {};
    }, [])
  );

  const loadUserData = async () => {
    // First try to load from AsyncStorage
    await UserDataManager.loadAllData();
    
    // Then get the loaded data
    const userData = UserDataManager.getAllUserData();
    
    // Using optional chaining and type assertions for safety
    if (userData.profile) {
      const profile = userData.profile as UserDataType;
      setUserOccupation(profile.occupation || '');
      setUserName(profile.name || profile.occupation || '');
      setUserLocation(profile.location || '');
      setUserAge(profile.age || '');
      setUserGender(profile.gender || '');
      
      console.log("Loaded user profile data:", profile);
    }
    
    if (userData.preferences) {
      const preferences = userData.preferences as PreferenceDataType;
      // Load notification preferences with optional chaining
      setCommuteAlerts(preferences.notifications?.commute || false);
      setClothingSuggestions(preferences.notifications?.clothing || false);
      setHealthTips(preferences.notifications?.health || false);
      setEventReminders(preferences.notifications?.events || false);
      
      // Load temperature unit
      if (preferences.units?.temperature) {
        setTemperatureUnit(preferences.units.temperature);
      }
      
      // Load language
      if (preferences.language) {
        setLanguagePreference(preferences.language);
      }
    }
    
    if (userData.dailyRoutine) {
      const dailyRoutine = userData.dailyRoutine as DailyRoutineType;
      
      // Set commute data
      if (dailyRoutine.commuteMethod) {
        setUserCommuteMethod(dailyRoutine.commuteMethod);
      }
      
      if (dailyRoutine.commuteTime) {
        setUserCommuteTime(dailyRoutine.commuteTime);
      }
      
      // Set evening activity
      if (dailyRoutine.eveningActivity) {
        setUserEveningActivity(dailyRoutine.eveningActivity);
      }
      
      // Update morning activities with selected state
      if (dailyRoutine.activities && dailyRoutine.activities.length > 0) {
        // Mark activities as selected
        const updatedActivities = allMorningActivities.map(activity => ({
          ...activity,
          selected: dailyRoutine.activities.includes(activity.name)
        }));
        
        setMorningActivities(updatedActivities);
        
        // Use selectedActivities if available, otherwise fall back to activities
        const activitiesToUse = dailyRoutine.selectedActivities || dailyRoutine.activities;
        setSelectedActivities(activitiesToUse);
      }
      
      console.log("Loaded daily routine data:", dailyRoutine);
    }
  };

  // Function to navigate to onboarding screens
  const navigateToOnboarding = () => {
    navigation.navigate('Welcome', { bypassOnboardingCheck: true });
  };

  // Add this function to get appropriate icons for activities
  const getIconForActivity = (activity: string): string => {
    switch (activity.toLowerCase()) {
      case 'sports': return 'basketball';
      case 'gardening': return 'flower';
      case 'dog walk': return 'dog';
      case 'social events': return 'account-group';
      case 'netflix/movie': return 'movie-open';
      case 'reading': return 'book-open-variant';
      case 'running': return 'run';
      case 'gym': return 'dumbbell';
      case 'yoga': return 'yoga';
      case 'bbq': return 'food';
      case 'hiking': return 'hiking';
      case 'beach': return 'beach';
      case 'camping': return 'tent';
      case 'cycling': return 'bike';
      default: return 'star';
    }
  };

  return (
    <>
      <LinearGradient
        colors={['#E9F2FF', '#FCFDFF']}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header with settings */}
            <View style={styles.headerRow}>
              <View style={styles.transparent} />
              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={adjust(22)} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Text style={styles.avatarInitial}>
                  {userGender ? userGender.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
              <Text style={styles.greeting}>
                Hi {userName || userOccupation || 'User'} 👋
              </Text>
              <Text style={styles.subtitle}>
                {userAge ? `Age ${userAge}, ` : ''}{userGender ? `${userGender.charAt(0).toUpperCase() + userGender.slice(1)}, ` : ''}
                {userLocation ? `From ${userLocation}` : 'Skylar knows your day inside and out'}
              </Text>
            </View>

            {/* User Information Section */}
            <Text style={styles.sectionTitle}>Your Information</Text>
            <View style={styles.userInfoContainer}>
              {/* Age */}
              <TouchableOpacity style={styles.infoCard}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{userAge || 'Not set'}</Text>
              </TouchableOpacity>

              {/* Gender */}
              <TouchableOpacity style={styles.infoCard}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{userGender ? userGender.charAt(0).toUpperCase() + userGender.slice(1) : 'Not set'}</Text>
              </TouchableOpacity>

              {/* Occupation */}
              <TouchableOpacity style={styles.infoCard}>
                <Text style={styles.infoLabel}>Occupation</Text>
                <Text style={styles.infoValue}>{userOccupation || 'Not set'}</Text>
              </TouchableOpacity>

              {/* Location */}
              <TouchableOpacity style={styles.infoCard}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{userLocation || 'Not set'}</Text>
              </TouchableOpacity>
            </View>

            {/* Your Routine Preferences */}
            <Text style={styles.sectionTitle}>Your Routine Preferences</Text>
            
            {/* Morning Activities */}
            <Text style={styles.subSectionTitle}>Morning Activities</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activitiesContainer}
            >
              {morningActivities.map((activity) => (
                <View 
                  key={activity.id} 
                  style={[
                    styles.activityBubble,
                    activity.selected && styles.selectedActivity
                  ]}
                >
                  <MaterialCommunityIcons 
                    name={activity.icon} 
                    size={adjust(16)} 
                    color={activity.selected ? "#fff" : "#666"} 
                  />
                  <Text style={[
                    styles.activityText,
                    activity.selected && styles.selectedActivityText
                  ]}>
                    {activity.name}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Evening Activities */}
            <Text style={styles.subSectionTitle}>Evening Activities</Text>
            <View style={styles.eveningActivitiesContainer}>
              {selectedActivities.length > 0 ? (
                selectedActivities.map((activity, index) => (
                  <View key={index} style={styles.eveningActivityBadge}>
                    <MaterialCommunityIcons
                      name={getIconForActivity(activity)}
                      size={adjust(14)}
                      color="#fff"
                    />
                    <Text style={styles.eveningActivityText}>{activity}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noActivitiesText}>No evening activities selected</Text>
              )}
            </View>

            {/* Commute Preferences */}
            <View style={styles.commuteSection}>
              <View style={styles.commuteHeader}>
                <MaterialIcons name="commute" size={adjust(18)} color="#333" />
                <Text style={styles.commuteTitle}>Commute Preferences</Text>
              </View>

              {/* Transport Type */}
              <TouchableOpacity style={styles.preferencesRow}>
                <Text style={styles.preferenceLabel}>Transport Type</Text>
                <View style={styles.preferenceValue}>
                  <Text style={styles.preferenceValueText}>
                    {userCommuteMethod ? userCommuteMethod.charAt(0).toUpperCase() + userCommuteMethod.slice(1) : 'Not set'}
                  </Text>
                  <Ionicons name="chevron-forward" size={adjust(16)} color="#4361EE" />
                </View>
              </TouchableOpacity>

              {/* Departure Time */}
              <TouchableOpacity style={styles.preferencesRow}>
                <Text style={styles.preferenceLabel}>Departure Time</Text>
                <View style={styles.preferenceValue}>
                  <Text style={styles.preferenceValueText}>
                    {userCommuteTime ? 
                      `${userCommuteTime.hours}:${userCommuteTime.minutes.toString().padStart(2, '0')} ${userCommuteTime.isAM ? 'AM' : 'PM'}` 
                      : '8:30 AM'}
                  </Text>
                  <Ionicons name="chevron-forward" size={adjust(16)} color="#4361EE" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Notification Box */}
            <View style={styles.notificationBox}>
              <Text style={styles.notificationText}>
                I'll adjust your notifications and outfit tips accordingly 👍
              </Text>
            </View>

            {/* Smart Notifications */}
            <Text style={styles.sectionTitle}>Smart Notifications</Text>
            
            {/* Notification Options */}
            <View style={styles.notificationOptions}>
              {/* Commute alerts */}
              <View style={styles.notificationRow}>
                <View style={styles.notificationLabel}>
                  <MaterialIcons name="commute" size={adjust(18)} color="#333" />
                  <Text style={styles.notificationText}>Commute alerts</Text>
                </View>
                <Switch
                  value={commuteAlerts}
                  onValueChange={setCommuteAlerts}
                  trackColor={{ false: '#e0e0e0', true: '#b3c7ff' }}
                  thumbColor={commuteAlerts ? '#4361EE' : '#f4f3f4'}
                  ios_backgroundColor="#e0e0e0"
                />
              </View>

              {/* Clothing suggestions */}
              <View style={styles.notificationRow}>
                <View style={styles.notificationLabel}>
                  <MaterialIcons name="checkroom" size={adjust(18)} color="#333" />
                  <Text style={styles.notificationText}>Clothing suggestions</Text>
                </View>
                <Switch
                  value={clothingSuggestions}
                  onValueChange={setClothingSuggestions}
                  trackColor={{ false: '#e0e0e0', true: '#b3c7ff' }}
                  thumbColor={clothingSuggestions ? '#4361EE' : '#f4f3f4'}
                  ios_backgroundColor="#e0e0e0"
                />
              </View>

              {/* Health tips */}
              <View style={styles.notificationRow}>
                <View style={styles.notificationLabel}>
                  <MaterialIcons name="favorite-border" size={adjust(18)} color="#333" />
                  <Text style={styles.notificationText}>Health tips</Text>
                </View>
                <Switch
                  value={healthTips}
                  onValueChange={setHealthTips}
                  trackColor={{ false: '#e0e0e0', true: '#b3c7ff' }}
                  thumbColor={healthTips ? '#4361EE' : '#f4f3f4'}
                  ios_backgroundColor="#e0e0e0"
                />
              </View>

              {/* Event reminders */}
              <View style={styles.notificationRow}>
                <View style={styles.notificationLabel}>
                  <Ionicons name="time-outline" size={adjust(18)} color="#333" />
                  <Text style={styles.notificationText}>Event reminders</Text>
                </View>
                <Switch
                  value={eventReminders}
                  onValueChange={setEventReminders}
                  trackColor={{ false: '#e0e0e0', true: '#b3c7ff' }}
                  thumbColor={eventReminders ? '#4361EE' : '#f4f3f4'}
                  ios_backgroundColor="#e0e0e0"
                />
              </View>
            </View>

            <Text style={styles.notificationCaption}>
              Skylar only alerts you when it matters — not too often
            </Text>

            {/* Customize Timing Button */}
            <TouchableOpacity style={styles.customizeButton}>
              <Text style={styles.customizeButtonText}>Customize Timing</Text>
            </TouchableOpacity>

            {/* Skylar's Forecast History */}
            <Text style={styles.sectionTitle}>Skylar's Forecast History</Text>
            
            {/* Forecast history items */}
            <View style={styles.historyContainer}>
              {/* April 28 history */}
              <View style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>Apr 28</Text>
                  <View style={styles.statusDot} />
                </View>
                
                <Text style={styles.historyQuestion}>Should I run at 6:30 AM?</Text>
                <Text style={styles.historyResponse}>
                  It's likely to rain <Text style={[styles.blueText, styles.weatherIcon]}>☂</Text> by 7:15 AM.
                </Text>
                <Text style={styles.historyUserAction}>
                  <Text style={styles.greenText}>You moved your run!</Text>
                </Text>
              </View>

              {/* April 27 history */}
              <View style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>Apr 27</Text>
                  <View style={styles.statusDot} />
                </View>
                
                <Text style={styles.historyQuestion}>What should I wear today?</Text>
                <Text style={styles.historyResponse}>
                  Light jacket recommended <Text style={[styles.blueText, styles.temperatureText]}>— 18°F</Text> with light breeze.
                </Text>
                <Text style={styles.historyUserAction}>
                  <Text style={styles.greenText}>Perfect choice!</Text>
                </Text>
              </View>
            </View>

            {/* Other Preferences */}
            <Text style={styles.sectionTitle}>Other Preferences</Text>
            
            {/* Preference cards grid */}
            <View style={styles.preferencesGrid}>
              {/* Location */}
              <TouchableOpacity style={styles.preferenceCard}>
                <View style={styles.preferenceIconContainer}>
                  <Ionicons name="location-outline" size={adjust(20)} color="#4361EE" />
                </View>
                <Text style={styles.preferenceCardTitle}>Location</Text>
                <Text style={styles.preferenceCardValue}>{userLocation || 'New York'}</Text>
              </TouchableOpacity>

              {/* Outfit Style */}
              <TouchableOpacity style={styles.preferenceCard}>
                <View style={styles.preferenceIconContainer}>
                  <MaterialIcons name="checkroom" size={adjust(20)} color="#4361EE" />
                </View>
                <Text style={styles.preferenceCardTitle}>Outfit Style</Text>
                <Text style={styles.preferenceCardValue}>Casual</Text>
              </TouchableOpacity>

              {/* Health Tags */}
              <TouchableOpacity style={styles.preferenceCard}>
                <View style={styles.preferenceIconContainer}>
                  <MaterialIcons name="favorite-outline" size={adjust(20)} color="#4361EE" />
                </View>
                <Text style={styles.preferenceCardTitle}>Health Tags</Text>
                <Text style={styles.preferenceCardValue}>2 Active</Text>
              </TouchableOpacity>

              {/* App Settings */}
              <TouchableOpacity style={styles.preferenceCard}>
                <View style={styles.preferenceIconContainer}>
                  <Ionicons name="settings-outline" size={adjust(20)} color="#4361EE" />
                </View>
                <Text style={styles.preferenceCardTitle}>App Settings</Text>
                <Text style={styles.preferenceCardValue}>{temperatureUnit}, {languagePreference}</Text>
              </TouchableOpacity>
            </View>

            {/* Save Changes Button */}
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            {/* Reset Preferences */}
            <TouchableOpacity style={styles.resetContainer}>
              <Text style={styles.resetText}>Reset Preferences</Text>
            </TouchableOpacity>

            {/* Developer button for onboarding access */}
            <TouchableOpacity 
              style={styles.devButton} 
              onPress={navigateToOnboarding}
            >
              <Text style={styles.devButtonText}>Go to Onboarding</Text>
            </TouchableOpacity>

            {/* Home indicator */}
            <View style={styles.homeIndicator}>
              <View style={styles.homeIndicatorBar} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: adjust(20),
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: adjust(10),
  },
  transparent: {
    width: adjust(24),
    height: adjust(24),
  },
  settingsButton: {
    width: adjust(40),
    height: adjust(40),
    borderRadius: adjust(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'flex-start',
    marginTop: adjust(5),
    marginBottom: adjust(24),
  },
  profileImageContainer: {
    width: adjust(60),
    height: adjust(60),
    borderRadius: adjust(30),
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: adjust(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarInitial: {
    fontSize: adjust(24),
    fontWeight: 'bold',
    color: '#fff',
  },
  greeting: {
    fontSize: adjust(24),
    fontWeight: '600',
    color: '#333',
    marginBottom: adjust(4),
  },
  subtitle: {
    fontSize: adjust(14),
    color: '#666',
  },
  sectionTitle: {
    fontSize: adjust(16),
    fontWeight: '600',
    color: '#333',
    marginTop: adjust(16),
    marginBottom: adjust(10),
  },
  subSectionTitle: {
    fontSize: adjust(14),
    color: '#666',
    marginBottom: adjust(8),
  },
  activitiesContainer: {
    paddingVertical: adjust(4),
    marginBottom: adjust(16),
  },
  activityBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: adjust(20),
    paddingHorizontal: adjust(12),
    paddingVertical: adjust(6),
    marginRight: adjust(8),
  },
  selectedActivity: {
    backgroundColor: '#4361EE',
  },
  activityText: {
    fontSize: adjust(12),
    fontWeight: '500',
    color: '#666',
    marginLeft: adjust(6),
  },
  selectedActivityText: {
    color: '#fff',
  },
  commuteSection: {
    marginBottom: adjust(16),
  },
  commuteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(8),
  },
  commuteTitle: {
    fontSize: adjust(14),
    color: '#666',
    marginLeft: adjust(6),
  },
  preferencesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: adjust(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceLabel: {
    fontSize: adjust(14),
    color: '#333',
  },
  preferenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceValueText: {
    fontSize: adjust(14),
    color: '#4361EE',
    marginRight: adjust(4),
  },
  notificationBox: {
    backgroundColor: 'rgba(232, 240, 255, 0.7)',
    borderRadius: adjust(10),
    padding: adjust(16),
    marginBottom: adjust(20),
  },
  notificationOptions: {
    marginVertical: adjust(8),
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: adjust(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: adjust(14),
    color: '#333',
    marginLeft: adjust(8),
  },
  notificationCaption: {
    fontSize: adjust(13),
    color: '#666',
    marginTop: adjust(8),
    marginBottom: adjust(16),
  },
  customizeButton: {
    backgroundColor: '#4361EE',
    borderRadius: adjust(10),
    paddingVertical: adjust(14),
    alignItems: 'center',
    marginBottom: adjust(24),
  },
  customizeButtonText: {
    color: '#fff',
    fontSize: adjust(14),
    fontWeight: '600',
  },
  historyContainer: {
    marginTop: adjust(8),
    marginBottom: adjust(24),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: adjust(16),
    padding: adjust(12),
    paddingBottom: adjust(4),
  },
  historyItem: {
    marginBottom: adjust(16),
    backgroundColor: 'white',
    borderRadius: adjust(14),
    padding: adjust(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4361EE',
    overflow: 'hidden',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: adjust(10),
    paddingBottom: adjust(6),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f8',
  },
  historyDate: {
    fontSize: adjust(14),
    fontWeight: '600',
    color: '#333',
    marginRight: adjust(6),
  },
  statusDot: {
    width: adjust(8),
    height: adjust(8),
    borderRadius: adjust(4),
    backgroundColor: '#4CD964',
    marginRight: adjust(2),
  },
  historyQuestion: {
    fontSize: adjust(14),
    fontWeight: '500',
    color: '#333',
    marginBottom: adjust(6),
  },
  historyResponse: {
    fontSize: adjust(14),
    color: '#333',
    marginBottom: adjust(4),
    flexShrink: 1,
    lineHeight: adjust(20),
  },
  historyUserAction: {
    fontSize: adjust(14),
    color: '#666',
    marginTop: adjust(2),
  },
  blueText: {
    color: '#4361EE',
    fontWeight: '500',
  },
  greenText: {
    color: '#4CD964',
    fontWeight: '500',
  },
  weatherIcon: {
    fontSize: adjust(16),
    paddingHorizontal: adjust(2),
  },
  temperatureText: {
    paddingHorizontal: adjust(2),
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: adjust(10),
    marginBottom: adjust(24),
  },
  preferenceCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: adjust(10),
    padding: adjust(16),
    marginBottom: adjust(12),
    minHeight: adjust(110),
  },
  preferenceIconContainer: {
    width: adjust(36),
    height: adjust(36),
    borderRadius: adjust(18),
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: adjust(10),
  },
  preferenceCardTitle: {
    fontSize: adjust(14),
    color: '#666',
    marginBottom: adjust(4),
  },
  preferenceCardValue: {
    fontSize: adjust(15),
    fontWeight: '500',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4361EE',
    borderRadius: adjust(10),
    paddingVertical: adjust(14),
    alignItems: 'center',
    marginBottom: adjust(14),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: adjust(15),
    fontWeight: '600',
  },
  resetContainer: {
    alignItems: 'center',
    marginBottom: adjust(24),
  },
  resetText: {
    color: '#FF3B30',
    fontSize: adjust(14),
    fontWeight: '500',
  },
  homeIndicator: {
    alignItems: 'center',
    paddingBottom: adjust(8),
  },
  homeIndicatorBar: {
    width: adjust(35),
    height: adjust(5),
    backgroundColor: '#D1D1D6',
    borderRadius: adjust(2.5),
  },
  devButton: {
    marginBottom: adjust(20),
    backgroundColor: '#333',
    borderRadius: adjust(8),
    padding: adjust(12),
    alignSelf: 'center',
    paddingHorizontal: adjust(20),
  },
  devButtonText: {
    color: '#fff',
    fontSize: adjust(14),
    fontWeight: '500',
  },
  userInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: adjust(16),
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: adjust(10),
    padding: adjust(12),
    marginBottom: adjust(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoLabel: {
    fontSize: adjust(12),
    color: '#666',
    marginBottom: adjust(4),
  },
  infoValue: {
    fontSize: adjust(14),
    fontWeight: '500',
    color: '#333',
  },
  eveningActivitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: adjust(16),
  },
  eveningActivityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#517FE0',
    borderRadius: adjust(16),
    paddingVertical: adjust(6),
    paddingHorizontal: adjust(12),
    marginRight: adjust(8),
    marginBottom: adjust(8),
  },
  eveningActivityText: {
    fontSize: adjust(12),
    fontWeight: '500',
    color: '#fff',
    marginLeft: adjust(4),
  },
  noActivitiesText: {
    fontSize: adjust(12),
    fontStyle: 'italic',
    color: '#666',
  },
});

export default ProfileScreen; 