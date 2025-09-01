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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { scanAndConnect } from '../setups/bluetooth';

type RootStackParamList = {
  Home: undefined;
  groupcall: undefined;
  bluetooth: undefined;
};

type BLEDevice = {
  id: string;
  name: string;
};

export default function BluetoothScanner() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isScanning, setIsScanning] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [noDeviceFound, setNoDeviceFound] = useState(false);
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
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
    setDevices([]);
    setSelectedDeviceId(null);

    await scanAndConnect((status, scannedDevice) => {
      if (status) setConnectionStatus(status);
      if (scannedDevice) {
        setDevices((prev) => {
          if (!prev.find((d) => d.id === scannedDevice.id)) {
            return [...prev, scannedDevice];
          }
          return prev;
        });
      }
    });

    // ✅ check if nothing was found
    if (devices.length === 0) {
      setNoDeviceFound(true);
      setConnectionStatus('No devices found');
    }

    setIsScanning(false);
  };

  const connectToDeviceById = async (deviceId: string, name: string) => {
    setConnectionStatus(`Connecting to ${name}...`);
    setSelectedDeviceId(deviceId);
    setDeviceName(name);

    await scanAndConnect((status) => {
      if (status) setConnectionStatus(status);
    }, deviceId);
  };

  return (
    <View style={styles.container}>
      {/* Navbar with back button */}
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

      {/* Device + Status box */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Device:</Text>
        <Text style={styles.statusText}>
          {deviceName || 'No device detected yet'}
        </Text>

        <Text style={styles.statusLabel}>Status:</Text>
        {connectionStatus ? (
          connectionStatus.split('\n').map((line, i) => (
            <Text key={i} style={styles.statusText}>{line}</Text>
          ))
        ) : (
          <Text style={styles.statusText}>Idle</Text>
        )}
      </View>

      {/* List of devices */}
      <View style={{ marginTop: 20, alignItems: 'center', flex: 1 }}>
        {devices.map((dev) => (
          <TouchableOpacity
            key={dev.id}
            style={{
              backgroundColor: selectedDeviceId === dev.id ? '#C5FF39' : '#F3FFE2',
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
              width: '90%',
              alignItems: 'center',
            }}
            onPress={() => connectToDeviceById(dev.id, dev.name)}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{dev.name}</Text>
          </TouchableOpacity>
        ))}

        {/* ✅ Show retry if nothing found */}
        {noDeviceFound && devices.length === 0 && (
          <Text style={{ marginTop: 20, fontSize: 16, color: 'red' }}>
            No devices found. Try scanning again.
          </Text>
        )}
      </View>

      {/* Scan button */}
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.scanbutton, isScanning && { opacity: 0.6 }]}
        disabled={isScanning}
      >
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
