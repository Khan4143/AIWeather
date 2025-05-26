import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';

const STANDARD_SPACING = adjust(12);

// Style options
const styleOptions = [
  { id: 'casual', label: 'Casual', description: 'Relaxed daily outfits' },
  { id: 'professional', label: 'Professional', description: 'Office/formal attire' },
  { id: 'sporty', label: 'Sporty', description: 'Activewear or outdoor gear' },
];

// Health concern options
const healthOptions = [
  { id: 'allergies', label: 'Allergies', icon: 'allergy' },
  { id: 'asthma', label: 'Asthma', icon: 'lungs' },
  { id: 'sensitivity', label: 'Sensitivity', icon: 'snowflake-o' },
  { id: 'migraine', label: 'Migraine', icon: 'head-side-virus' },
  { id: 'arthritis', label: 'Arthritis', icon: 'bone' },
  { id: 'skin', label: 'Skin Issues', icon: 'hand-paper-o' },
  { id: 'heart', label: 'Heart Issues', icon: 'heartbeat' },
];

// Activity options
const activityOptions = [
  { id: 'bbq', label: 'BBQ', icon: 'restaurant' },
  { id: 'hiking', label: 'Hiking', icon: 'md-walk' },
  { id: 'outdoor', label: 'Outdoor Party', icon: 'md-people' },
  { id: 'beach', label: 'Beach', icon: 'umbrella-beach' },
  { id: 'camping', label: 'Camping', icon: 'campground' },
  { id: 'sports', label: 'Sports', icon: 'football' },
  { id: 'gardening', label: 'Gardening', icon: 'leaf' },
  { id: 'cycling', label: 'Cycling', icon: 'bicycle' },
];

