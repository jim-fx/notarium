import polka from "polka";
import { tinyws } from "tinyws";
import type { TinyWSRequest } from "tinyws";
import { connect } from "@notarium/adapters/network/WSClient";
import fs from "./src/fs";
import { Doc } from "yjs";
import { parseCookie, splitPath } from "@notarium/common";
import cors from "cors";

const app = polka();
app.use(tinyws() as any);

app.use(cors({ origin: true }));

app.get("/", async (_, res) => {
  const f = fs.openFile("tree");
  await f.load();
  res.end(JSON.stringify((f.getData() as Doc).getMap("tree").toJSON()));
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

app.get("/file/*", async (req, res) => {
  const { path } = req;

  const uriPath = decodeURIComponent(path);

  let cleanPath = splitPath(uriPath.replace("/file", "")).join("/");

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
  } else {
    res.setHeader("Content-Type", file.mimetype);
    res.end(await f.getBinaryData());
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
