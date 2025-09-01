import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { scanWifiNetworks, connectToWifi } from '../setups/WifiManager';

type RootStackParamList ={
  Home: undefined;
}
export default function SetUP() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [wifiList, setWifiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSSID, setSelectedSSID] = useState('');
  const [password, setPassword] = useState('');

  const handleScan = async () => {
    setLoading(true);
    try {
      const results = await scanWifiNetworks();
      setWifiList(results);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to scan networks.');
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkPress = (ssid) => {
    setSelectedSSID(ssid);
  };

  const handleConnect = async () => {
    if (!selectedSSID) {
      Alert.alert('No SSID selected');
      return;
    }

    const success = await connectToWifi(selectedSSID, password);
    Alert.alert(success ? '✅ Connected' : '❌ Connection failed');
    if (success) navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleScan}>
        <Text style={styles.buttonText}>{loading ? 'Scanning...' : 'Scan Wi-Fi'}</Text>
      </TouchableOpacity>

      <FlatList
        data={wifiList}
        keyExtractor={(item) => item.BSSID}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleNetworkPress(item.SSID)}
          >
            <Text>{item.SSID}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedSSID !== '' && (
        <>
          <Text style={styles.label}>Selected: {selectedSSID}</Text>
          <TextInput
            placeholder="Enter password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleConnect}>
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#e0f6afff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  button: {
    marginTop: 30,
    backgroundColor: '#C5FF39',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#000000', fontWeight: 'bold' },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  label: {
    marginTop: 10,
    fontWeight: '600',
  },
});
