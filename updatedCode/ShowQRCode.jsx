// ShowQRCode.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function ShowQRCode() {
  // In production, generate meshGroup randomly per session
  const qrPayload = {
    ssid: "TagoTalkMesh",
    password: "12345678",
    signaling: "ws://192.168.43.1:8080", // hotspot host IP
    meshGroup: "team123",
    maxPeers: 6
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share this QR with teammates</Text>
      <QRCode value={JSON.stringify(qrPayload)} size={250} />
      <Text style={styles.info}>SSID: {qrPayload.ssid}</Text>
      <Text style={styles.info}>Password: {qrPayload.password}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#fff"},
  title:{fontSize:20,fontWeight:"bold",marginBottom:20},
  info:{marginTop:10,fontSize:16},
});
