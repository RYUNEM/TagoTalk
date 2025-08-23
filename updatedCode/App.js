// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TagoTalkUI from './components/tagotalk';
import GroupCallDashboard from './components/groupcall';
import SetUP from './components/setUp'; 
import Bluetooth from './components/bluethooth';
import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SetUP" component={SetUP} />
        <Stack.Screen name="Home" component={TagoTalkUI} />
        <Stack.Screen name="ShowQRCode" component={ShowQRCode} />
        <Stack.Screen name="ScanQRCode" component={ScanQRCode} />
        <Stack.Screen name="GroupCalls" component={GroupCall} />
        <Stack.Screen name="GroupCall" component={GroupCallDashboard} />
        <Stack.Screen name="bluethooth" component={Bluetooth} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
