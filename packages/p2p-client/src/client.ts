let ws: Promise<WebSocket>;
import type SimplePeer from "simple-peer";

const peers: { peer: SimplePeer.Instance; id: string }[] = [];
const callbacks: Record<string, ((data: unknown, peerId?: string) => void)[]> =
  {};

function connectToPeer(
  id: string,
  signal?: SimplePeer.SignalData
): SimplePeer.Instance {
  const peer = new SimplePeer({
    initiator: !signal,
  }) as unknown as SimplePeer.Instance;

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

  peer.on("error", (err) => console.log("error", err));

  peer.on("connect", () => {
    console.log("connected");
  });

  peer.on("data", (d) => {
    handleMessage(d.toString(), id);
  });

  return peer;
}

async function handleMessage(msg: string, peerId?: string) {
  try {
    const { type, data } = JSON.parse(msg);

    console.log(type, data);

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
      const index = peers.findIndex((p) => p.id === data);
      if (index !== -1) {
        peers.splice(index, 1);
      }
    }

    if (type === "p2p-peer-ids") {
      const peerIds = data as unknown as string[];

      peerIds.map(async (_peerId) => {
        connectToPeer(_peerId);
      });
    }

    if (type in callbacks) {
      callbacks[type].forEach((cb) => cb(data, peerId));
    }
  } catch (error) {
    console.log("received non json message", msg);
  }
}

export async function connectWebSocket(url: string) {
  const _ws = new WebSocket(url);

  ws = new Promise((res) => {
    _ws.onopen = () => {
      console.log("ws::open");
      res(_ws);
    };
  });

  _ws.onmessage = (msg) => {
    handleMessage(msg.data);
  };
}

export function on(event: string, cb: (data: unknown) => void): () => void {
  callbacks[event] = event in callbacks ? [...callbacks[event], cb] : [cb];
  return () => {
    callbacks[event] = callbacks[event].filter((c) => c !== cb);
  };
}

export async function send(type: string, data: unknown) {
  peers.forEach((p) => {
    p.peer.send(JSON.stringify({ type, data }));
  });
}
