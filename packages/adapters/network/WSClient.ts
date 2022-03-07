import { nanoid } from "nanoid";
import type WebSocket from "ws";
import { createEventEmitter } from "@notarium/common";
let connections: {
  id: string;
  ws: WebSocket;
}[] = [];

const { on, emit } = createEventEmitter();

export const getId = () => "server";

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

export { on };

export function getPeerIds() {
  return connections.map((p) => p.id);
}

export function connect(ws: WebSocket, id = nanoid()) {
  console.log("[ws] new connection", id);

  const localConnection = {
    id,
    ws,
  };

  connections.push(localConnection);

  ws.on("message", (rawMsg: Buffer) => {
    const msg = rawMsg.toString("utf-8");

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

    emit(type, data, id);
  });

  ws.on("close", () => {
    connections = connections.filter((c) => c.id !== id);
    connections.forEach(({ ws: _ws }) =>
      _ws.send(JSON.stringify({ type: "p2p-disconnect", data: id }))
    );
  });

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

export default {
  on,
  sendTo,
  broadcast,
  getId,
  connect,
};
