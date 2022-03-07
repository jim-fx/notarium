import { nanoid } from "nanoid";
import type WebSocket from "ws";
import { createEventEmitter } from "@notarium/common";
const connections: {
  id: string;
  ws: WebSocket;
}[] = [];

globalThis["connections"] = connections;

const { on, emit } = createEventEmitter();

export const getId = () => "server";

export function sendTo(peerId: string, eventType: string, data: unknown) {
  connections.forEach((c) => {
    if (c.id === peerId) {
      c.ws.send(JSON.stringify({ type: eventType, data }));
    }
  });
}

export function broadcast(eventType: string, data: unknown) {
  getPeerIds().forEach((peerId) => sendTo(peerId, eventType, data));
}

export { on };

export function requestFile(path: string) {
  console.log("request file", { path });
}

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

  ws.on("message", (rawMsg: Buffer, isBinary: boolean) => {
    if (isBinary) {
      console.log("received binary msg", rawMsg);
      return;
    }

    const msg = rawMsg.toString("utf-8");

    const { type, data } = JSON.parse(msg);

    console.log("[ws] handleMessage ", type);

    // Request to connect to other peer over p2p
    if (type === "p2p-signal") {
      const { id: _id, signal } = data;
      const partner = connections.find((v) => v.id === _id);
      if (partner) {
        partner.ws.send(
          JSON.stringify({ type: "p2p-signal", data: { id: _id, signal } })
        );
      } else {
        console.log("cant find partner");
      }
    }

    emit(type, data, { peerId: id });
  });

  ws.on("close", () => {
    const index = connections.findIndex((c) => c.id === id);
    connections.splice(index, 1);
    // connections.forEach(({ ws: _ws }) =>
    //   _ws.send(JSON.stringify({ type: "p2p-disconnect", data: id }))
    // );
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
  requestFile,
  getId,
  connect,
};
