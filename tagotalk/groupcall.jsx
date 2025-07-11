import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GroupCallDashboard() {
    return(
        <View style={styles.container}>
        <Text style={styles.title}>Group Call Dashboard</Text>
        
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
});