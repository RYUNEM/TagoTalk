import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform, PermissionsAndroid } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import WifiManager from "react-native-wifi-reborn";
import { useNavigation } from "@react-navigation/native";

export default function ScanQRCode() {
  const navigation = useNavigation();

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ];
      try {
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const denied = Object.entries(granted).filter(
          ([, status]) => status !== PermissionsAndroid.RESULTS.GRANTED
        );
        if (denied.length > 0) {
          Alert.alert(
            "Permissions required",
            "Some permissions were denied. Features may not work properly."
          );
        }
      } catch (err) {
        console.error("Permission error:", err);
      }
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const onSuccess = async (e) => {
    try {
      const data = JSON.parse(e.data);

      if (!data.ssid || !data.password || !data.signaling) {
        Alert.alert("Error", "Invalid QR Code data");
        return;
      }

      // Connect to hotspot (Android only)
      if (Platform.OS === "android") {
        try {
          await WifiManager.connectToProtectedSSID(
            data.ssid,
            data.password,
            false,
            false
          );
          console.log("✅ Connected to Wi-Fi:", data.ssid);
        } catch (err) {
          Alert.alert(
            "Wi-Fi",
            "Failed to auto-connect. Please join manually in Settings."
          );
        }
      }

      // Navigate to GroupCall screen
      navigation.navigate("GroupCall", {
        qr: data,
        isOwner: false,
      });
    } catch (err) {
      Alert.alert("Error", "Invalid QR Code format");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR to Join</Text>
      <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.off}
        showMarker
        markerStyle={{ borderColor: "#C5FF39", borderRadius: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginTop: 20, marginBottom: 10 },
});
