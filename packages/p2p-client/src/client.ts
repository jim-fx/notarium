let ws: Promise<WebSocket>;
import type Peer from "simple-peer";

const peers: { peer: Peer.Instance; id: string }[] = [];
const callbacks: Record<string, ((data: unknown, peerId?: string) => void)[]> =
  {};

function getId() {
  if ("p2p-id" in localStorage) {
    let id = localStorage.getItem("p2p-id");
    if (id === "undefined" || id === "null") {
      localStorage.removeItem("p2p-id");
      return undefined;
    }
    return id;
  }
}

function removePeer(peerId: string) {
  const index = peers.findIndex((p) => p.id === peerId);
  if (index !== -1) {
    peers.splice(index, 1);
  }
  emit("disconnect", peerId);
}

function setId(id: string) {
  id && localStorage.setItem("p2p-id", id);
}

function emit(eventType: string, data?: unknown, peerId?: string) {
  if (eventType in callbacks) {
    callbacks[eventType].forEach((cb) => cb(data, peerId));
  }
}

function connectToPeer(id: string, signal?: Peer.SignalData): Peer.Instance {
  console.log("connect to peer", id);

  const peer = new SimplePeer({
    initiator: !signal,
  }) as unknown as Peer.Instance;

  peers.push({ peer, id });

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
    console.log("[p2p/wrtc] connected to ", id);
    // peer.send(JSON.stringify({ type: "connect", data: "hello" }));
    emit("connect", id);
  });

  peer.on("close", () => {
    removePeer(id);
  });

  peer.on("data", (d) => {
    console.log("p2p::received data");
    handleMessage(d.toString(), id);
  });

  return peer;
}

function parse(msg: string | object) {
  try {
    return typeof msg === "string" ? JSON.parse(msg) : msg;
  } catch (error) {
    console.error(error);
    console.log("received non json message", msg);
  }
}

async function handleMessage(msg: string, peerId?: string) {
  const { type, data } = parse(msg);

  console.groupCollapsed("[p2p] handleMessage ", type);
  console.log(peerId);
  console.log(data);
  console.groupEnd();

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
        console.log("missing peer");
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

export function getPeerIds() {
  return [...peers.map((p) => p.id), "server"];
}

export async function connectWebSocket(url: string) {
  const id = getId();

  if (id) {
    document.cookie = "X-Authorization=" + id + "; path=/; SameSite=Strict;";
  }

  const _ws = new WebSocket(url);

  setTimeout(() => {
    document.cookie = "";
  });

  ws = new Promise((res) => {
    _ws.onopen = () => {
      console.log("[p2p/ws] opened");
      res(_ws);
    };
  });

  _ws.onmessage = (msg) => {
    handleMessage(msg.data, "server");
  };
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

export async function sendToServer(eventType: string, data?: unknown) {
  (await ws).send(JSON.stringify({ type: eventType, data }));
}

export async function broadcast(type: string, data: unknown) {
  const msg = JSON.stringify({ type, data });
  peers.forEach((p) => {
    if (p.peer.connected) {
      p.peer.send(msg);
    }
  });
  (await ws).send(msg);
}

export async function sendTo(id: string, type: string, data: unknown) {
  if (id === "server") {
    return sendToServer(type, data);
  }

  const p = peers.find((p) => p.id === id);
  if (p && p.peer.connected) {
    p.peer.send(JSON.stringify({ type, data }));
  }
}
