import polka from "polka";
import { tinyws } from "tinyws";
import type { TinyWSRequest } from "tinyws";
import WSClient, { connect, getPeerIds } from "@notarium/adapters/WSClient";
import tree from "./src/tree";
import { parseCookie } from "@notarium/common";
import { createDataBackend } from "@notarium/data";
import { FSAdapter } from "@notarium/adapters/FSAdapter";
import { splitPath } from "@notarium/common";
import { DocumentData } from "@notarium/types";

const app = polka();
app.use(tinyws() as any);

app.get("/id", async (_, res) => {
  res.end(JSON.stringify(getPeerIds()));
});
app.get("/", async (_, res) => {
  res.end(JSON.stringify(tree.findNode()));
});

const docStore = {};
async function createDoc(docId: string) {
  if (docId in docStore) return docStore[docId];
  docStore[docId] = createDataBackend<DocumentData>(docId, FSAdapter, WSClient);
  docStore[docId].setDefault("doc");
  await docStore[docId].load();
  return docStore[docId];
}

WSClient.on("open-document", (docId: string) => createDoc(docId));

app.get("/doc", (req, res) => {
  res.end(JSON.stringify(docStore));
});

app.get("/doc/*", async (req, res) => {
  const { path } = req;
  let cleanPath = splitPath(path.replace("/doc", "")).join("/");
  const file = tree.findNode(cleanPath);
  if (!file) {
    res.statusCode = 404;
    return res.end();
  }

  const doc = await createDoc(cleanPath);

  debugger;

  res.end(JSON.stringify(doc._doc));
});

app.get("/file/*", async (req, res) => {
  const { path } = req;
  let cleanPath = splitPath(path).join("/");
  const doc = tree.findNode(cleanPath);
  if (!doc) {
    res.statusCode = 404;
    return res.end();
  }
  res.end(JSON.stringify(doc));
});

app.use("/ws", async (_req, res) => {
  const req = _req as unknown as TinyWSRequest;
  if (req.ws) {
    const cookies = req?.headers?.cookie && parseCookie(req.headers.cookie);
    const ws = await req.ws();
    return connect(ws, cookies?.["X-Authorization"]);
  } else {
    res.send("Hello from HTTP!");
  }
});

const { PORT = 3000 } = process.env;
app.listen(PORT, () => {
  console.log("Listening on " + PORT);
});
