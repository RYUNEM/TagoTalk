import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import WifiManager from "react-native-wifi-reborn";
import HostServer from "../HostServer"; // make sure path is correct

export default function ShowQRCode() {
  const [hostIP, setHostIP] = useState("192.168.0.1"); // fallback IP
  const [server, setServer] = useState<HostServer | null>(null);

  useEffect(() => {
    const fetchIPAndStartServer = async () => {
      try {
        const ip = await WifiManager.getIP(); // get device hotspot/Wi-Fi IP
        setHostIP(ip);

        // Start signaling server
        const s = new HostServer(8080);
        s.start();
        setServer(s);
      } catch (err) {
        console.warn("Failed to get IP or start server:", err);
      }
    };
    fetchIPAndStartServer();

    // Stop server on unmount
    return () => {
      server?.stop();
    };
  }, []);

  const qrPayload = {
    ssid: "TagoTalkMesh",
    password: "12345678",
    signaling: `ws://${hostIP}:8080`, // dynamic IP
    meshGroup: "team123",
    maxPeers: 6,
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
