# TagoTalk - A mesh-based communacation set-up for motorcycle riders with app integration
TagoTalk is an offline communication system designed specifically for motorcycle riders, particularly motorcycle clubs, to maintain seamless group coordination without relying on internet or cellular signal.

The system operates through a hybrid connection setup:
* Hotspot (Wi-Fi Direct / Mesh Networking) - Acts as the backbone of the communication network, allowing devices to interconnect and relay messages across the group.
* Bluetooth - Provides a direct link between the rider’s smartphone and the communication device mounted on the helmet.
  
By combining these technologies, TagoTalk ensures reliable, low-latency communication for riders, even in areas with poor or no network coverage.

# Features 
* M5Stack Module Audio ES8388 -
* ESP32 Micro-Crontroller -
* Hotspot -
* Bluetooh -
* Server -

# Architecture

src/
├── components/              # Reusable UI parts (buttons, cards, modals)
│   └── (future UI widgets)
│
├── screens/                 # Full UI screens
│   ├── GroupCall.tsx
│   ├── ScanQRCode.tsx
│   ├── ShowQRCode.tsx
│   ├── Bluetooth.tsx  
│   
│
├── setups/                  
│   ├── WifiManager.ts
│   ├── bluetoothSetup.ts     
│   └── HostServer.js         
│
├── App.tsx                   


# Technology Stack
Framework: React Native
Language: JavaScript (js)

# Screenshots
Screenshots will be added here..