const PreferenceScreen = ({ navigation }: { navigation: any }) => {
  // State for preferences
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedHealthConcerns, setSelectedHealthConcerns] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const healthSliderRef = useRef<FlatList>(null);
  const activitySliderRef = useRef<FlatList>(null);

  useEffect(() => {
    // Hide header on mount
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false
      });
    }
  }, [navigation]);

  const handleBack = () => {
    navigation.goBack('DailyRoutine');
  };

  const handleNext = () => {
    // Navigate to next screen
    navigation.navigate('OnboardingScreen');
  };

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  const needsScrollView = contentHeight > SCREEN_HEIGHT;

  // Selection handlers
  const selectStyle = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const toggleHealthConcern = (concernId: string) => {
    setSelectedHealthConcerns(prev => {
      if (prev.includes(concernId)) {
        return prev.filter(id => id !== concernId);
      } else {
        // Limit to 3 selections
        if (prev.length < 3) {
          return [...prev, concernId];
        } else {
          return prev; // Already at max selections
        }
      }
    });
  };

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        // Only allow one selection
        return [activityId];
      }
    });
  };

  // Render health concern item for FlatList
  const renderHealthItem = ({ item }: { item: typeof healthOptions[0] }) => {
    const isSelected = selectedHealthConcerns.includes(item.id);
    
    // Determine which icon library to use based on the icon name
    let IconComponent = MaterialCommunityIcons;
    if (['snowflake-o', 'hand-paper-o', 'heartbeat'].includes(item.icon)) {
      IconComponent = FontAwesome;
    }
    
    return (
      <TouchableOpacity 
        style={[
          styles.pillButton, 
          isSelected && styles.selectedPillButton,
        ]} 
        onPress={() => toggleHealthConcern(item.id)}
      >
        <IconComponent 
          name={item.icon as any} 
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

  // Render activity item for FlatList
  const renderActivityItem = ({ item }: { item: typeof activityOptions[0] }) => {
    const isSelected = selectedActivities.includes(item.id);
    
    // Determine which icon library to use based on the icon name
    let IconComponent = Ionicons;
    if (['umbrella-beach', 'campground', 'football', 'leaf', 'bicycle'].includes(item.icon)) {
      IconComponent = FontAwesome;
    }
    
    return (
      <TouchableOpacity 
        style={[
          styles.pillButton, 
          isSelected && styles.selectedPillButton,
        ]} 
        onPress={() => toggleActivity(item.id)}
      >
        <IconComponent 
          name={item.icon as any} 
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
    <LinearGradient
      colors={['#c9e3ff', '#7698ee']}
      style={styles.background}
    >
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Custom Header with Back Button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              activeOpacity={0.8}
              onPress={handleBack}
            >
              <Feather name="arrow-left" size={adjust(20)} color="#333" />
            </TouchableOpacity>
          </View>
          
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>What should Skylar help you manage?</Text>
          </View>

          {/* Main Content */}
          <View 
            ref={contentRef}
            style={styles.contentContainer}
            onLayout={handleContentLayout}
          >
            {/* Subtitle Section */}
            <View style={styles.subtitleSection}>
              <Text style={styles.subtitle}>
                Your answers help Skylar personalize health, clothing, and activity tips just for you.
              </Text>
            </View>

            {/* Style Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Choose Your Style</Text>
              <View style={styles.styleOptionsWrapper}>
                {styleOptions.map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={[styles.styleOptionCard, selectedStyle === style.id && styles.activeStyleOptionCard]}
                    onPress={() => selectStyle(style.id)}
                  >
                    <View style={styles.styleTextContainer}>
                      {style.id === 'casual' && (
                        <Ionicons name="shirt-outline" size={adjust(18)} color="#333" style={styles.styleIcon} />
                      )}
                      {style.id === 'professional' && (
                        <Ionicons name="briefcase-outline" size={adjust(18)} color="#333" style={styles.styleIcon} />
                      )}
                      {style.id === 'sporty' && (
                        <Ionicons name="body-outline" size={adjust(18)} color="#333" style={styles.styleIcon} />
                      )}
                      <View>
                        <Text style={styles.styleLabel}>{style.label}</Text>
                        <Text style={styles.styleDescription}>{style.description}</Text>
                      </View>
                    </View>
                    <View style={styles.radioContainer}>
                      <View style={styles.radioOuter}>
                        {selectedStyle === style.id && <View style={styles.radioInner} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Health Concerns */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Health Concerns</Text>
              <View style={styles.sliderWrapper}>
                <FlatList
                  ref={healthSliderRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={healthOptions}
                  renderItem={renderHealthItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.pillsContainer}
                  snapToAlignment="start"
                  decelerationRate="fast"
                />
              </View>
            </View>

            {/* Activities */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Your Activities</Text>
              <View style={styles.sliderWrapper}>
                <FlatList
                  ref={activitySliderRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={activityOptions}
                  renderItem={renderActivityItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.pillsContainer}
                  snapToAlignment="start"
                  decelerationRate="fast"
                />
              </View>
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Feather name="arrow-right" size={adjust(16)} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  // Always use ScrollView to ensure everything is visible
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      {renderContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: adjust(16),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: adjust(2),
    paddingTop: adjust(8),
    paddingBottom: adjust(4),
  },

  backButton: {
    width: adjust(36),
    height: adjust(36),
    borderRadius: adjust(18),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: adjust(6),
  },
  contentContainer: {
    flex: 1,
    paddingBottom: adjust(20),
  },
  subtitleSection: {
    marginBottom: adjust(24),
    alignItems: 'center',
    paddingHorizontal: adjust(10),
  },
  titleContainer: {
    width: '100%',
    marginTop: adjust(4),
    marginBottom: adjust(12),
    paddingHorizontal: adjust(4),
  },
  title: {
    fontSize: adjust(18),
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: adjust(12),
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: adjust(5),
    lineHeight: adjust(18),
  },
  sectionContainer: {
    marginBottom: adjust(18),
  },
  sectionTitle: {
    fontSize: adjust(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: adjust(12),
    paddingHorizontal: adjust(4),
  },
  styleOptionsWrapper: {
    marginHorizontal: adjust(4),
    marginBottom: adjust(4),
  },
  styleOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: adjust(10),
    paddingHorizontal: adjust(15),
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    marginBottom: adjust(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0, // Default no border
  },
  activeStyleOptionCard: {
    borderWidth: 2,
    borderColor: '#7698ee',
  },
  styleTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  styleIcon: {
    marginRight: adjust(10),
  },
  styleLabel: {
    fontSize: adjust(14),
    fontWeight: '600',
    color: '#333',
  },
  styleDescription: {
    fontSize: adjust(12),
    color: '#888',
  },
  radioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuter: {
    width: adjust(20),
    height: adjust(20),
    borderRadius: adjust(10),
    borderWidth: 2,
    borderColor: '#7698ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: adjust(10),
    height: adjust(10),
    borderRadius: adjust(5),
    backgroundColor: '#7698ee',
  },
  sliderWrapper: {
    width: SCREEN_WIDTH,
    marginLeft: adjust(-16),
  },
  pillsContainer: {
    paddingLeft: adjust(16),
    paddingRight: adjust(30),
    paddingVertical: adjust(6),
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

export default PreferenceScreen;
