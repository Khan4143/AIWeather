import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';

const STANDARD_SPACING = adjust(15);

const UserInfo = ({ navigation }: { navigation: any }) => {
  // State for form fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    // Configure header with back button
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false,
        headerTransparent: true,
        headerTitle: '',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
        }
      });
    }
  }, [navigation]);

  // Handle gender selection
  const handleSelectGender = (selectedGender: string) => {
    setGender(selectedGender);
  };

  // Handle location detection
  const handleDetectLocation = () => {
    setUseLocation(true);
    // In a real app, you would request location permissions and get actual location
  };

  // Handle next button press
  const handleNext = () => {
    navigation.navigate('DailyRoutine'); // Replace with your next screen
  };

  // Show info dialog about why we ask for this info
  const showWhyWeAsk = () => {
    // In a real app, you would show a modal or dialog here
    console.log('Show why we ask for this info');
  };

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  const needsScrollView = contentHeight > SCREEN_HEIGHT * 0.9;

  const renderContent = () => (
    <LinearGradient
      colors={['#c9e3ff', '#7698ee']}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Custom Header with Back Button and Title */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={adjust(24)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Let's get to know you better!</Text>
        </View>

        <Text style={styles.subHeaderText}>
          Skylar uses this info to give you smarter, personalized advice every day.
        </Text>

        {/* Age Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>How old are you?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your age"
            placeholderTextColor="#8e9aaf"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
          />
        </View>

        {/* Gender Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Select your gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.selectedGender,
              ]}
              onPress={() => handleSelectGender('male')}
            >
              <MaterialIcons 
                name="male" 
                size={adjust(22)} 
                color={gender === 'male' ? '#4361ee' : '#333'} 
              />
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.selectedGender,
              ]}
              onPress={() => handleSelectGender('female')}
            >
              <MaterialIcons 
                name="female" 
                size={adjust(22)} 
                color={gender === 'female' ? '#4361ee' : '#333'} 
              />
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'other' && styles.selectedGender,
              ]}
              onPress={() => handleSelectGender('other')}
            >
              <MaterialIcons 
                name="people" 
                size={adjust(22)} 
                color={gender === 'other' ? '#4361ee' : '#333'} 
              />
              <Text style={styles.genderText}>Other</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Occupation Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>What's your occupation?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your occupation"
            placeholderTextColor="#8e9aaf"
            value={occupation}
            onChangeText={setOccupation}
          />
          <Text style={styles.inputHelperText}>
            This helps Skylar tailor fashion & routine tips
          </Text>
        </View>

        {/* Location Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Where are you located?</Text>
          
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={handleDetectLocation}
          >
            <Ionicons name="location-outline" size={adjust(18)} color="#333" />
            <Text style={styles.locationButtonText}>Detect my location</Text>
          </TouchableOpacity>
          
          <TextInput
            style={[styles.textInput, styles.locationInput]}
            placeholder="Or enter your location manually"
            placeholderTextColor="#8e9aaf"
            value={manualLocation}
            onChangeText={setManualLocation}
            editable={!useLocation}
          />
        </View>


        {/* Why do we ask this */}
        <TouchableOpacity 
          style={styles.whyContainer}
          onPress={showWhyWeAsk}
        >
          <Ionicons name="information-circle-outline" size={adjust(18)} color="#333" />
          <Text style={styles.whyText}>Why do we ask this?</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="chevron-forward" size={adjust(18)} color="#fff" />
        </TouchableOpacity>

        {/* Progress Bar */}
        {/* <View style={styles.progressContainer}>
          <View style={styles.progressBar} />
        </View> */}
      </KeyboardAvoidingView>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
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
    backgroundColor: '#c9e3ff',
  },
  measureContainer: {
    width: '100%',
  },
  background: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: STANDARD_SPACING/2,
    paddingTop: Platform.OS === 'ios' ? adjust(10) : 0,
  },
  backButton: {
    // padding: STANDARD_SPACING/2,
  },
  keyboardAvoid: {
    flex: 1,
    paddingHorizontal: STANDARD_SPACING,
    paddingTop: Platform.OS === 'ios' ? adjust(50) : StatusBar.currentHeight ? StatusBar.currentHeight + adjust(0) : adjust(0),
    paddingBottom: STANDARD_SPACING,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerText: {
    fontSize: adjust(18),
    fontWeight: 'bold',
    color: '#333',
    marginLeft: STANDARD_SPACING,
  },
  subHeaderText: {
    fontSize: adjust(12),
    color: '#333',
    textAlign: 'center',
    marginBottom: STANDARD_SPACING * 1.5,
    paddingHorizontal: STANDARD_SPACING,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: adjust(14),
    padding: STANDARD_SPACING/1.5,
    marginBottom: STANDARD_SPACING,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputLabel: {
    fontSize: adjust(12),
    fontWeight: '600',
    color: '#333',
    marginBottom: STANDARD_SPACING/2,
  },
  textInput: {
    height: adjust(35),
    paddingHorizontal: STANDARD_SPACING,
    fontSize: adjust(12),
    color: '#333',
    backgroundColor: '#f8f9fa',
    borderRadius: adjust(10),
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  inputHelperText: {
    fontSize: adjust(10),
    color: '#8e9aaf',
    marginTop: STANDARD_SPACING/3,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: STANDARD_SPACING/1.5,
    backgroundColor: '#f8f9fa',
    borderRadius: adjust(10),
    marginHorizontal: STANDARD_SPACING/3,
  },
  selectedGender: {
    backgroundColor: '#e0f0ff',
    borderWidth: 1,
    borderColor: '#4361ee',
  },
  genderText: {
    fontSize: adjust(10),
    color: '#333',
    marginTop: STANDARD_SPACING/3,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: adjust(10),
    height: adjust(40),
    marginBottom: STANDARD_SPACING/1.5,
  },
  locationButtonText: {
    fontSize: adjust(10),
    color: '#333',
    marginLeft: STANDARD_SPACING/2,
  },
  locationInput: {
    marginTop: 0,
  },
  whyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: STANDARD_SPACING,
  },
  whyText: {
    fontSize: adjust(10),
    color: '#333',
    marginLeft: STANDARD_SPACING/3,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#7698ee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: adjust(30),
    paddingVertical: STANDARD_SPACING/1.5,
    marginBottom: STANDARD_SPACING,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: adjust(14),
    fontWeight: 'bold',
    marginRight: STANDARD_SPACING/3,
  },
});

export default UserInfo;