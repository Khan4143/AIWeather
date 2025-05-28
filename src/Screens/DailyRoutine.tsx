import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView,
  Platform,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';
import Icon from 'react-native-vector-icons/AntDesign';
import { UserDataManager } from '../utils/userDataManager';

const STANDARD_SPACING = adjust(12);

// Commute method options
const commuteOptions = [
  { id: 'car', label: 'Car', icon: 'car-outline' },
  { id: 'bus', label: 'Bus', icon: 'bus-outline' },
  { id: 'train', label: 'Train', icon: 'train-outline' },
  { id: 'bicycle', label: 'Bicycle', icon: 'bicycle-outline' },
  { id: 'walk', label: 'Walk', icon: 'walk-outline' },
  { id: 'motorcycle', label: 'Motorcycle', icon: 'motorcycle-outline' },
  { id: 'subway', label: 'Subway', icon: 'subway-outline' },
];

// Activity options
const activityOptions = [
  { id: 'bbq', label: 'BBQ', icon: 'restaurant' },
  { id: 'hiking', label: 'Hiking', icon: 'hiking', iconFamily: 'FontAwesome5' },
  { id: 'outdoor', label: 'Outdoor Party', icon: 'outdoor-grill', iconFamily: 'MaterialIcons' },
  { id: 'beach', label: 'Beach', icon: 'beach', iconFamily: 'MaterialCommunityIcons' },
  { id: 'camping', label: 'Camping', icon: 'campground', iconFamily: 'FontAwesome5' },
  { id: 'sports', label: 'Sports', icon: 'sports-soccer', iconFamily: 'MaterialIcons' },
  { id: 'gardening', label: 'Gardening', icon: 'leaf' },
  { id: 'cycling', label: 'Cycling', icon: 'bicycle' },
];

// Create a global object to store user routine data
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

export const DailyRoutineData = {
  morningActivity: null as string | null,
  commuteMethod: null as string | null,
  commuteTime: {
    hours: 8,
    minutes: 0,
    isAM: true,
  },
  eveningActivity: null as string | null,
  selectedActivity: null as string | null,
  selectedActivities: [] as string[],
  activities: [] as string[],
  getAll: function(): DailyRoutineType {
    return {
      morningActivity: this.morningActivity,
      commuteMethod: this.commuteMethod,
      commuteTime: this.commuteTime,
      eveningActivity: this.eveningActivity,
      selectedActivity: this.selectedActivity,
      selectedActivities: this.selectedActivities,
      activities: this.activities,
    };
  },
  setAll: function(data: Partial<DailyRoutineType>): void {
    this.morningActivity = data.morningActivity ?? this.morningActivity;
    this.commuteMethod = data.commuteMethod ?? this.commuteMethod;
    if (data.commuteTime) {
      this.commuteTime = { ...this.commuteTime, ...data.commuteTime };
    }
    this.eveningActivity = data.eveningActivity ?? this.eveningActivity;
    this.selectedActivity = data.selectedActivity ?? this.selectedActivity;
    this.selectedActivities = data.selectedActivities ?? this.selectedActivities;
    this.activities = data.activities ?? this.activities;
  },
};

