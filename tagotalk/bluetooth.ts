import { BleManager, Device, LogLevel } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { Buffer } from 'buffer';

const bleManager = new BleManager();
bleManager.setLogLevel(LogLevel.Verbose);

async function requestPermissions() {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);

    const allGranted = Object.values(granted).every(
      (result) => result === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!allGranted) throw new Error('Required permissions not granted');
  }
}

export async function scanAndConnect(onStatus: (msg: string) => void) {
  try {
    await requestPermissions();

    const state = await bleManager.state();
    if (state !== 'PoweredOn') {
      onStatus('Bluetooth is OFF. Please turn it ON and try again.');
      return;
    }

    onStatus('Scanning...');

    bleManager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
      if (error) {
        onStatus('Scan error: ' + error.message);
        return;
      }

      const name = device?.name || device?.localName || 'Unknown';
      console.log('Scanned:', name);
      onStatus(`Scanned: ${name}`);

      if (
        name.includes('ESP32') ||
        device?.serviceUUIDs?.includes('6e400001-b5a3-f393-e0a9-e50e24dcca9e')
      ) {
        bleManager.stopDeviceScan();
        onStatus(`Found: ${name}`);
        try {
          onStatus('Connecting...');
          const connectedDevice = await device.connect();
          onStatus('Connected');

          await connectedDevice.discoverAllServicesAndCharacteristics();
          onStatus('Services discovered');

          // === START of service logic ===
          const services = await connectedDevice.services();
          const service = services.find(s => s.uuid.includes('6e400001'));

          if (!service) {
            onStatus('UART service not found.');
            return;
          }

          const characteristics = await service.characteristics();

          const tx = characteristics.find(c => c.uuid.includes('6e400003')); // Notify
          const rx = characteristics.find(c => c.uuid.includes('6e400002')); // Write

          if (!tx || !rx) {
            onStatus('UART characteristics not found.');
            return;
          }

          // Enable TX notifications
          await tx.monitor((error, characteristic) => {
            if (error) {
              console.error('Notification error:', error);
              return;
            }

            const value = Buffer.from(characteristic?.value ?? '', 'base64').toString();
            console.log('📥 Received from ESP32:', value);
            onStatus(`Received: ${value}`);
          });

          // Send message to ESP32
          const message = "Hi ESP32";
          await rx.writeWithResponse(Buffer.from(message).toString('base64'));
          console.log('📤 Sent to ESP32:', message);
          onStatus(`Sent: ${message}`);
          // === END of service logic ===

        } catch (err: any) {
          onStatus('Connection failed: ' + (err?.message || 'Unknown error'));
        }
      }
    });

    setTimeout(() => {
      bleManager.stopDeviceScan();
      onStatus('Scan stopped (timeout)');
    }, 10000);
  } catch (err: any) {
    onStatus('Error: ' + (err?.message || 'Unexpected error'));
  }
}