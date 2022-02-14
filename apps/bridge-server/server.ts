import polka from "polka";
import { tinyws } from "tinyws";
import type { TinyWSRequest } from "tinyws";
import WSClient, { connect } from "@notarium/adapters/WSClient";
import { tree, createDoc, default as docStore } from "./src/docStore";
import { parseCookie } from "@notarium/common";
import { splitPath } from "@notarium/common";

const app = polka();
app.use(tinyws() as any);

app.get("/", async (_, res) => {
  res.end(JSON.stringify(tree.findNode("/")));
});

WSClient.on("doc.open", ({ docId }) => createDoc(docId));

app.get("/doc", (req, res) => {
  res.end(
    JSON.stringify([
      { id: "tree", store: tree.findNode("/") },
      ...Object.keys(docStore).map((key) => {
        return {
          id: docStore[key].docId,
          store: docStore[key].doc.getText("content").toString(),
        };
      }),
    ])
  );
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

  res.end(JSON.stringify(doc._doc));
});

app.get("/file/*", async (req, res) => {
  const { path } = req;
  let cleanPath = splitPath(path).join("/").replace("file/", "");
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
