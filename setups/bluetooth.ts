import { BleManager, Device, LogLevel } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { Buffer } from 'buffer';

const bleManager = new BleManager();
bleManager.setLogLevel(LogLevel.Verbose);

type BLEDevice = {
  id: string;
  name: string;
};

// ✅ Overload: connect to specific device
export function scanAndConnect(
  onStatus: (msg: string) => void,
  targetDeviceId: string
): Promise<void>;

// ✅ Overload: scan for all nearby devices
export function scanAndConnect(
  onStatus: (msg: string, device: BLEDevice) => void
): Promise<void>;

// ✅ Implementation
export async function scanAndConnect(
  onStatus: (msg: string, device?: BLEDevice) => void,
  targetDeviceId?: string
): Promise<void> {
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

      if (!device || !device.id) return;

      const name = device.name || device.localName || 'Unknown';
      const id = device.id;

      // 🟨 Scan mode — just list nearby devices
      if (!targetDeviceId) {
        onStatus(`Scanned: ${name}`, { id, name });
        return;
      }

      // 🟩 Connect mode — try to connect to target
      if (device.id !== targetDeviceId) return;

      bleManager.stopDeviceScan();
      onStatus(`Found: ${name}`);

      try {
        onStatus('Connecting...');
        const connectedDevice: Device = await device.connect();
        onStatus('Connected');

        await connectedDevice.discoverAllServicesAndCharacteristics();
        onStatus('Services discovered');

        const services = await connectedDevice.services();
        const uartService = services.find((s) => s.uuid.toLowerCase().includes('6e400001'));
        if (!uartService) {
          onStatus('UART service not found.');
          return;
        }

        const characteristics = await uartService.characteristics();
        const tx = characteristics.find((c) => c.uuid.toLowerCase().includes('6e400003')); // notify
        const rx = characteristics.find((c) => c.uuid.toLowerCase().includes('6e400002')); // write

        if (!tx || !rx) {
          onStatus('UART characteristics not found.');
          return;
        }

        await tx.monitor((error, characteristic) => {
          if (error) {
            onStatus('Notification error: ' + error.message);
            return;
          }

          const value = Buffer.from(characteristic?.value ?? '', 'base64').toString();
          onStatus(`Received: ${value}`);
        });

        const message = 'Hi ESP32';
        await rx.writeWithResponse(Buffer.from(message).toString('base64'));
        onStatus(`Sent: ${message}`);
      } catch (err: any) {
        onStatus('Connection failed: ' + (err?.message || 'Unknown error'));
      }
    });

    // Stop scanning after 10 seconds
    setTimeout(() => {
      bleManager.stopDeviceScan();
      onStatus('Scan stopped (timeout)');
    }, 10000);
  } catch (err: any) {
    onStatus('Error: ' + (err?.message || 'Unexpected error'));
  }
}

// ✅ Request Android Bluetooth + location permissions
async function requestPermissions(): Promise<void> {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);

    const allGranted = Object.values(granted).every(
      (result) => result === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!allGranted) {
      throw new Error('Required permissions not granted');
    }
  }
}
