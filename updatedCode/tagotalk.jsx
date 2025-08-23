// TagoTalkUI.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TagoTalkUI() {
  const navigation = useNavigation();
  const [isOwner, setIsOwner] = useState(true); // toggle for testing

  const handleStartCall = () => {
    if (isOwner) {
      navigation.navigate('ShowQRCode');
    } else {
      navigation.navigate('ScanQRCode');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.hamburger}>
          <Ionicons name="menu" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>TagoTalk</Text>
      </View>

      {/* Scan icon above title */}
      <View style={styles.scanIconContainer}>
        <FontAwesome name="qrcode" size={40} color="#1A1A1A" />
        <Text style={{ fontSize: 12 }}>Scan</Text>
      </View>

      <View style={styles.logoContainer}>
        <Text style={styles.logo}>LOGO</Text>
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.scanButton} onPress={handleStartCall}>
          <Text style={styles.scanText}>START CALL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#fff'},
  navbar:{flexDirection:'row',alignItems:'center',backgroundColor:'#EDEDED',paddingVertical:10,paddingHorizontal:15,borderBottomLeftRadius:10,borderBottomRightRadius:10},
  hamburger:{width:36,height:36,marginTop:50,backgroundColor:'#C5FF39',borderRadius:8,alignItems:'center',justifyContent:'center',marginRight:10},
  title:{fontSize:22,marginTop:50,fontWeight:'bold',fontFamily:'sans-serif'},
  scanIconContainer:{alignItems:'center',marginTop:20},
  logoContainer:{flex:1,alignItems:'center',justifyContent:'center'},
  logo:{fontSize:24,fontWeight:'bold'},
  bottomRow:{position:'absolute',bottom:100,width:'100%',alignItems:'center',justifyContent:'center'},
  scanButton:{width:140,height:140,elevation:10,borderWidth:1,borderColor:'#A0C600',backgroundColor:'#C5FF39',borderRadius:70,alignItems:'center',justifyContent:'center',shadowColor:'#000',shadowOpacity:0.3,shadowRadius:4,shadowOffset:{width:0,height:2},marginBottom:50},
  scanText:{fontWeight:'bold',fontSize:18,color:'#000'},
});
