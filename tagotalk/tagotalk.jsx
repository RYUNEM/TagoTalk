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
  const [showDropUp, setShowDropUp] = useState(false);

  const handleChoice = (choice) => {
    console.log('You selected:', choice);
    setShowDropUp(false);

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
        <TouchableOpacity style={styles.squareButton} />

        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanText}>SCAN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.squareButton}
          onPress={() => setShowDropUp(true)}
        >
          <FontAwesome name="phone" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Drop-Up Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={showDropUp}
        onRequestClose={() => setShowDropUp(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setShowDropUp(false)}
        >
          <View style={styles.dropUp}>
            <TouchableOpacity
              onPress={() => handleChoice('Group Call')}
              style={styles.option}
            >
              <Text style={styles.optionText}>Group Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleChoice('2-Person Call')}
              style={styles.option}
            >
              <Text style={styles.optionText}>2-Person Call</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  squareButton: {
    width: 60,
    height: 60,
    backgroundColor: '#F3FFE2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  scanButton: {
    width: 140,
    height: 140,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#A0C600',
    marginBottom: 100,
    backgroundColor: '#C5FF39',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  scanText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dropUp: {
    backgroundColor: '#F3FFE2',
    paddingBottom: 30,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  option: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '500',
  },
});
