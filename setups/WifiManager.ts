
// setups/WifiManager.ts
import WifiManager from 'react-native-wifi-reborn';
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestWifiPermissions() {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        // Use string literals for untyped permissions
        'android.permission.ACCESS_WIFI_STATE' as any,
        'android.permission.CHANGE_WIFI_STATE' as any,
        'android.permission.ACCESS_NETWORK_STATE' as any,
        'android.permission.ACCESS_BACKGROUND_LOCATION' as any,
      ]);
      return Object.values(granted).every(value => value === PermissionsAndroid.RESULTS.GRANTED);
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  }
  return true;
}

export async function scanWifiNetworks() {
  const hasPermission = await requestWifiPermissions();
  if (!hasPermission) {
    throw new Error('WiFi permissions not granted');
  }

  try {
    const networks = await WifiManager.loadWifiList();
    return networks;
  } catch (err) {
    console.warn('WiFi scan failed:', err);
    return [];
  }
}
export async function connectToWifi(ssid: string, password: string) {
  try {
    await WifiManager.connectToProtectedSSID(ssid, password, false, false);
    return true;
  } catch (err) {
    console.warn('WiFi connection failed:', err);
    return false;
  }
}