let ws: Promise<WebSocket>;
import type SimplePeer from "simple-peer";
import { EventMap } from "@notarium/types";
import ReconnectingWebSocket from "reconnecting-websocket";
import {
  createEventEmitter,
  createResolvablePromise,
  logger,
} from "@notarium/common";

const log = logger("adapt/p2p");

interface WSPeer {
  id: string;
  send(event: string, data: unknown): Promise<void>;
  requestFile(path: string): Promise<void | Uint8Array>;
  peer: SimplePeer.Instance;
}

interface RTCPeer {
  id: string;
  send(event: string, data: unknown): Promise<void>;
  requestFile(path: string): Promise<void | Uint8Array>;
  ws: WebSocket;
}

type Peer = WSPeer | RTCPeer;

const peers: Peer[] = [];

const { emit, on } = createEventEmitter<EventMap>();

const { getId, setId } = (() => {
  if (!("localStorage" in globalThis))
    return {
      getId: () => "",
      setId: (v) => { },
    };

  let _id: string;

  function getId() {
    if (_id) return _id;
    if ("p2p-id" in localStorage) {
      let id = localStorage.getItem("p2p-id");
      if (id === "undefined" || id === "null") {
        localStorage.removeItem("p2p-id");
        return undefined;
      }
      _id = id;
      return id;
    }
  }

  function setId(id: string) {
    _id = id;
    id && localStorage.setItem("p2p-id", id);
  }
  return { getId, setId };
})();

function removePeer(peerId: string) {
  const index = peers.findIndex((p) => p.id === peerId);
  if (index !== -1) {
    peers.splice(index, 1);
  }
  emit("disconnect", peerId);
}

export { on, getId };

function connectToPeer(
  id: string,
  signal?: SimplePeer.SignalData
): SimplePeer.Instance {
  const peer = new SimplePeer({
    initiator: !signal,
  }) as unknown as SimplePeer.Instance;

  const [connected, setConnected] = createResolvablePromise();

  async function send(type: string, data: unknown) {
    await connected;
    if (peer.connected) {
      peer.send(JSON.stringify({ type, data }));
    }
  }

  async function requestFile(path: string) {
    console.log("RequestFile", path);
  }

  peers.push({ peer, id, requestFile, send });

  if (signal) {
    peer.signal(signal);
  }

  peer.on("signal", async (signal) => {
    (await ws).send(
      JSON.stringify({
        type: "p2p-signal",
        data: { id, signal },
      })
    );
  });

  peer.on("error", (err) => console.error(err));
  peer.on("connect", () => {
    log("connected to ", { id });
    // peer.send(JSON.stringify({ type: "connect", data: "hello" }));
    emit("connect", id);
    setConnected();
  });

  peer.on("close", () => removePeer(id));

  peer.on("data", (d) => handleMessage(d.toString(), id));

  return peer;
}

function parse(msg: string | object) {
  try {
    return typeof msg === "string" ? JSON.parse(msg) : msg;
  } catch (error) {
    log.error(error);
  }
}

async function handleMessage(msg: string, peerId?: string) {
  const { type, data } = parse(msg);

  log("received " + type + " from " + peerId, { type, peerId, data });

  if (type === "p2p-id") {
    setId(data);
  }

  if (type === "p2p-signal") {
    const { signal, id } = data;
    if (signal.type === "offer") {
      connectToPeer(id, signal);
    } else {
      let { peer } = peers.find((p) => p.id === id) || {};
      if (peer) {
        peer.signal(signal);
      } else {
        log.warn("missing peer");
      }
    }
  }

  if (type === "p2p-disconnect") {
    peerId && removePeer(peerId);
  }

  if (type === "p2p-peer-ids") {
    const peerIds = data as unknown as string[];

    peerIds.map(async (_peerId) => {
      connectToPeer(_peerId);
    });
  }

  emit(type, data, { peerId });
}

export async function connect(url: string) {
  let server = url;

  server = server.replace("/ws", "");
  if (server.startsWith("ws://")) {
    server = server.replace("ws://", "http://");
  } else if (server.startsWith("wss://")) {
    server = server.replace("wss://", "https://");
  }

  const id = getId();


  document.cookie = "X-Authorization=" + id + "; path=/; SameSite=Strict;";
  const _ws = new ReconnectingWebSocket(url + "/ws");
  document.cookie = "";

  _ws.onerror = ({ error }) => {
    log.error(error);
  };


  ws = new Promise((res) => {
    _ws.onopen = () => {
      log("opened");
      res(_ws as unknown as WebSocket);
    };
  });

  _ws.onmessage = (msg) => {
    handleMessage(msg.data, "server");
  };

  async function send(type: string, data: unknown) {
    (await ws).send(JSON.stringify({ type, data }));
  }

  async function requestFile(path: string) {
    const res = await fetch(server + "/file/" + path + "?nosw");
    if (!res.ok) return;
    return res.arrayBuffer();
  }

  peers.push({
    id: "server",
    send,
    requestFile,
    ws: _ws as unknown as WebSocket,
  });
}

export async function requestFile(path: string) {
  return Promise.race(peers.map((p) => p.requestFile(path)));
}

export const broadcast: typeof emit = async (type: string, data: unknown) => {
  log("broadcast", { type, data });
  peers.forEach((p) => p.send(type, data));
};

export async function sendTo(id: string, type: string, data: unknown) {
  const p = peers.find((p) => p.id === id);
  if (p) {
    p.send(type, data);
  }
}

export default {
  sendTo,
  on,
  getId,
  broadcast,
  connect,
};
