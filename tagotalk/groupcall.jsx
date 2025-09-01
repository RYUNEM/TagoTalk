import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

export default function GroupCallDashboard() {
  const modalRef = useRef(null);
  const navigation = useNavigation();
  const backAnim = useRef(new Animated.Value(1)).current;

  const [participants, setParticipants] = useState([
    { id: 1, name: 'Alice', isSpeaking: true },
    { id: 2, name: 'Bob', isSpeaking: false },
    { id: 3, name: 'Carol', isSpeaking: true },
  ]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(backAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(backAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBackPress = () => {
    animateButton();
    setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Home'); // fallback route
      }
    }, 200);
  };

  const openModal = () => {
    modalRef.current?.open();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Sticky Navbar */}
        <View style={styles.navbar}>
          <Animated.View style={{ transform: [{ scale: backAnim }] }}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Drawer Handle */}
        <TouchableOpacity style={styles.drawerHandleArea} onPress={openModal}>
          <View style={styles.drawerIndicator} />
        </TouchableOpacity>

        {/* Call Request Box */}
        <View style={styles.callRequestBox}>
          <Text style={styles.callRequestText}>Incoming call requests will appear here.</Text>
        </View>

        {/* Start Call Button */}
        <TouchableOpacity style={styles.startCallButton}>
          <Text style={styles.startCallText}>START CALL</Text>
        </TouchableOpacity>

        {/* Participants Drawer */}
        <Modalize
          ref={modalRef}
          handlePosition="inside"
          withHandle={true}
          panGestureComponentEnabled
          closeOnOverlayTap
          adjustToContentHeight
        >
          <ScrollView horizontal style={styles.topDrawer} showsHorizontalScrollIndicator={false}>
            {participants.map((user) => (
              <View key={user.id} style={styles.card}>
                <Text style={styles.cardText}>{user.name}</Text>
                <Ionicons
                  name={user.isSpeaking ? 'mic' : 'mic-off'}
                  size={24}
                  color={user.isSpeaking ? 'green' : 'gray'}
                />
              </View>
            ))}
          </ScrollView>
        </Modalize>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingTop: 80,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 999,
    elevation: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5C5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  drawerHandleArea: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  drawerIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
  },
  topDrawer: {
    padding: 10,
    paddingLeft: 15,
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    width: 80,
    height: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  callRequestBox: {
    marginTop: 40,
    width: '85%',
    height: 300,
    backgroundColor: '#f8fcb3',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#dcdc9e',
    borderWidth: 1,
  },
  callRequestText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  startCallButton: {
    width: 140,
    height: 140,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#A0C600',
    marginTop: 250,
    backgroundColor: '#C5FF39',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  startCallText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    textShadowColor: '#999',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
