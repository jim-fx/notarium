import polka from "polka";
import { tinyws } from "tinyws";
import type { TinyWSRequest } from "tinyws";
import handleWebSocket from "./src/websocket";
import { getConnectionIds } from "./src/websocket";
import tree from "./src/tree";

const parseCookie = (str: string) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

const app = polka();
app.use(tinyws() as any);

app.get("/id", async (_, res) => {
  res.end(JSON.stringify(getConnectionIds()));
});
app.get("/", async (_, res) => {
  res.end(JSON.stringify(tree.findNode()));
});

app.use("/ws", async (_req, res) => {
  const req = _req as unknown as TinyWSRequest;
  if (req.ws) {
    const cookies = req?.headers?.cookie && parseCookie(req.headers.cookie);
    const ws = await req.ws();
    return handleWebSocket(ws, cookies?.["X-Authorization"]);
  } else {
    res.send("Hello from HTTP!");
  }
});

const { PORT = 3000 } = process.env;
app.listen(PORT, () => {
  console.log("Listening on " + PORT);
});
