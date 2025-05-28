import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import adjust from '../utils/adjust';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants/dimesions';
import { CommonActions } from '@react-navigation/native';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  // Add state for modal
  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState('');

  // Navigation handlers
  const handleSeeMoreDetails = () => {
    setActiveModal('details');
    setModalVisible(true);
  };

  const handleViewStyles = () => {
    setActiveModal('styles');
    setModalVisible(true);
  };

  const handleAdjustSchedule = () => {
    setActiveModal('schedule');
    setModalVisible(true);
  };

  const handleHealthTips = () => {
    setActiveModal('health');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Render different popup content based on activeModal
  const renderModalContent = () => {
    switch (activeModal) {
      case 'details':
        return (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="weather-windy" size={adjust(22)} color="#4361EE" />
              <Text style={styles.modalTitle}>Weather Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={adjust(20)} color="#333" />
        </TouchableOpacity>
      </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Current temperature is 72°F with light wind (8mph)</Text>
              <View style={styles.modalItem}>
                <Feather name="droplet" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Humidity: 65%</Text>
        </View>
              <View style={styles.modalItem}>
                <Feather name="thermometer" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Feels like: 74°F</Text>
      </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="weather-sunset-up" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Sunrise: 6:24 AM</Text>
        </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="weather-sunset-down" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Sunset: 8:15 PM</Text>
      </View>
            </View>
          </View>
        );
      case 'styles':
        return (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="shirt-outline" size={adjust(22)} color="#4361EE" />
              <Text style={styles.modalTitle}>Outfit Styles</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={adjust(20)} color="#333" />
          </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Recommended outfit for today:</Text>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="tshirt-crew" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Light cotton t-shirt</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="pants" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Casual jeans or chinos</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="shoe-sneaker" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Running shoes for comfort</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="glasses" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Sunglasses for UV protection</Text>
              </View>
            </View>
          </View>
        );
      case 'schedule':
        return (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <FontAwesome5 name="running" size={adjust(22)} color="#4361EE" />
              <Text style={styles.modalTitle}>Schedule Adjustment</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={adjust(20)} color="#333" />
          </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Suggested changes to your schedule:</Text>
              <View style={styles.modalItem}>
                <Ionicons name="time-outline" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Reschedule soccer to 7:00 PM</Text>
              </View>
              <View style={styles.modalItem}>
                <Ionicons name="sunny-outline" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Best time for outdoor run: 8:00 AM</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="umbrella" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Bring umbrella between 6-7 PM</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="shield-sun" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Apply sunscreen before 10 AM run</Text>
        </View>
      </View>
          </View>
        );
      case 'health':
        return (
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="alert-circle-outline" size={adjust(22)} color="#4361EE" />
              <Text style={styles.modalTitle}>Health Tips</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={adjust(20)} color="#333" />
        </TouchableOpacity>
      </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Health recommendations for today:</Text>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="flower" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Use allergy medication before going outside</Text>
              </View>
              <View style={styles.modalItem}>
                <Ionicons name="water-outline" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Stay hydrated: aim for 3L of water today</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="sunglasses" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Wear UV-blocking sunglasses when outside</Text>
              </View>
              <View style={styles.modalItem}>
                <MaterialCommunityIcons name="hat-fedora" size={adjust(16)} color="#4361EE" style={styles.modalItemIcon} />
                <Text style={styles.modalItemText}>Use a hat for additional sun protection</Text>
              </View>
      </View>
    </View>
  );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LinearGradient
        colors={['#b3d4ff', '#5c85e6']}
        style={styles.background}
      >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* Header with greeting */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Good morning, Sarah!</Text>
                <Text style={styles.subGreeting}>Perfect weather for your 7 AM run</Text>
              </View>
            </View>

            {/* Weather Card */}
            <View style={styles.weatherCard}>
              {/* Current temperature */}
              <View style={styles.currentTemp}>
                <Text style={styles.tempValue}>72°</Text>
                <Text style={styles.tempRange}>Hi 78° Lo 65°</Text>
              </View>
              
              {/* Sun icon */}
              <View style={styles.weatherIcon}>
                <Feather name="sun" size={adjust(24)} color="#FFD700" />
              </View>

              {/* Hourly forecast */}
              <View style={styles.hourlyForecast}>
                <View style={styles.hourBlock}>
                  <Text style={styles.hourText}>7AM</Text>
                  <Feather name="sun" size={adjust(16)} color="#FFD700" />
                  <Text style={styles.hourTemp}>72°</Text>
                </View>
                <View style={styles.hourBlock}>
                  <Text style={styles.hourText}>8AM</Text>
                  <Feather name="sun" size={adjust(16)} color="#FFD700" />
                  <Text style={styles.hourTemp}>74°</Text>
                </View>
                <View style={styles.hourBlock}>
                  <Text style={styles.hourText}>9AM</Text>
                  <Feather name="sun" size={adjust(16)} color="#FFD700" />
                  <Text style={styles.hourTemp}>75°</Text>
                </View>
                <View style={styles.hourBlock}>
                  <Text style={styles.hourText}>10AM</Text>
                  <Feather name="sun" size={adjust(16)} color="#FFD700" />
                  <Text style={styles.hourTemp}>77°</Text>
                </View>
              </View>
            </View>

            {/* Weather Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoContent}>
                <MaterialCommunityIcons name="weather-windy" size={adjust(20)} color="#4361EE" style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoText}>
                    It's chilly & windy today. Wear your favorite windbreaker & cap!
                  </Text>
                  <Text style={styles.commuteText}>
                    Your 8:00 AM commute might have delays—leave by 7:45 AM
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={handleSeeMoreDetails}
              >
                <Text style={styles.detailsButtonText}>See More Details</Text>
              </TouchableOpacity>
            </View>

            {/* Outfit Card */}
            <View style={styles.outfitCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="shirt-outline" size={adjust(18)} color="#4361EE" />
                <Text style={styles.cardTitle}>Today's Outfit</Text>
              </View>
              <Text style={styles.outfitText}>
                Skylar's picked today's best casual look for cool weather
              </Text>
              <TouchableOpacity 
                style={styles.outfitButton}
                onPress={handleViewStyles}
              >
                <Text style={styles.outfitButtonText}>View Styles</Text>
              </TouchableOpacity>
            </View>

            {/* Routine Card */}
            <View style={styles.routineCard}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="running" size={adjust(18)} color="#4361EE" />
                <Text style={styles.cardTitle}>Routine Suggestion</Text>
              </View>
              <Text style={styles.routineText}>
                Even a soccer at 6 PM might rain out. Skylar recommends heading inside or delaying to 7 PM.
              </Text>
              <TouchableOpacity 
                style={styles.routineButton}
                onPress={handleAdjustSchedule}
              >
                <Text style={styles.routineButtonText}>Adjust Schedule</Text>
              </TouchableOpacity>
            </View>

            {/* Health Alert Card */}
            <View style={styles.healthCard}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="alert-circle-outline" size={adjust(18)} color="#4361EE" />
                <Text style={styles.cardTitle}>Health Alert</Text>
              </View>
              <View style={styles.healthAlerts}>
                <View style={styles.healthAlert}>
                  <Ionicons name="arrow-forward" size={adjust(12)} color="#4361EE" />
                  <Text style={styles.healthAlertText}>High pollen count today</Text>
                </View>
                <View style={styles.healthAlert}>
                  <Ionicons name="sunny-outline" size={adjust(12)} color="#4361EE" />
                  <Text style={styles.healthAlertText}>Strong UV rays 1-4 PM</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.healthButton}
                onPress={handleHealthTips}
              >
                <Text style={styles.healthButtonText}>More Health Tips</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

        {/* Modal for popup cards */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                {renderModalContent()}
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#b3d4ff',
  },
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: adjust(20),
    paddingBottom: adjust(20),
  },
  header: {
    marginTop: adjust(10),
    marginBottom: adjust(15),
  },
  greeting: {
    fontSize: adjust(20),
    fontWeight: '600',
    color: '#333',
  },
  subGreeting: {
    fontSize: adjust(14),
    color: '#666',
    marginTop: adjust(2),
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(14),
    marginBottom: adjust(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentTemp: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: adjust(15),
  },
  tempValue: {
    fontSize: adjust(34),
    fontWeight: '600',
    color: '#333',
  },
  tempRange: {
    fontSize: adjust(11),
    color: '#666',
    marginLeft: adjust(5),
    marginBottom: adjust(5),
  },
  weatherIcon: {
    position: 'absolute',
    top: adjust(15),
    right: adjust(15),
  },
  hourlyForecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: adjust(10),
  },
  hourBlock: {
    alignItems: 'center',
  },
  hourText: {
    fontSize: adjust(11),
    color: '#666',
    marginBottom: adjust(5),
  },
  hourTemp: {
    fontSize: adjust(13),
    fontWeight: '500',
    color: '#333',
    marginTop: adjust(5),
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(14),
    marginBottom: adjust(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContent: {
    flexDirection: 'row',
    marginBottom: adjust(15),
  },
  infoIcon: {
    marginRight: adjust(10),
    marginTop: adjust(2),
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: adjust(13),
    color: '#333',
    marginBottom: adjust(5),
  },
  commuteText: {
    fontSize: adjust(11),
    color: '#666',
  },
  detailsButton: {
    backgroundColor: '#4361EE',
    borderRadius: adjust(8),
    paddingVertical: adjust(11),
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: adjust(13),
    fontWeight: '500',
  },
  outfitCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(14),
    marginBottom: adjust(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(10),
  },
  cardTitle: {
    fontSize: adjust(15),
    fontWeight: '600',
    color: '#333',
    marginLeft: adjust(8),
  },
  outfitText: {
    fontSize: adjust(13),
    color: '#333',
    marginBottom: adjust(15),
  },
  outfitButton: {
    backgroundColor: '#FFD700',
    borderRadius: adjust(8),
    paddingVertical: adjust(11),
    alignItems: 'center',
  },
  outfitButtonText: {
    color: '#333',
    fontSize: adjust(13),
    fontWeight: '500',
  },
  routineCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(14),
    marginBottom: adjust(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routineText: {
    fontSize: adjust(13),
    color: '#333',
    marginBottom: adjust(15),
  },
  routineButton: {
    backgroundColor: '#4361EE',
    borderRadius: adjust(8),
    paddingVertical: adjust(11),
    alignItems: 'center',
  },
  routineButtonText: {
    color: '#fff',
    fontSize: adjust(13),
    fontWeight: '500',
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(14),
    marginBottom: adjust(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthAlerts: {
    marginBottom: adjust(15),
  },
  healthAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(8),
  },
  healthAlertText: {
    fontSize: adjust(13),
    color: '#333',
    marginLeft: adjust(8),
  },
  healthButton: {
    backgroundColor: '#FFD700',
    borderRadius: adjust(8),
    paddingVertical: adjust(11),
    alignItems: 'center',
  },
  healthButtonText: {
    color: '#333',
    fontSize: adjust(13),
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: adjust(20),
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: adjust(15),
    padding: adjust(16),
    width: '100%',
    maxWidth: adjust(320),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(12),
    paddingBottom: adjust(8),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: adjust(18),
    fontWeight: '600',
    color: '#333',
    marginLeft: adjust(10),
    flex: 1,
  },
  closeButton: {
    width: adjust(30),
    height: adjust(30),
    borderRadius: adjust(15),
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    paddingVertical: adjust(8),
  },
  modalText: {
    fontSize: adjust(14),
    color: '#333',
    marginBottom: adjust(15),
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: adjust(12),
  },
  modalItemIcon: {
    marginRight: adjust(8),
  },
  modalItemText: {
    fontSize: adjust(14),
    color: '#333',
  },
});

export default HomeScreen;