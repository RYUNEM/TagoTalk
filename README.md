# TagoTalk - A mesh-based communacation set-up for motorcycle riders with app integration
TagoTalk is an offline communication system designed specifically for motorcycle riders, particularly motorcycle clubs, to maintain seamless group coordination without relying on internet or cellular signal.

##🚦 Overview

TagoTalk combines Wi-Fi Direct / Mesh Networking and Bluetooth to create a reliable, low-latency communication platform for riders, ensuring connectivity even in remote areas.

Hotspot / Mesh Networking: Forms the backbone of the group communication network, enabling devices to interconnect and relay messages across riders.

Bluetooth: Links the rider’s smartphone with the helmet-mounted communication device (ESP32-based).

Together, these technologies enable real-time group communication for safe and efficient coordination on the road.

## 🔧 Features

M5Stack Module with ES8388 Audio Codec — provides high-quality audio input/output.

ESP32 Microcontroller — powers the helmet device and manages connections.

Hotspot (Wi-Fi Direct / Mesh) — backbone for rider-to-rider connectivity.

Bluetooth — connects helmet devices to smartphones.

Local Host Server — manages group sessions and relays communication within the mesh.

## Architecture

```
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
```

## 💻 Technology Stack

Framework: React Native

Language: JavaScript (with TypeScript support optional)

Hardware: ESP32 + M5Stack module with ES8388 audio codec

## 🎨 UI/UX Design

Mobile-First Design — optimized for Android devices used by riders.

Clean and Minimal Interface — avoids clutter for safety and quick use on the go.

Large Buttons & Simple Controls — ensures easy tapping while wearing gloves.

Accessibility — high-contrast text and icons for easy readability.

Quick Access Dashboard — riders can instantly join calls, check Bluetooth pairing, or scan QR codes.

Offline First — UI elements prioritize status feedback (online/offline) over cloud features.

## 📸 Screenshots

Screenshots will be added here in future updates.

✨ Built for motorcycle riders to stay connected anytime, anywhere, without the need for internet.
