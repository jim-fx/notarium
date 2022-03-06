let ws: Promise<WebSocket>;
import SimplePeer from "simple-peer";
import SimplePeerFiles from "simple-peer-files";
import { EventMap } from "@notarium/types";
import ReconnectingWebSocket from "reconnecting-websocket";
import {
  createEventEmitter,
  createResolvablePromise,
  logger,
} from "@notarium/common";

const spf = new SimplePeerFiles();

const log = logger("adapt/p2p");

interface WSPeer {
  id: string;
  type: "ws";
  send: (type: string, data: unknown) => void;
  requestFile: (docId: string) => Promise<Uint8Array | void>;
}

interface RTCPeer {
  id: string;
  type: "rtc";
  requestFile: (docId: string) => Promise<Uint8Array | void>;
  send: (type: string, data: unknown) => void;
  signal: SimplePeer.Instance["signal"];
}

const peers: (WSPeer | RTCPeer)[] = [];

const { emit, on } = createEventEmitter<EventMap>();

const { getId, setId } = (() => {
  if (!("localStorage" in globalThis))
    return {
      getId: () => "",
      setId: (v) => {},
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

export function requestFile(path: string) {
  console.log("request path", path);
}

function connectToPeer(id: string, signal?: SimplePeer.SignalData) {
  const peer = new SimplePeer({
    initiator: !signal,
  }) as unknown as SimplePeer.Instance;

  const [connected, setConnected] = createResolvablePromise();

  if (signal) {
    peer.signal(signal);
  }

  peer.on("signal", async (signal) => {
    peers.forEach((p) => {
      if (p.id === "server") {
        p.send("p2p-signal", { id, signal });
      }
    });
  });

  peer.on("error", (err) => console.error(err));
  peer.on("connect", () => {
    setConnected();
    log("connected to ", { id });
    // peer.send(JSON.stringify({ type: "connect", data: "hello" }));
    emit("connect", id);
  });

  peer.on("close", () => {
    removePeer(id);
  });

  peer.on("data", (d) => {
    log("received data");
    handleMessage(d.toString(), id);
  });

  async function send(type: string, data: unknown) {
    await connected;
    peer.send(JSON.stringify({ type, data }));
  }

  async function requestFile(docId: string) {}

  peers.push({ type: "rtc", send, id, requestFile, signal: peer.signal });
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

  log("handleMessage", { type, peerId, data });

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

  emit(type, data, peerId);
}

async function connectToServer(url: string) {
  const id = getId();

  if (id) {
    document.cookie = "X-Authorization=" + id + "; path=/; SameSite=Strict;";
  }

  const _ws = new ReconnectingWebSocket(url);

  _ws.onerror = (event) => {
    // log.error(new Error(event.message));
  };

  setTimeout(() => {
    document.cookie = "";
  });

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
    const w = await ws;
    w.send(JSON.stringify({ type, data }));
  }

  async function requestFile(docId: string) {}

  peers.push({
    id: "server",
    type: "ws",
    requestFile,
    send,
  });
}

export async function connect(url: string) {
  if (url.startsWith("ws")) {
    connectToServer(url);
  }
}

export const broadcast: typeof emit = async (type: string, data: unknown) => {
  peers.forEach((p) => {
    p.send(type, data);
  });
};

function sendFileTo(peerId: string, docId: string, file: Uint8Array) {
  const p = peers.find((p) => p.id === peerId);
  // peer is the SimplePeer object connection to receiver
  spf.send(p, docId, file).then((transfer) => {
    transfer.on("progress", (sentBytes) => {
      console.log(sentBytes);
    });
    transfer.start();
  });
}

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
