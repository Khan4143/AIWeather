import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
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
import { UserData } from '../Screens/UserInfo';
import { DailyRoutineData } from '../Screens/DailyRoutine';
import { PreferenceData } from '../Screens/PreferenceScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys (should match UserDataManager's keys)
const STORAGE_KEYS = {
  USER_PROFILE: 'skylar_user_profile',
  DAILY_ROUTINE: 'skylar_daily_routine',
  PREFERENCES: 'skylar_preferences',
};

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
  // Add states for preference data
  const [stylePreference, setStylePreference] = useState<string | null>(null);
  const [healthConcerns, setHealthConcerns] = useState<string[]>([]);
  const [preferredActivities, setPreferredActivities] = useState<string[]>([]);

  // Morning activities
  const allMorningActivities = [
    { id: '1', name: 'Running', icon: 'run', selected: false },
    { id: '2', name: 'Yoga', icon: 'yoga', selected: false },
    { id: '5', name: 'Gym', icon: 'weight-lifter', selected: false },
    { id: '6', name: 'Dog Walk', icon: 'dog', selected: false },
  ];

  const [morningActivities, setMorningActivities] = useState(allMorningActivities);
  const [userCommuteMethod, setUserCommuteMethod] = useState('');
  const [userCommuteTime, setUserCommuteTime] = useState({ hours: 8, minutes: 0, isAM: true });
  const [userEveningActivity, setUserEveningActivity] = useState('');

  // Function to refresh data - extract this from useFocusEffect for reuse
  const refreshData = async () => {
    try {
      console.log("===== PROFILE SCREEN: Starting data refresh from AsyncStorage =====");
      
      // First, directly check what's in AsyncStorage for debugging
      const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileJson) {
        console.log("PROFILE SCREEN - Raw profile data in AsyncStorage:", profileJson);
      } else {
        console.warn("PROFILE SCREEN - No profile data found in AsyncStorage!");
      }
      
      // Force a complete reload from AsyncStorage
      await UserDataManager.loadAllData();
      
      // Get the freshly loaded data
      const userData = UserDataManager.getAllUserData();
      console.log("PROFILE SCREEN - Loaded user data:", JSON.stringify(userData, null, 2));
      
      // Update all state variables with fresh data
      if (userData.profile) {
        const profile = userData.profile as UserDataType;
        console.log("PROFILE SCREEN - Setting profile data:", JSON.stringify(profile, null, 2));
        setUserOccupation(profile.occupation || '');
        setUserName(profile.name || profile.occupation || '');
        setUserLocation(profile.location || '');
        setUserAge(profile.age || '');
        setUserGender(profile.gender || '');
      } else {
        console.log("PROFILE SCREEN - No profile data found!");
      }
      
      if (userData.preferences) {
        const preferences = userData.preferences as PreferenceDataType;
        console.log("PROFILE SCREEN - Setting preferences data");
        setCommuteAlerts(preferences.notifications?.commute || false);
        setClothingSuggestions(preferences.notifications?.clothing || false);
        setHealthTips(preferences.notifications?.health || false);
        setEventReminders(preferences.notifications?.events || false);
        
        if (preferences.units?.temperature) {
          setTemperatureUnit(preferences.units.temperature);
        }
        
        if (preferences.language) {
          setLanguagePreference(preferences.language);
        }
        
        if (preferences.style) {
          setStylePreference(preferences.style);
        }
        
        if (preferences.healthConcerns && Array.isArray(preferences.healthConcerns)) {
          setHealthConcerns([...preferences.healthConcerns]);
        }
        
        if (preferences.activities && Array.isArray(preferences.activities)) {
          setPreferredActivities([...preferences.activities]);
        }
      }
      
      if (userData.dailyRoutine) {
        const dailyRoutine = userData.dailyRoutine as DailyRoutineType;
        console.log("PROFILE SCREEN - Setting daily routine data");
        
        if (dailyRoutine.commuteMethod) {
          setUserCommuteMethod(dailyRoutine.commuteMethod);
        }
        
        if (dailyRoutine.commuteTime) {
          setUserCommuteTime(dailyRoutine.commuteTime);
        }
        
        if (dailyRoutine.eveningActivity) {
          setUserEveningActivity(dailyRoutine.eveningActivity);
        }
        
        if (dailyRoutine.activities && dailyRoutine.activities.length > 0) {
          // Ensure only one morning activity can be selected
          // Find the first morning activity in the list (if any)
          const morningActivityName = dailyRoutine.activities.find(activityName => 
            allMorningActivities.some(ma => ma.name === activityName)
          );
          
          // Map all activities to have selected=false by default
          const updatedActivities = allMorningActivities.map(activity => ({
            ...activity,
            // Only mark the found morning activity as selected
            selected: activity.name === morningActivityName
          }));
          
          setMorningActivities(updatedActivities);
          setSelectedActivities(dailyRoutine.activities);
        }
      }
      
      console.log("===== PROFILE SCREEN: Data refresh completed =====");
    } catch (error) {
      console.error("PROFILE SCREEN - Error refreshing data:", error);
    }
  };

  // Function to save changes
  const saveChanges = async () => {
    try {
      console.log("===== PROFILE SCREEN: Saving changes =====");
      
      // First, get current data
      const userData = UserDataManager.getAllUserData();
      
      // 1. Update profile data
      const updatedProfile = {
        ...userData.profile,
        age: userAge,
        gender: userGender,
        occupation: userOccupation,
        location: userLocation,
        name: userName
      };
      
      console.log("PROFILE SCREEN - Saving profile:", JSON.stringify(updatedProfile, null, 2));
      
      // 2. Update preferences data
      const updatedPreferences = {
        ...userData.preferences,
        style: stylePreference,
        healthConcerns: [...healthConcerns],
        activities: [...preferredActivities],
        notifications: {
          commute: commuteAlerts,
          clothing: clothingSuggestions,
          health: healthTips,
          events: eventReminders
        },
        units: {
          temperature: temperatureUnit
        },
        language: languagePreference
      };
      
      // 3. Update daily routine data
      const selectedActivitiesList = morningActivities
        .filter(activity => activity.selected)
        .map(activity => activity.name);
      
      const updatedRoutine = {
        ...userData.dailyRoutine,
        commuteMethod: userCommuteMethod,
        commuteTime: {...userCommuteTime},
        eveningActivity: userEveningActivity,
        activities: selectedActivitiesList
      };
      
      // First directly update the data objects
      UserData.setAll(updatedProfile);
      PreferenceData.setAll(updatedPreferences);
      DailyRoutineData.setAll(updatedRoutine);
      
      // Then save to AsyncStorage
      await UserDataManager.saveAllData();
      
      console.log("PROFILE SCREEN - All changes saved successfully");
      
      // Verify data was saved to AsyncStorage
      const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileJson) {
        console.log("PROFILE SCREEN - Profile saved to AsyncStorage:", profileJson);
      } else {
        console.warn("PROFILE SCREEN - No profile data found in AsyncStorage after save!");
      }
      
      // Reload data to ensure UI is in sync
      await refreshData();
      
      // Show success message
      Alert.alert(
        "Success", 
        "Your profile has been updated successfully!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("PROFILE SCREEN - Error saving changes:", error);
      
      // Show error message
      Alert.alert(
        "Error", 
        "There was a problem saving your changes. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Load user data when the component mounts
  useEffect(() => {
    console.log("PROFILE SCREEN - Initial mount, loading data");
    refreshData();
  }, []);

  // Reload data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("===== PROFILE SCREEN: Screen focused - reloading user data =====");
      
      // Force a reload when screen comes into focus
      refreshData();
      
      return () => {
        console.log("PROFILE SCREEN - Screen lost focus");
      };
    }, []) // Empty dependency array means this runs on every focus
  );

  // Function to navigate to onboarding screens
  const navigateToOnboarding = () => {
    navigation.navigate('Welcome', { bypassOnboardingCheck: true });
  };

  // Function to get the style name for display
  const getStyleDisplayName = (styleId: string | null): string => {
    if (!styleId) return 'Not set';
    
    const styleMap: {[key: string]: string} = {
      'casual': 'Casual',
      'professional': 'Professional',
      'sporty': 'Sporty'
    };
    
    return styleMap[styleId] || 'Not set';
  };
  
  // Function to get appropriate icon for activity
  const getActivityIcon = (activity: string): string => {
    const activityIcons: {[key: string]: string} = {
      'BBQ': 'grill',
      'Hiking': 'hiking',
      'Outdoor Party': 'party-popper',
      'Beach': 'beach',
      'Camping': 'tent',
      'Sports': 'basketball',
      'Gardening': 'flower',
      'Cycling': 'bicycle',
      'Running': 'run',
      'Gym': 'dumbbell',
      'Yoga': 'yoga',
      'Dog Walk': 'dog',
      'Social Events': 'account-group',
      'Netflix/Movie': 'movie-open',
      'Reading': 'book-open-variant'
    };
    
    return activityIcons[activity] || 'run';
  };

  return (
    <>
      <LinearGradient
        colors={['#D1DEF0', '#E1EAF5']}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header with settings */}
            <View style={styles.headerRow}>
              <View style={styles.profileImageContainer}>
                <Text style={styles.avatarInitial}>
                  {userGender ? userGender.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <MaterialIcons name="edit" size={adjust(22)} color="#4361EE" />
              </TouchableOpacity>
            </View>
            
            {/* User name and subtitle */}
            <View style={styles.nameContainer}>
              <Text style={styles.greeting}>
                Hi {userName || userOccupation || 'User'} 👋
              </Text>
              <Text style={styles.subtitle}>
                Skylar knows your day inside out
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
            <View style={styles.scrollContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activitiesContainer}
                snapToAlignment="start"
                decelerationRate="fast"
              >
                {/* Display selected activities first */}
                {morningActivities
                  .slice()
                  .sort((a, b) => (a.selected ? -1 : 1))
                  .map((activity) => (
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
            </View>

            {/* Commute Preferences */}
            <View style={styles.cleanCardContainer}>
              <View style={styles.commuteSection}>
                <View style={styles.commuteHeader}>
                  <MaterialIcons name="commute" size={adjust(18)} color="#4361EE" />
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
                <TouchableOpacity style={[styles.preferencesRow, {borderBottomWidth: 0, paddingBottom: 0}]}>
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
                <Text style={styles.preferenceCardValue}>{getStyleDisplayName(stylePreference)}</Text>
              </TouchableOpacity>

              {/* Health Tags */}
              <TouchableOpacity style={styles.preferenceCard}>
                <View style={styles.preferenceIconContainer}>
                  <MaterialIcons name="favorite-outline" size={adjust(20)} color="#4361EE" />
                </View>
                <Text style={styles.preferenceCardTitle}>Health Tags</Text>
                <Text style={styles.preferenceCardValue}>
                  {healthConcerns.length > 0 ? `${healthConcerns.length} Active` : 'None'}
                </Text>
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

            {/* Your Style & Health */}
            <Text style={styles.sectionTitle}>Your Style & Health</Text>
            
            <View style={styles.cleanCardContainer}>
              {/* Style Preference */}
              <View style={styles.preferencesRow}>
                <Text style={styles.preferenceLabel}>Clothing Style</Text>
                <View style={styles.preferenceValue}>
                  <Text style={styles.preferenceValueText}>
                    {getStyleDisplayName(stylePreference)}
                  </Text>
                  <Ionicons name="chevron-forward" size={adjust(16)} color="#4361EE" />
                </View>
              </View>
              
              {/* Health Concerns */}
              <Text style={styles.subSectionTitle}>Health Concerns</Text>
              <View style={styles.scrollContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.activitiesContainer}
                  snapToAlignment="start"
                  decelerationRate="fast"
                >
                  {healthConcerns && healthConcerns.length > 0 ? (
                    healthConcerns.map((concern, index) => (
                      <View 
                        key={index} 
                        style={[styles.activityBubble, styles.selectedActivity]}
                      >
                        <MaterialCommunityIcons 
                          name="medical-bag" 
                          size={adjust(16)} 
                          color="#fff" 
                        />
                        <Text style={[styles.activityText, styles.selectedActivityText]}>
                          {concern}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noItemsText}>No health concerns set</Text>
                  )}
                </ScrollView>
              </View>
              
              {/* Preferred Activities */}
              <Text style={styles.subSectionTitle}>Preferred Activities</Text>
              <View style={styles.scrollContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.activitiesContainer}
                  snapToAlignment="start"
                  decelerationRate="fast"
                >
                  {preferredActivities && preferredActivities.length > 0 ? (
                    preferredActivities.map((activity, index) => (
                      <View 
                        key={index} 
                        style={[styles.activityBubble, styles.selectedActivity]}
                      >
                        <MaterialCommunityIcons 
                          name={getActivityIcon(activity)}
                          size={adjust(16)} 
                          color="#fff" 
                        />
                        <Text style={[styles.activityText, styles.selectedActivityText]}>
                          {activity}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noItemsText}>No preferred activities set</Text>
                  )}
                </ScrollView>
              </View>
            </View>

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
    paddingVertical: adjust(15),
    marginBottom: adjust(8),
  },
  profileImageContainer: {
    width: adjust(60),
    height: adjust(60),
    borderRadius: adjust(30),
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
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
  nameContainer: {
    alignItems: 'flex-start',
    marginBottom: adjust(16),
    paddingLeft: adjust(5),
  },
  greeting: {
    fontSize: adjust(22),
    fontWeight: '600',
    color: '#333',
    marginBottom: adjust(6),
  },
  subtitle: {
    fontSize: adjust(14),
    color: '#666',
    marginBottom: adjust(4),
  },
  editButton: {
    width: adjust(40),
    height: adjust(40),
    borderRadius: adjust(20),
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: adjust(8),
  },
  scrollContainer: {
    marginHorizontal: -adjust(20),
    marginBottom: adjust(12),
  },
  activitiesContainer: {
    paddingVertical: adjust(4),
    paddingHorizontal: adjust(20),
    flexDirection: 'row',
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
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: adjust(12),
    padding: adjust(16),
    marginBottom: adjust(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
    overflow: 'hidden',
    borderWidth: 0,
  },
  cleanCardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: adjust(12),
    padding: adjust(16),
    marginBottom: adjust(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
    overflow: 'hidden',
    borderWidth: 0,
  },
  commuteSection: {
    marginBottom: adjust(0),
  },
  commuteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(12),
  },
  commuteTitle: {
    fontSize: adjust(14),
    fontWeight: '500',
    color: '#333',
    marginLeft: adjust(8),
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
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
    overflow: 'hidden',
    borderWidth: 0,
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
  noItemsText: {
    fontSize: adjust(12),
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: adjust(8),
    paddingHorizontal: adjust(4),
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
    backgroundColor: '#ffffff',
    borderRadius: adjust(10),
    padding: adjust(16),
    marginBottom: adjust(12),
    minHeight: adjust(110),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
    overflow: 'hidden',
    borderWidth: 0,
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
});

export default ProfileScreen; 