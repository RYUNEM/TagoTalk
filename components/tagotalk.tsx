import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  ShowQRCode: undefined;
  ScanQRCode: undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TagoTalkUI() {
  const navigation = useNavigation<Nav>();

  const handleStartCall = () => {
    Alert.alert("Start Call", "Do you want to host or join?", [
      { text: "Host", onPress: () => navigation.navigate("ShowQRCode") },
      { text: "Join", onPress: () => navigation.navigate("ScanQRCode") }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.hamburger}>
          <Ionicons name="menu" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>TagoTalk</Text>
      </View>

      {/* Scan Icon */}
      <TouchableOpacity
        style={styles.scanIconContainer}
        onPress={() => navigation.navigate("ScanQRCode")}
      >
        <FontAwesome name="qrcode" size={40} color="#1A1A1A" />
        <Text style={{ fontSize: 12 }}>Scan</Text>
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>LOGO</Text>
      </View>

      {/* Start Call */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.scanButton} onPress={handleStartCall}>
          <Text style={styles.scanText}>START CALL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#fff'},
  navbar:{flexDirection:'row',alignItems:'center',backgroundColor:'#EDEDED',paddingVertical:10,paddingHorizontal:15,borderBottomLeftRadius:10,borderBottomRightRadius:10},
  hamburger:{width:36,height:36,backgroundColor:'#C5FF39',borderRadius:8,alignItems:'center',justifyContent:'center',marginRight:10},
  title:{fontSize:22,fontWeight:'bold',fontFamily:'sans-serif'},
  scanIconContainer:{alignItems:'center',marginTop:20},
  logoContainer:{flex:1,alignItems:'center',justifyContent:'center'},
  logo:{fontSize:24,fontWeight:'bold'},
  bottomRow:{position:'absolute',bottom:100,width:'100%',alignItems:'center',justifyContent:'center'},
  scanButton:{width:140,height:140,elevation:10,borderWidth:1,borderColor:'#A0C600',backgroundColor:'#C5FF39',borderRadius:70,alignItems:'center',justifyContent:'center',shadowColor:'#000',shadowOpacity:0.3,shadowRadius:4,shadowOffset:{width:0,height:2},marginBottom:50},
  scanText:{fontWeight:'bold',fontSize:18,color:'#000'},
});
