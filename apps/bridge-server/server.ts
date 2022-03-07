import polka from "polka";
import { tinyws } from "tinyws";
import type { TinyWSRequest } from "tinyws";
import WSClient, { connect } from "@notarium/adapters/network/WSClient";
import fs from "./src/fs";
import { parseCookie, splitPath } from "@notarium/common";

const app = polka();
app.use(tinyws() as any);

app.get("/", async (_, res) => {
  const f = fs.openFile("tree");
  await f.load();
  res.end(JSON.stringify(f.getData().getMap("tree").toJSON()));
});

// WSClient.on("file.request", createFile);

// app.get("/doc", (req, res) => {
//   res.end(
//     JSON.stringify([
//       { id: "tree", store: tree.findNode("/") },
//       ...Object.keys(docStore).map((key) => {
//         return {
//           id: docStore[key].docId,
//           store: docStore[key].doc.getText("content").toString(),
//         };
//       }),
//     ])
//   );
// });

app.get("/doc/*", async (req, res) => {
  const { path } = req;

  const uriPath = decodeURIComponent(path);

  let cleanPath = splitPath(uriPath.replace("/doc", "")).join("/");

  console.log(cleanPath);

  await fs.load();

  const file = fs.findFile(cleanPath);

  if (!file) {
    res.statusCode = 404;
    return res.end("File not found");
  }

  const f = fs.openFile(cleanPath);

  await f.load();

  if (f.mimetype.startsWith("text/")) {
    const text = f.getData().getText("content").toString();
    res.end(text);
  }
});

app.get("/ids", (req, res) => {
  res.end(JSON.stringify(globalThis["connections"].map((v) => v.id)));
});

// app.get("/file/*", async (req, res) => {
//   const { path } = req;
//   let cleanPath = splitPath(path).join("/").replace("file/", "");
//   const doc = tree.findNode(cleanPath);
//   if (!doc) {
//     res.statusCode = 404;
//     return res.end();
//   }
//   res.end(JSON.stringify(doc));
// });

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
  fs.load();
  console.log("Listening on " + PORT);
});
