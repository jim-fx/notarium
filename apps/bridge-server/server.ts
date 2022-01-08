import polka from "polka";
import { tinyws } from "tinyws";
import type { TinyWSRequest } from "tinyws";
import { nanoid } from "nanoid";

let connections: {
  id: string;
  ws: Awaited<ReturnType<TinyWSRequest["ws"]>>;
}[] = [];

const app = polka();
app.use(tinyws() as any);

app.get("/", async (req, res) => {
  res.end("Wooorks");
});

function handleWebSocket(ws: Awaited<ReturnType<TinyWSRequest["ws"]>>) {
  let id = nanoid();

  let hasChangedID = false;

  const localConnection = {
    id,
    ws,
  };

  connections.push(localConnection);

  ws.on("message", (_msg) => {
    const msg = _msg.toString("utf-8");

    const { type, data } = JSON.parse(msg);

    if (type === "p2p-id") {
      id = data;
      hasChangedID = true;
      localConnection.id = id;
    }

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
  });

  ws.on("close", () => {
    connections = connections.filter((c) => c.id !== id);
    connections.forEach(({ ws: _ws }) =>
      _ws.send(JSON.stringify({ type: "p2p-disconnect", data: id }))
    );
  });

  // New Client connects, so we need to tell him whom to say hello to
  // And we delay it a bit to give the client the chance to change its id
  setTimeout(() => {
    if (!hasChangedID) {
      ws.send(
        JSON.stringify({
          type: "p2p-id",
          data: id,
        })
      );
    }
    ws.send(
      JSON.stringify({
        type: "p2p-peer-ids",
        data: connections.map((v) => v.id).filter((_id) => _id !== id),
      })
    );
  }, 100);
}

app.use("/ws", async (_req, res) => {
  const req = _req as unknown as TinyWSRequest;
  if (req.ws) {
    const ws = await req.ws();

    return handleWebSocket(ws);
  } else {
    res.send("Hello from HTTP!");
  }
});

const { PORT = 3000 } = process.env;
app.listen(PORT, () => {
  console.log("Listening on " + PORT);
});
