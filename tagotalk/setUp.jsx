import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { scanWifiNetworks, connectToWifi } from '../setups/WifiManager';

export default function SetUP() {
  const navigation = useNavigation();
  const [wifiList, setWifiList] = useState([]);
  const [scanned, setScanned] = useState(false);

  const handleScan = async () => {
    const results = await scanWifiNetworks();
    setWifiList(results);
    setScanned(true);
  };

  const handleNetworkPress = async (ssid) => {
    const success = await connectToWifi(ssid, null); // null = open network
    if (success) {
      Alert.alert('Success', `Connected to ${ssid}`);
      navigation.navigate('Home');
    } else {
      Alert.alert('Failed', `Could not connect to ${ssid}`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleScan}>
        <Text style={styles.buttonText}>SCAN</Text>
      </TouchableOpacity>

      {scanned && (
        <FlatList
          data={wifiList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.networkItem}
              onPress={() => handleNetworkPress(item.SSID)}
            >
              <Text>{item.SSID}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEF2C8',
    padding: 20,
    paddingTop: 60,
  },
  button: {
    backgroundColor: '#BFFF34',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
  },
  networkItem: {
    padding: 15,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#aaa',
    borderWidth: 1,
  },
});