const DailyRoutine = ({ navigation }: { navigation: any }) => {
  // State for daily routine options
  const [morningActivity, setMorningActivity] = useState<string | null>('');
  const [commuteMethod, setCommuteMethod] = useState<string | null>('Car');
  const [commuteHours, setCommuteHours] = useState<number>(8);
  const [commuteMinutes, setCommuteMinutes] = useState<number>(0);
  const [isAM, setIsAM] = useState<boolean>(true);
  const [eveningActivity, setEveningActivity] = useState<string | null>(null);
  
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const commuteSliderRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

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
    navigation.goBack('UserInfo');
  };

  // Update the collectAllActivities function to properly collect selected activities
  const collectAllActivities = (): string[] => {
    const allActivities: string[] = [];
    
    // Add morning activity if selected
    if (morningActivity) {
      allActivities.push(morningActivity);
    }
    
    // Add evening activity if selected
    if (eveningActivity) {
      allActivities.push(eveningActivity);
    }
    
    // Add selected outdoor activities with their labels
    selectedActivities.forEach(id => {
      // Find the activity option by ID to get the label
      const activityOption = activityOptions.find(option => option.id === id);
      if (activityOption) {
        allActivities.push(activityOption.label);
      }
    });
    
    return [...new Set(allActivities)]; // Remove duplicates
  };

  // Update the handleNext function to properly save selected activities
  const handleNext = async () => {
    // Collect all activities
    const allActivities = collectAllActivities();
    
    // Get activity labels for selected activities
    const selectedActivityLabels = selectedActivities.map(id => {
      const activity = activityOptions.find(a => a.id === id);
      return activity ? activity.label : id;
    });
    
    // Save data to DailyRoutineData global object
    DailyRoutineData.setAll({
      morningActivity,
      commuteMethod,
      commuteTime: {
        hours: commuteHours,
        minutes: commuteMinutes,
        isAM
      },
      eveningActivity,
      // Use first activity for backwards compatibility
      selectedActivity: selectedActivityLabels.length > 0 ? selectedActivityLabels[0] : null,
      // Save all selected activity labels
      selectedActivities: selectedActivityLabels,
      activities: allActivities,
    });
    
    // Log what's being saved
    console.log('Saving selected activities:', selectedActivityLabels);
    console.log('Saving all activities:', allActivities);
    
    // Save to AsyncStorage
    try {
      await UserDataManager.saveDailyRoutine();
      console.log('Daily routine data saved successfully');
    } catch (error) {
      console.error('Error saving daily routine data:', error);
    }
    
    // Navigate to next screen
    navigation.navigate('PreferenceScreen');
  };

  // Update the useEffect to properly load saved data
  useEffect(() => {
    // Load saved data when component mounts
    const loadSavedData = async () => {
      try {
        await UserDataManager.loadAllData();
        const savedData = UserDataManager.getDailyRoutine();
        
        // Set state from saved data
        if (savedData.morningActivity) setMorningActivity(savedData.morningActivity);
        if (savedData.commuteMethod) setCommuteMethod(savedData.commuteMethod);
        if (savedData.commuteTime) {
          setCommuteHours(savedData.commuteTime.hours);
          setCommuteMinutes(savedData.commuteTime.minutes);
          setIsAM(savedData.commuteTime.isAM);
        }
        if (savedData.eveningActivity) setEveningActivity(savedData.eveningActivity);
        
        // Convert activity labels back to IDs
        if (savedData.selectedActivities && savedData.selectedActivities.length > 0) {
          const activityIds = savedData.selectedActivities.map(label => {
            // Find the ID for this label
            const activity = activityOptions.find(a => a.label === label);
            return activity ? activity.id : '';
          }).filter(id => id !== ''); // Filter out any missing IDs
          
          setSelectedActivities(activityIds);
        }
        
        console.log('Loaded daily routine data:', savedData);
      } catch (error) {
        console.error('Error loading daily routine data:', error);
      }
    };
    
    loadSavedData();
  }, []);

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  const needsScrollView = contentHeight > SCREEN_HEIGHT;

  // Selection handlers
  const selectMorningActivity = (activity: string) => {
    setMorningActivity(activity);
  };

  const selectCommuteMethod = (method: string) => {
    setCommuteMethod(method);
  };

  const selectEveningActivity = (activity: string) => {
    if (eveningActivity === activity) {
      // If clicking the same activity again, deselect it
      setEveningActivity(null);
    } else {
      // Otherwise, select the new activity
      setEveningActivity(activity);
    }
  };

  // Time adjustment handlers
  const incrementHours = () => {
    setCommuteHours(prev => prev < 12 ? prev + 1 : 1); // 12-hour format
  };

  const decrementHours = () => {
    setCommuteHours(prev => prev > 1 ? prev - 1 : 12); // 12-hour format
  };

  const incrementMinutes = () => {
    setCommuteMinutes(prev => prev < 55 ? prev + 5 : 0);
  };

  const decrementMinutes = () => {
    setCommuteMinutes(prev => prev > 0 ? prev - 5 : 55);
  };

  const toggleAMPM = () => {
    setIsAM(prev => !prev);
  };

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev => {
      // If already selected, remove it
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        // If not selected yet
        // Allow up to 2 selections - if already have 2, remove the oldest one
        if (prev.length >= 2) {
          return [...prev.slice(1), activityId]; // Remove oldest, add new
        } else {
          return [...prev, activityId]; // Add new to existing array
        }
      }
    });
  };

  // Render commute method item for FlatList
  const renderCommuteMethodItem = ({ item }: { item: typeof commuteOptions[0] }) => (
    <TouchableOpacity 
      style={[
        styles.commuteOptionButton, 
        commuteMethod === item.id && styles.selectedOption
      ]} 
      onPress={() => selectCommuteMethod(item.id)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={adjust(16)} 
        color={commuteMethod === item.id ? "#fff" : "#333"} 
      />
      <Text 
        style={[
          styles.commuteOptionText, 
          commuteMethod === item.id && styles.selectedOptionText
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  // Render activity item for FlatList
  const renderActivityItem = ({ item }: { item: typeof activityOptions[0] }) => {
    let IconComponent;
    switch (item.iconFamily) {
      case 'FontAwesome5':
        IconComponent = FontAwesome5;
        break;
      case 'MaterialIcons':
        IconComponent = MaterialIcons;
        break;
      case 'MaterialCommunityIcons':
        IconComponent = MaterialCommunityIcons;
        break;
      default:
        IconComponent = Ionicons;
    }

    const isSelected = selectedActivities.includes(item.id);

    return (
      <TouchableOpacity 
        style={[styles.pillButton, isSelected && styles.selectedPillButton]} 
        onPress={() => toggleActivity(item.id)}
      >
        <IconComponent 
          name={item.icon} 
          size={adjust(14)} 
          color={isSelected ? "#fff" : "#333"} 
          style={styles.pillIcon}
        />
        <Text 
          style={[
            styles.pillText, 
            isSelected && styles.selectedPillText
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => (
      <View style={styles.mainContent}>
        {/* Custom Header with Back Button and Title */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.8}
            onPress={handleBack}
          >
            <Feather name="arrow-left" size={adjust(20)} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Your daily routine matters </Text>
          <Text style={styles.headerTitle}>to Skylar!</Text>
        </View>

        <View style={styles.contentContainer}>
          {/* Morning Activity */}
          <View style={[styles.questionContainer, styles.sectionContainer]}>
            <Text style={styles.questionText}>What do you usually do in the mornings?</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, morningActivity === 'Running' && styles.selectedOption]} 
                onPress={() => selectMorningActivity('Running')}
              >
                <Ionicons name="fitness" size={adjust(15)} color={morningActivity === 'Running' ? "#fff" : "#333"} />
                <Text style={[styles.optionText, morningActivity === 'Running' && styles.selectedOptionText]}>Running</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.optionButton, morningActivity === 'Gym' && styles.selectedOption]} 
                onPress={() => selectMorningActivity('Gym')}
              >
                <MaterialCommunityIcons name="dumbbell" size={adjust(15)} color={morningActivity === 'Gym' ? "#fff" : "#333"} />
                <Text style={[styles.optionText, morningActivity === 'Gym' && styles.selectedOptionText]}>Gym</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, morningActivity === 'Yoga' && styles.selectedOption]} 
                onPress={() => selectMorningActivity('Yoga')}
              >
                <MaterialCommunityIcons name="yoga" size={adjust(15)} color={morningActivity === 'Yoga' ? "#fff" : "#333"} />
                <Text style={[styles.optionText, morningActivity === 'Yoga' && styles.selectedOptionText]}>Yoga</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.optionButton, morningActivity === 'Dog Walk' && styles.selectedOption]} 
                onPress={() => selectMorningActivity('Dog Walk')}
              >
                <MaterialCommunityIcons name="dog" size={adjust(15)} color={morningActivity === 'Dog Walk' ? "#fff" : "#333"} />
                <Text style={[styles.optionText, morningActivity === 'Dog Walk' && styles.selectedOptionText]}>Dog Walk</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Commute Method - Horizontal Slider */}
          <View style={[styles.questionContainer, styles.sectionContainer, styles.commuteSection]}>
            <Text style={[styles.questionText, styles.commuteQuestionText]}>How do you usually get to work or school?</Text>
        </View>
      </View>

      {/* This FlatList is placed outside of padding container to avoid cutting off */}
      <View style={styles.sliderWrapper}>
        <FlatList
          ref={commuteSliderRef}
          data={commuteOptions}
          renderItem={renderCommuteMethodItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.commuteSliderContainer}
        />
      </View>

      <View style={styles.mainContent}>
        <View style={styles.contentContainer}>
          {/* Commute Time */}
          <View style={[styles.questionContainer, styles.sectionContainer]}>
            <View style={styles.timePickerContainer}>
              
              <Text style={styles.timePickerTitle}><Icon name="clockcircleo" size={adjust(16)} color="#517FE0" />   Commute Time</Text>
              <View style={styles.timePickerControls}>
                {/* Hours */}
                <View style={styles.timeSection}>
                  <TouchableOpacity onPress={incrementHours} style={styles.timeButton}>
                    <Ionicons name="chevron-up" size={adjust(16)} color="#333" />
                  </TouchableOpacity>
                  <View style={styles.timeDisplay}>
                    <Text style={styles.timeText}>{commuteHours}</Text>
                  </View>
                  <TouchableOpacity onPress={decrementHours} style={styles.timeButton}>
                    <Ionicons name="chevron-down" size={adjust(16)} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.timeSeparator}>:</Text>
                
                {/* Minutes */}
                <View style={styles.timeSection}>
                  <TouchableOpacity onPress={incrementMinutes} style={styles.timeButton}>
                    <Ionicons name="chevron-up" size={adjust(16)} color="#333" />
                  </TouchableOpacity>
                  <View style={styles.timeDisplay}>
                    <Text style={styles.timeText}>{commuteMinutes.toString().padStart(2, '0')}</Text>
                  </View>
                  <TouchableOpacity onPress={decrementMinutes} style={styles.timeButton}>
                    <Ionicons name="chevron-down" size={adjust(16)} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* AM/PM Toggle */}
                <View style={styles.ampmContainer}>
                  <TouchableOpacity 
                    style={[styles.ampmButton, isAM && styles.ampmActive]} 
                    onPress={() => setIsAM(true)}
                  >
                    <Text style={[styles.ampmText, isAM && styles.ampmActiveText]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.ampmButton, !isAM && styles.ampmActive]} 
                    onPress={() => setIsAM(false)}
                  >
                    <Text style={[styles.ampmText, !isAM && styles.ampmActiveText]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={adjust(18)} color="#517FE0" />
              <Text style={styles.infoText}>
                Skylar will alert you about delays, rain, or air quality before your commute.
              </Text>
            </View>
          </View>

          {/* Evening Activities */}
          <View style={[styles.questionContainer, styles.sectionContainer]}>
            <Text style={styles.questionText}>What do you enjoy in the evenings?</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, eveningActivity === 'Sports' && styles.selectedOption]} 
                onPress={() => selectEveningActivity('Sports')}
              >
                <MaterialCommunityIcons name="basketball" size={adjust(15)} color={eveningActivity === 'Sports' ? "#fff" : "#333"} />
                <Text style={[styles.optionText, eveningActivity === 'Sports' && styles.selectedOptionText]}>Sports</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.optionButton, eveningActivity === 'Gardening' && styles.selectedOption]} 
                onPress={() => selectEveningActivity('Gardening')}
              >
                <MaterialCommunityIcons name="flower" size={adjust(15)} color={eveningActivity === 'Gardening' ? "#fff" : "#333"} />
                <Text style={[styles.optionText, eveningActivity === 'Gardening' && styles.selectedOptionText]}>Gardening</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, eveningActivity === 'Dog Walk' && styles.selectedOption]} 
                onPress={() => selectEveningActivity('Dog Walk')}
              >
                <MaterialCommunityIcons name="dog" size={adjust(15)} color={eveningActivity === 'Dog Walk' ? "#fff" : "#333"} />
                <Text style={[styles.optionText, eveningActivity === 'Dog Walk' && styles.selectedOptionText]}>Dog Walk</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.optionButton, eveningActivity === 'Social Events' && styles.selectedOption]} 
                onPress={() => selectEveningActivity('Social Events')}
              >
                <MaterialCommunityIcons name="account-group" size={adjust(15)} color={eveningActivity === 'Social Events' ? "#fff" : "#333"} />
                <Text style={[styles.optionText, eveningActivity === 'Social Events' && styles.selectedOptionText]}>Social Events</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, eveningActivity === 'Netflix/Movie' && styles.selectedOption]} 
                onPress={() => selectEveningActivity('Netflix/Movie')}
              >
                <MaterialCommunityIcons name="movie-open" size={adjust(15)} color={eveningActivity === 'Netflix/Movie' ? "#fff" : "#333"} />
                <Text style={[styles.optionText, eveningActivity === 'Netflix/Movie' && styles.selectedOptionText]}>Netflix/Movie</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.optionButton, eveningActivity === 'Reading' && styles.selectedOption]} 
                onPress={() => selectEveningActivity('Reading')}
              >
                <MaterialCommunityIcons name="book-open-variant" size={adjust(15)} color={eveningActivity === 'Reading' ? "#fff" : "#333"} />
                <Text style={[styles.optionText, eveningActivity === 'Reading' && styles.selectedOptionText]}>Reading</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity 
            style={styles.nextButton} 
            activeOpacity={0.8}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Feather name="chevron-right" size={adjust(18)} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LinearGradient
        colors={['#b3d4ff', '#5c85e6']}
        style={styles.background}
      >
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
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContainer}
            overScrollMode="never"
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
  container: {
    flex: 1,
    backgroundColor: '#b3d4ff',
  },
  measureContainer: {
    width: '100%',
  },
  scrollContainer: {
    paddingBottom: adjust(20),
  },
  background: {
    flex: 1,
  },
  mainContent: {
    width: '100%',
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: adjust(10),
  },
  headerContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: adjust(12),
    paddingTop: Platform.OS === 'ios' ? adjust(1) : (StatusBar.currentHeight || 0) + adjust(1),
    marginBottom: adjust(5),
  },
  backButton: {
    width: adjust(32),
    height: adjust(32),
    borderRadius: adjust(16),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: adjust(1),
    marginLeft: adjust(10),
  },
  titleContainer: {
    width: '100%',
    marginTop: adjust(4),
    marginBottom: adjust(6),
    paddingHorizontal: adjust(4),
  },
  headerTitle: {
    flex: 1,
    fontSize: adjust(16),
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',

  },
  questionContainer: {
    width: '100%',
    marginBottom: adjust(10),
  },
  sectionContainer: {
    marginTop: adjust(0),
    paddingTop: adjust(8),
  },
  commuteSection: {
    paddingBottom: 0,
    marginBottom: 0,
  },
  questionText: {
    fontSize: adjust(13),
    fontWeight: '600',
    color: '#333',
    marginBottom: adjust(8),
    // backgroundColor: '#fff',
    padding: adjust(4),
    borderRadius: adjust(10),
  },
  commuteQuestionText: {
    marginBottom: adjust(2),
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: adjust(8),
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: adjust(20),
    paddingVertical: adjust(8),
    paddingHorizontal: adjust(10),
    marginHorizontal: adjust(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: '#7698ee',
  },
  optionText: {
    fontSize: adjust(12),
    fontWeight: '500',
    color: '#333',
    marginLeft: adjust(4),
  },
  selectedOptionText: {
    color: '#fff',
  },
  sliderWrapper: {
    width: SCREEN_WIDTH,
    marginTop: adjust(2),
    marginBottom: adjust(5),
  },
  commuteSliderContainer: {
    paddingHorizontal: adjust(18),
    paddingVertical: adjust(4),
    // backgroundColor: '#fff',
    borderRadius: adjust(10),
  },
  commuteOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: adjust(18),
    paddingVertical: adjust(8),
    paddingHorizontal: adjust(12),
    marginRight: adjust(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    minWidth: adjust(90),
  },
  commuteOptionText: {
    fontSize: adjust(12),
    fontWeight: '500',
    color: '#333',
    marginLeft: adjust(4),
  },

  

  timePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(12),
    marginBottom: adjust(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  timePickerTitle: {
    fontSize: adjust(14),
    fontWeight: '600',
    color: '#333',
    marginBottom: adjust(8),
    // textAlign: 'center',
  },
  timePickerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSection: {
    alignItems: 'center',
  },
  timeButton: {
    padding: adjust(4),
  },
  timeDisplay: {
    width: adjust(28),
    height: adjust(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: adjust(18),
    fontWeight: '600',
    color: '#333',
  },
  timeSeparator: {
    fontSize: adjust(16),
    fontWeight: '600',
    color: '#333',
    marginHorizontal: adjust(8),
  },
  ampmContainer: {
    marginLeft: adjust(20),
    flexDirection: 'column',
    borderRadius: adjust(10),
    overflow: 'hidden',
    // borderWidth: 1,
    borderColor: '#ddd',
  },
  ampmButton: {
    paddingVertical: adjust(6),
    paddingHorizontal: adjust(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  ampmActive: {
    backgroundColor: '#7698ee',
  },
  ampmText: {
    fontSize: adjust(12),
    fontWeight: '500',
    color: '#333',
  },
  ampmActiveText: {
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: adjust(10),
    padding: adjust(8),
  },
  infoText: {
    fontSize: adjust(11),
    color: '#333',
    marginLeft: adjust(4),
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#517FE0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: adjust(22),
    paddingVertical: adjust(10),
    paddingHorizontal: adjust(25),
    marginTop: adjust(16),
    marginBottom: adjust(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: adjust(14),
    marginRight: adjust(4),
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: adjust(20),
    paddingVertical: adjust(8),
    paddingHorizontal: adjust(14),
    marginRight: adjust(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  selectedPillButton: {
    backgroundColor: '#7698ee',
  },
  pillIcon: {
    marginRight: adjust(5),
  },
  pillText: {
    fontSize: adjust(14),
    fontWeight: '500',
    color: '#333',
  },
  selectedPillText: {
    color: '#fff',
  },
  helperTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: adjust(8),
  },
  helperText: {
    fontSize: adjust(11),
    fontStyle: 'italic',
    color: '#666',
  },
  selectionCountText: {
    fontSize: adjust(11),
    fontWeight: '500',
    color: '#517FE0',
  },
  selectionLimitReached: {
    color: '#FF9500',
  },
});

export default DailyRoutine;