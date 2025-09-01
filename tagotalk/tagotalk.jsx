import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TagoTalkUI() {
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);

  const handleChoice = (choice) => {
    console.log('You selected:', choice);
    setShowModal(false);

    if (choice === 'Group Call') {
      navigation.navigate('GroupCall');
    }
    if (choice === '2-Person Call') {
      navigation.navigate('bluethooth');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Nav */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.hamburger}>
          <Ionicons name="menu" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>TagoTalk</Text>
      </View>

      {/* Logo Placeholder */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>LOGO</Text>
      </View>

      {/* Bottom Buttons */}
            <View style={styles.bottomRow}>
        <View style={styles.centerScanWrapper}>
          <TouchableOpacity style={styles.scanButton}>
            <Text style={styles.scanText}>SCAN</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.squareButton}
          onPress={() => setShowModal(true)}
        >
          <FontAwesome name="phone" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Center Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.centeredModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleChoice('Group Call')}
              style={styles.option}
            >
              <FontAwesome name="users" size={20} color="#1A1A1A" style={styles.optionIcon} />
              <Text style={styles.optionText}>Group Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleChoice('2-Person Call')}
              style={styles.option}
            >
              <FontAwesome name="user" size={20} color="#1A1A1A" style={styles.optionIcon} />
              <Text style={styles.optionText}>2-Person Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  hamburger: {
    width: 36,
    height: 36,
    marginTop: 50,
    backgroundColor: '#C5FF39',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    marginTop: 50,
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
  },

bottomRow: {
  position: 'absolute',
  bottom: 100,
  width: '100%',
  height: 160, // Ensure enough space for scanButton height
  alignItems: 'center',
  justifyContent: 'center',
},

centerScanWrapper: {
  position: 'absolute',
  left: '50%',
  transform: [{ translateX: -70 }], // 70 = half of scanButton width
},

scanButton: {
  width: 140,
  height: 140,
  elevation: 10,
  borderWidth: 1,
  borderColor: '#A0C600',
  backgroundColor: '#C5FF39',
  borderRadius: 70,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  marginBottom: 50,
},

squareButton: {
  position: 'absolute',
  right: 30,
  bottom: 0,
  width: 60,
  height: 60,
  backgroundColor: '#F3FFE2',
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#1A1A1A',
},

  scanText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredModal: {
    width: 280,
    backgroundColor: '#F3FFE2',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
     borderWidth: 1,
      borderColor: '#1A1A1A'
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  closeText: {
    fontSize: 24,
    color: '#FF0000',
  },
  option: {
    paddingVertical: 15,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '500',
  },
});
