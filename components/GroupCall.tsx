// screens/GroupCall.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from "react-native";
import { RTCPeerConnection, mediaDevices, MediaStream } from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";

const SIGNALING_URL_FALLBACK = "ws://192.168.43.1:8080"; // replace if needed

interface GroupCallProps {
  route: any;
}

interface PeerEntry {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
}

export default function GroupCall({ route }: GroupCallProps) {
  const qr = route?.params?.qr ?? {};
  const isOwner = route?.params?.isOwner ?? false;
  const SIGNALING_URL = qr.signaling || SIGNALING_URL_FALLBACK;
  const MAX_PEERS = qr.maxPeers || 6;

  const selfId = useMemo(
    () => route?.params?.selfId || "rider-" + Math.random().toString(36).slice(2),
    []
  );

  const [muted, setMuted] = useState(false);
  const [peerIds, setPeerIds] = useState<string[]>([]);
  const pcsRef = useRef<Record<string, PeerEntry>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const addPeerId = (id: string) => setPeerIds((p) => (p.includes(id) ? p : [...p, id]));
  const removePeerId = (id: string) => setPeerIds((p) => p.filter((pid) => pid !== id));

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]);
      } catch (err) {
        console.warn("Permission error", err);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await requestPermissions();

        const stream = await mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } as any,
          video: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;

        InCallManager.start({ media: "audio" });
        InCallManager.setForceSpeakerphoneOn(true);

        const ws = new WebSocket(SIGNALING_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "join", group: qr.meshGroup || "default", id: selfId }));
        };

        ws.onmessage = async (ev) => {
          let msg;
          try {
            msg = JSON.parse(ev.data);
          } catch (e) {
            return;
          }
          await handleSignal(msg);
        };

        ws.onerror = (e) => console.warn("WS error", e);
      } catch (err) {
        Alert.alert("Error", "Failed to initialize audio or signaling: " + String(err));
      }
    })();

    return () => {
      mounted = false;
      InCallManager.stop();
      Object.values(pcsRef.current).forEach((entry) => entry.pc.close());
      wsRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleSignal = async (msg: any) => {
    if (!msg || typeof msg !== "object") return;

    const type = msg.type;

    if (type === "peers") {
      const peers: string[] = (msg.peers || []).filter((p: string) => p !== selfId);
      if (peers.length + 1 > MAX_PEERS) {
        Alert.alert("Team Full", `This mesh supports up to ${MAX_PEERS} riders.`);
      }
      const space = Math.max(0, MAX_PEERS - 1);
      for (const pid of peers.slice(0, space)) {
        if (!pcsRef.current[pid]) await createPeer(pid, true);
      }
      return;
    }

    if (type === "new-peer") {
      const pid: string = msg.id;
      if (pid !== selfId && Object.keys(pcsRef.current).length < MAX_PEERS - 1) {
        await createPeer(pid, true);
      }
      return;
    }

    if (type === "peer-left") {
      const pid: string = msg.id;
      if (pcsRef.current[pid]) {
        pcsRef.current[pid].pc.close();
        delete pcsRef.current[pid];
        removePeerId(pid);
      }
      return;
    }

    if ((type === "offer" || type === "answer") && msg.to === selfId && msg.from) {
      const from: string = msg.from;
      if (!pcsRef.current[from]) await createPeer(from, false);

      const pc = pcsRef.current[from].pc;
      try {
        if (type === "offer") {
          await pc.setRemoteDescription(msg.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          wsRef.current?.send(JSON.stringify({ type: "answer", to: from, from: selfId, sdp: answer }));
        } else {
          await pc.setRemoteDescription(msg.sdp);
        }
      } catch (err) {
        console.warn("offer/answer error", err);
      }
      return;
    }

    if (type === "candidate" && msg.to === selfId && msg.from) {
      const entry = pcsRef.current[msg.from];
      if (entry) {
        try {
          await entry.pc.addIceCandidate(msg.candidate);
        } catch (err) {
          console.warn("addIceCandidate error", err);
        }
      }
    }
  };

  const createPeer = async (peerId: string, initiator: boolean): Promise<PeerEntry | undefined> => {
    if (!localStreamRef.current) return;

    if (pcsRef.current[peerId]) return pcsRef.current[peerId];

const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

// Cast to any to assign event handlers
(pc as any).ontrack = (ev: any) => {
  const remote = ev.streams?.[0];
  if (remote) {
    pcsRef.current[peerId] = { pc, stream: remote };
    addPeerId(peerId);
  }
};

(pc as any).onicecandidate = (ev: any) => {
  if (ev.candidate) {
    wsRef.current?.send(
      JSON.stringify({ type: "candidate", to: peerId, from: selfId, candidate: ev.candidate })
    );
  }
};

(pc as any).onconnectionstatechange = () => {
  const state = pc.connectionState;
  if (state === "connected") addPeerId(peerId);
  if (["failed", "disconnected", "closed"].includes(state)) {
    pc.close();
    delete pcsRef.current[peerId];
    removePeerId(peerId);
  }
};


    pcsRef.current[peerId] = { pc, stream: null };

    if (initiator) {
      try {
        const offer = await pc.createOffer({ offerToReceiveAudio: true });
        await pc.setLocalDescription(offer);
        wsRef.current?.send(JSON.stringify({ type: "offer", to: peerId, from: selfId, sdp: offer }));
      } catch (err) {
        console.warn("createOffer error", err);
      }
    }

    return pcsRef.current[peerId];
  };

  const toggleMute = () => {
    const enabled = !muted;
    setMuted(enabled);
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !enabled));
  };

  const renderPeer = ({ item }: { item: string }) => {
    const entry = pcsRef.current[item];
    return (
      <View style={styles.peerItem}>
        <Text style={styles.peerText}>{item}</Text>
        <Text style={styles.peerState}>{entry?.pc.connectionState || "connecting"}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Intercom — {qr.meshGroup || "default"}</Text>
      <Text style={styles.subtitle}>
        You: {selfId} {isOwner ? "(Owner)" : ""} • Limit {MAX_PEERS}
      </Text>

      <TouchableOpacity style={[styles.muteBtn, muted && styles.muted]} onPress={toggleMute}>
        <Text style={styles.muteText}>{muted ? "Unmuted" : "Mute"}</Text>
      </TouchableOpacity>

      <Text style={styles.peersTitle}>Riders Connected ({peerIds.length}):</Text>
      <FlatList
        data={peerIds}
        keyExtractor={(p) => p}
        renderItem={renderPeer}
        ListEmptyComponent={<Text style={{ textAlign: "center", opacity: 0.6 }}>Waiting for riders…</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 12, textAlign: "center", marginTop: 4, opacity: 0.7 },
  muteBtn: { alignSelf: "center", marginVertical: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  muted: { backgroundColor: "#eee" },
  muteText: { fontSize: 16, fontWeight: "600" },
  peersTitle: { marginTop: 8, marginBottom: 6, fontWeight: "700" },
  peerItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  peerText: { fontSize: 14 },
  peerState: { fontSize: 12, opacity: 0.7 },
});
