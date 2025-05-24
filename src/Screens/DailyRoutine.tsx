import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';

const DailyRoutine = ({ navigation }: { navigation: any }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);

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

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  const needsScrollView = contentHeight > SCREEN_HEIGHT;

  const renderContent = () => (
    <LinearGradient
      colors={['#c9e3ff', '#7698ee']}
      style={styles.background}
    >
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        activeOpacity={0.8}
        onPress={handleBack}
      >
        <Feather name="arrow-left" size={adjust(24)} color="#fff" />
      </TouchableOpacity>
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Daily Routine</Text>
        <Text style={styles.headerSubtitle}>Customize your weather alerts based on your daily schedule</Text>
      </View>

      {/* Morning Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="weather-sunny" size={adjust(24)} color="#FFC857" />
          <Text style={styles.sectionTitle}>Morning</Text>
        </View>
        <View style={styles.routineCard}>
          <View style={styles.routineItem}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>6:00 AM</Text>
            </View>
            <View style={styles.activityContainer}>
              <Text style={styles.activityText}>Wake Up</Text>
              <MaterialCommunityIcons name="bell-ring-outline" size={adjust(20)} color="#7490E5" />
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.routineItem}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>7:30 AM</Text>
            </View>
            <View style={styles.activityContainer}>
              <Text style={styles.activityText}>Morning Run</Text>
              <MaterialCommunityIcons name="run" size={adjust(20)} color="#7490E5" />
            </View>
          </View>
        </View>
      </View>

      {/* Afternoon Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Feather name="sun" size={adjust(24)} color="#FF9E44" />
          <Text style={styles.sectionTitle}>Afternoon</Text>
        </View>
        <View style={styles.routineCard}>
          <View style={styles.routineItem}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>12:00 PM</Text>
            </View>
            <View style={styles.activityContainer}>
              <Text style={styles.activityText}>Lunch Break</Text>
              <MaterialCommunityIcons name="food-fork-drink" size={adjust(20)} color="#7490E5" />
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.routineItem}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>3:30 PM</Text>
            </View>
            <View style={styles.activityContainer}>
              <Text style={styles.activityText}>Commute Home</Text>
              <MaterialCommunityIcons name="car" size={adjust(20)} color="#7490E5" />
            </View>
          </View>
        </View>
      </View>

      {/* Evening Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="weather-night" size={adjust(24)} color="#5B5E8C" />
          <Text style={styles.sectionTitle}>Evening</Text>
        </View>
        <View style={styles.routineCard}>
          <View style={styles.routineItem}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>6:00 PM</Text>
            </View>
            <View style={styles.activityContainer}>
              <Text style={styles.activityText}>Evening Walk</Text>
              <MaterialCommunityIcons name="walk" size={adjust(20)} color="#7490E5" />
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.routineItem}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>10:00 PM</Text>
            </View>
            <View style={styles.activityContainer}>
              <Text style={styles.activityText}>Bedtime</Text>
              <MaterialCommunityIcons name="bed" size={adjust(20)} color="#7490E5" />
            </View>
          </View>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton} 
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>Add New Activity</Text>
      </TouchableOpacity>
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
    paddingHorizontal: adjust(24),
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? adjust(15) : (StatusBar.currentHeight || 0) + adjust(15),
    paddingBottom: adjust(30),
    minHeight: SCREEN_HEIGHT,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? adjust(15) : (StatusBar.currentHeight || 0) + adjust(15),
    left: adjust(24),
    width: adjust(40),
    height: adjust(40),
    borderRadius: adjust(20),
    backgroundColor: 'rgba(116, 144, 229, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: adjust(60),
    marginBottom: adjust(20),
  },
  headerTitle: {
    fontSize: adjust(28),
    fontWeight: '700',
    color: '#333',
    marginBottom: adjust(8),
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: adjust(16),
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: adjust(20),
  },
  sectionContainer: {
    width: '100%',
    marginBottom: adjust(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(10),
  },
  sectionTitle: {
    fontSize: adjust(18),
    fontWeight: '600',
    color: '#333',
    marginLeft: adjust(8),
  },
  routineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: adjust(12),
    padding: adjust(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: adjust(8),
  },
  timeContainer: {
    width: adjust(80),
  },
  timeText: {
    fontSize: adjust(15),
    fontWeight: '500',
    color: '#555',
  },
  activityContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityText: {
    fontSize: adjust(16),
    fontWeight: '500',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: adjust(5),
  },
  addButton: {
    backgroundColor: '#7490E5',
    paddingVertical: adjust(14),
    paddingHorizontal: adjust(30),
    borderRadius: adjust(30),
    marginTop: adjust(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: adjust(16),
  },
});

export default DailyRoutine; 