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
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';
import Icon from 'react-native-vector-icons/AntDesign';

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

  useEffect(() => {
    // Hide header on mount
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false
      });
    }
  }, [navigation]);

  const handleBack = () => {
    navigation.goBack('UserInfo');
  };

  const handleNext = () => {
    // Navigate to next screen - Replace with actual next screen
    navigation.navigate('PreferenceScreen');
  };

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
    setEveningActivity(activity);
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

  const renderContent = () => (
    <LinearGradient
      colors={['#c9e3ff', '#7698ee']}
      style={styles.background}
    >
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
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <View 
        ref={contentRef} 
        onLayout={handleContentLayout} 
        style={[styles.measureContainer, { position: 'absolute', opacity: 0 }]}
      >
        {renderContent()}
      </View>
      
      {needsScrollView ? (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
    backgroundColor: '#c9e3ff',
  },
  measureContainer: {
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
    // paddingTop: Platform.OS === 'ios' ? adjust(10) : (StatusBar.currentHeight || 0) + adjust(10),
    paddingBottom: adjust(20),
    minHeight: SCREEN_HEIGHT,
  },
  mainContent: {
    width: '100%',
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: adjust(18),
  },
  headerContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: adjust(12),
    paddingTop: Platform.OS === 'ios' ? adjust(50) : (StatusBar.currentHeight || 0) + adjust(20),
    marginBottom: adjust(5),
  },
  backButton: {
    width: adjust(32),
    height: adjust(32),
    borderRadius: adjust(16),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: adjust(0),
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
    backgroundColor: '#7698ee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: adjust(22),
    paddingVertical: adjust(10),
    paddingHorizontal: adjust(25),
    marginTop: adjust(16),
    marginBottom: adjust(10),
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
});

export default DailyRoutine;