// ScanQRCode.jsx (Expo managed: use expo-camera; Bare RN: react-native-qrcode-scanner)
import React from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import WifiManager from "react-native-wifi-reborn";
import { useNavigation } from "@react-navigation/native";

export default function ScanQRCode() {
  const navigation = useNavigation();

  const onSuccess = async (e) => {
    try {
      const data = JSON.parse(e.data);

      // Optional: Android auto Wi-Fi connect (iOS limited)
      if (Platform.OS === "android") {
        try {
          await WifiManager.connectToProtectedSSID(
            data.ssid,
            data.password,
            false,
            false
          );
        } catch (err) {
          Alert.alert("Wi-Fi", "Failed to auto-connect. Join manually in Settings, then come back.");
        }
      }

      navigation.navigate("GroupCall", {
        qr: data,
        isOwner: false,
      });
    } catch (err) {
      Alert.alert("Error", "Invalid QR Code");
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
  container:{flex:1,backgroundColor:"#fff"},
  title:{fontSize:18,fontWeight:"bold",textAlign:"center",marginTop:20,marginBottom:10},
});
