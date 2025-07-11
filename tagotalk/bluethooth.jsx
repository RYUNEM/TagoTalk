import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function BluetoothScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [deviceName, setDeviceName] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [noDeviceFound, setNoDeviceFound] = useState(false);

  const handlePress = async () => {
  setIsScanning(true);
  setDeviceName(null);
  setConnectionStatus('Scanning for nearby devices...');
  setNoDeviceFound(false);

  let scanEndedManually = false;

  // Timeout fallback after 10 seconds
  const timeout = setTimeout(() => {
    if (!scanEndedManually) {
      setIsScanning(false);
      setConnectionStatus('Scan timeout. No devices found.');
      setNoDeviceFound(true);
    }
  }, 10000); // 10 seconds

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
        clearTimeout(timeout);         // clear fallback timeout
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },

  statusContainer: {
    marginTop: 60,
    alignItems: 'center',
  },

  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },

  statusText: {
    fontSize: 16,
    marginTop: 2,
    textAlign: 'center',
  },

  scanbutton: {
    width: 140,
    height: 140,
    borderWidth: 1,
    borderColor: '#A0C600',
    backgroundColor: '#C5FF39',
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
