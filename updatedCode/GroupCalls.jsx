// screens/GroupCall.jsx
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
import {
  RTCPeerConnection,
  mediaDevices,
  RTCView,
} from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";

/**
 * GroupCall.jsx
 * Full-mesh audio intercom (up to 6 riders)
 *
 * Props:
 *  - route.params.qr: { signaling: 'ws://<IP>:<PORT>', meshGroup: 'team123', maxPeers?: number }
 *  - route.params.isOwner: boolean
 *
 * Make sure your signaling server implements:
 *  - join: { type: 'join', group, id }
 *  - peers: { type: 'peers', peers: [id,...] }
 *  - messages with to/from fields for offer/answer/candidate relaying
 *
 * NOTE: audio in RN WebRTC plays automatically; use headsets to avoid echo.
 */

const SIGNALING_URL_FALLBACK = "ws://192.168.43.1:8080"; // replace if needed

export default function GroupCall({ route }) {
  const qr = (route && route.params && route.params.qr) || {};
  const isOwner = route?.params?.isOwner ?? false;
  const SIGNALING_URL = qr.signaling || SIGNALING_URL_FALLBACK;
  const MAX_PEERS = qr.maxPeers || 6;

  const selfId = useMemo(() => (route?.params?.selfId) || ("rider-" + Math.random().toString(36).slice(2)), []);
  const [muted, setMuted] = useState(false);
  const [peerIds, setPeerIds] = useState([]); // list of connected peer ids
  const pcsRef = useRef({}); // id -> { pc, stream }  (pc is RTCPeerConnection)
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);

  // helper: update peer list state
  const addPeerId = (id) => setPeerIds((p) => (p.includes(id) ? p : [...p, id]));
  const removePeerId = (id) => setPeerIds((p) => p.filter((pid) => pid !== id));

  // Request Android audio permission
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        // proceed anyway; user may still grant from dialog
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

        // get local mic stream
        const stream = await mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;

        // audio routing
        InCallManager.start({ media: "audio" });
        InCallManager.setForceSpeakerphoneOn(true);

        // connect signaling
        const ws = new WebSocket(SIGNALING_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          // join group
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

        ws.onerror = (e) => {
          console.warn("WS error", e);
        };

        ws.onclose = () => {
          // closed
        };
      } catch (err) {
        Alert.alert("Error", "Failed to initialize audio or signaling: " + String(err));
      }
    })();

    return () => {
      mounted = false;
      // cleanup
      InCallManager.stop();
      for (const id of Object.keys(pcsRef.current)) {
        try {
          pcsRef.current[id].pc.close();
        } catch {}
      }
      wsRef.current?.close();
      try {
        localStreamRef.current?.getTracks?.().forEach((t) => t.stop());
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle incoming signaling messages
  const handleSignal = async (msg) => {
    if (!msg || typeof msg !== "object") return;

    const type = msg.type;

    if (type === "peers") {
      // got peer list; connect to existing peers (excluding self)
      const peers = (msg.peers || []).filter((p) => p !== selfId);
      // enforce max
      if (peers.length + 1 > MAX_PEERS) {
        Alert.alert("Team Full", `This mesh supports up to ${MAX_PEERS} riders.`);
      }
      // start connections to first N peers (space = MAX-1)
      const space = Math.max(0, MAX_PEERS - 1);
      for (const pid of peers.slice(0, space)) {
        if (pid === selfId) continue;
        if (!pcsRef.current[pid]) {
          await createPeer(pid, true); // initiator
        }
      }
      return;
    }

    if (type === "new-peer") {
      const pid = msg.id;
      if (pid === selfId) return;
      // if we have capacity, connect
      if (Object.keys(pcsRef.current).length < MAX_PEERS - 1) {
        await createPeer(pid, true);
      } else {
        // ignore extra peers
        console.log("Ignoring new peer (capacity)", pid);
      }
      return;
    }

    if (type === "peer-left") {
      const pid = msg.id;
      if (pcsRef.current[pid]) {
        try { pcsRef.current[pid].pc.close(); } catch {}
        delete pcsRef.current[pid];
        removePeerId(pid);
      }
      return;
    }

    // For offer/answer/candidate, msg should contain to/from
    if ((type === "offer" || type === "answer") && msg.to && msg.to === selfId && msg.from) {
      const from = msg.from;
      // Ensure pc exists
      if (!pcsRef.current[from]) {
        await createPeer(from, false); // not initiator (we will answer)
      }
      const entry = pcsRef.current[from];
      const pc = entry.pc;
      try {
        if (type === "offer") {
          // set remote offer
          await pc.setRemoteDescription(msg.sdp);
          // create answer
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          // send answer back
          wsRef.current?.send(JSON.stringify({ type: "answer", to: from, from: selfId, sdp: answer }));
        } else {
          // answer
          await pc.setRemoteDescription(msg.sdp);
        }
      } catch (err) {
        console.warn("offer/answer handling error", err);
      }
      return;
    }

    if (type === "candidate" && msg.to && msg.to === selfId && msg.from) {
      const from = msg.from;
      const entry = pcsRef.current[from];
      if (entry) {
        try {
          await entry.pc.addIceCandidate(msg.candidate);
        } catch (err) {
          console.warn("addIceCandidate error", err);
        }
      }
      return;
    }
  };

  // createPeer creates pc, wires events; if initiator=true it will createOffer and send it
  const createPeer = async (peerId, initiator) => {
    if (!localStreamRef.current) {
      console.warn("Local stream not ready yet");
      return;
    }
    if (pcsRef.current[peerId]) return pcsRef.current[peerId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // add local tracks
    try {
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current));
    } catch (err) {
      console.warn("addTrack error", err);
    }

    // remote stream handler
    pc.ontrack = (ev) => {
      const remote = ev.streams && ev.streams[0];
      if (remote) {
        // store stream for potential rendering; audio plays automatically
        pcsRef.current[peerId] = { pc, stream: remote };
        addPeerId(peerId);
      }
    };

    // ICE candidate handler
    pc.onicecandidate = (ev) => {
      const candidate = ev?.candidate;
      if (candidate) {
        wsRef.current?.send(JSON.stringify({ type: "candidate", to: peerId, from: selfId, candidate }));
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        addPeerId(peerId);
      }
      if (state === "failed" || state === "disconnected" || state === "closed") {
        try { pc.close(); } catch {}
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

  // mute / unmute
  const toggleMute = () => {
    const enabled = !muted;
    setMuted(enabled);
    try {
      localStreamRef.current?.getAudioTracks?.().forEach((t) => (t.enabled = !enabled));
    } catch (e) {}
  };

  // render one remote stream item
  const renderPeer = ({ item }) => {
    const entry = pcsRef.current[item];
    // audio streams don't require RTCView; we could show RTCView if there was video
    return (
      <View style={styles.peerItem}>
        <Text style={styles.peerText}>{item}</Text>
        <Text style={styles.peerState}>
          {(entry && entry.pc && entry.pc.connectionState) || "connecting"}
        </Text>
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
  muteBtn: {
    alignSelf: "center",
    marginVertical: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  muted: { backgroundColor: "#eee" },
  muteText: { fontSize: 16, fontWeight: "600" },
  peersTitle: { marginTop: 8, marginBottom: 6, fontWeight: "700" },
  peerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
  },
  peerText: { fontSize: 14 },
  peerState: { fontSize: 12, opacity: 0.7 },
});
