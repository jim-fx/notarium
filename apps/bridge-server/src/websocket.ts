import { nanoid } from "nanoid";
import type WebSocket from "ws";
let connections: {
  id: string;
  ws: WebSocket;
}[] = [];
const callbacks: Record<string, ((data: unknown, peerId?: string) => void)[]> =
  {};

function emit(eventType: string, data?: unknown, peerId?: string) {
  if (eventType in callbacks) {
    callbacks[eventType].forEach((cb) => cb(data, peerId));
  }
}
export function sendTo(peerId: string, eventType: string, data: unknown) {
  const peer = connections.find((c) => c.id === peerId);
  // console.log("wss::sendto", eventType, peerId);
  if (peer) {
    peer.ws.send(JSON.stringify({ type: eventType, data }));
  } else {
    console.log("[ws] cant send to ", peerId);
  }
}

export function broadcast(eventType: string, data: unknown) {
  getPeerIds().forEach((peerId) => sendTo(peerId, eventType, data));
}

export function on(
  event: string,
  cb: (data: unknown, peerId?: string) => void
): () => void {
  callbacks[event] = event in callbacks ? [...callbacks[event], cb] : [cb];
  return () => {
    callbacks[event] = callbacks[event].filter((c) => c !== cb);
  };
}

export function getPeerIds() {
  return connections.map((p) => p.id);
}

export function getConnectionIds() {
  return connections.map((c) => c.id);
}

export default function handleWebSocket(ws: WebSocket, id = nanoid()) {
  console.log("[ws] new connection", id);
  const localConnection = {
    id,
    ws,
  };

  connections.push(localConnection);

  ws.on("message", (_msg) => {
    const msg = _msg.toString("utf-8");

    const { type, data } = JSON.parse(msg);

    console.log("[ws] handleMessage ", type);

    // Request to connect to other peer over p2p
    if (type === "p2p-signal") {
      const { id: _id, signal } = data;
      const partner = connections.find((v) => v.id === _id);
      if (partner) {
        partner.ws.send(
          JSON.stringify({ type: "p2p-signal", data: { id, signal } })
        );
      }
    }

    if (type in callbacks) {
      callbacks[type].forEach((cb) => cb(data, id));
    }
  });

  ws.on("close", () => {
    connections = connections.filter((c) => c.id !== id);
    connections.forEach(({ ws: _ws }) =>
      _ws.send(JSON.stringify({ type: "p2p-disconnect", data: id }))
    );
  });

  // New Client connects, so we need to tell him whom to say hello to
  // And we delay it a bit to give the client the chance to change its id
  emit("connect", id);

  ws.send(
    JSON.stringify({
      type: "p2p-id",
      data: id,
    })
  );
  ws.send(
    JSON.stringify({
      type: "p2p-peer-ids",
      data: connections.map((v) => v.id).filter((_id) => _id !== id),
    })
  );
}
