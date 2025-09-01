import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BluetoothScanner() {
  const navigation = useNavigation();
  const [isScanning, setIsScanning] = useState(false);
  const [deviceName, setDeviceName] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [noDeviceFound, setNoDeviceFound] = useState(false);
  const backAnim = useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    backAnim.setValue(0.8);
    Animated.spring(backAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    setIsScanning(true);
    setDeviceName(null);
    setConnectionStatus('Scanning for nearby devices...');
    setNoDeviceFound(false);

    let scanEndedManually = false;

    const timeout = setTimeout(() => {
      if (!scanEndedManually) {
        setIsScanning(false);
        setConnectionStatus('Scan timeout. No devices found.');
        setNoDeviceFound(true);
      }
    }, 10000);

    await scanAndConnect((status) => {
      if (typeof status === 'string') {
        setConnectionStatus(status);

        const match = status.match(/Found device: (.+)/);
        if (match && match[1]) {
          setDeviceName(match[1]);
          setNoDeviceFound(false);
        }

        const scanEnded =
          status.includes('Scan stopped') ||
          status.includes('Connected') ||
          status.includes('Connection failed') ||
          status.includes('Bluetooth is OFF') ||
          status.includes('Error');

        if (scanEnded) {
          scanEndedManually = true;
          clearTimeout(timeout);
          setIsScanning(false);
          if (!match && !status.includes('Connected')) {
            setNoDeviceFound(true);
          }
        }
      } else {
        scanEndedManually = true;
        clearTimeout(timeout);
        setConnectionStatus('Unexpected error occurred.');
        setIsScanning(false);
        setNoDeviceFound(true);
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Sticky Navbar */}
      <View style={styles.navbar}>
        <Animated.View style={{ transform: [{ scale: backAnim }] }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              animateButton();
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Home'); 
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

      </View>

      {/* Device Info Section */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Device:</Text>
        <Text style={styles.statusText}>
          {deviceName || 'No device detected yet'}
        </Text>

        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusText}>
          {connectionStatus
            ? connectionStatus.split('\n').map((line, i) => (
                <Text key={i}>{line}{'\n'}</Text>
              ))
            : 'Idle'}
        </Text>
      </View>

      {/* Scan Button at Bottom */}
      <TouchableOpacity onPress={handlePress} style={styles.scanbutton} disabled={isScanning}>
        {isScanning ? (
          <ActivityIndicator size="large" color="black" />
        ) : (
          <>
            <Ionicons name="bluetooth" size={32} color="black" />
            <Text style={styles.buttonText}>
              {noDeviceFound ? 'RETRY SCAN' : 'SCAN'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Replace this with your actual Bluetooth scanner logic
//async function scanAndConnect(callback) {
  // Fake delay + device found
  //setTimeout(() => {
   // callback("Found device: MyESP32");
    //setTimeout(() => {
     // callback("Connected to MyESP32");
     // setTimeout(() => {
       // callback("Scan stopped");
     // }, 1000);
    //}, 2000);
  //}, 2000);
//}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 999,
    elevation: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5C5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statusContainer: {
    marginTop: 150,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F3FFE2',
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  statusText: {
    fontSize: 17,
    marginTop: 4,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  scanbutton: {
    width: 140,
    height: 140,
    borderWidth: 1,
    borderColor: '#A0C600',
    backgroundColor: '#C5FF39',
    marginBottom: 100,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    marginTop: 6,
    fontWeight: 'bold',
    color: 'black',
  },
});
