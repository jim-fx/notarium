import polka from "polka";
import { tinyws } from "tinyws";
import type { TinyWSRequest } from "tinyws";
import handleWebSocket from "./src/websocket";
import tree from "./src/tree";

const app = polka();
app.use(tinyws() as any);

app.get("/", async (_, res) => {
  res.end(JSON.stringify(tree.findNode()));
});

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
