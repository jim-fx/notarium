import polka from "polka";
import fs from "./src/fs";
import type { Doc } from "yjs";
import { splitPath } from "@notarium/common";
import cors from "cors";
import handleWebsocket from "./src/websocket";

const app = polka();

app.use(cors({ origin: true }));

app.get("/", async (_, res) => {
  const f = fs.openFile("tree");
  await f.load();
  res.end(JSON.stringify((f.getData() as Doc).getMap("tree").toJSON()));
});

app.get("/api/*", async (req, res) => {

  const uriPath = decodeURIComponent(req.path);

  const cleanPath = splitPath(uriPath.replace("/api", "")).join("/");

  await fs.load();

  const file = fs.findFile(cleanPath);

  if (!file) {
    res.statusCode = 404;
    return res.end("File not found");
  }

  const f = fs.openFile(cleanPath);


  await f.load();

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  return res.end(JSON.stringify(f.toJSON()));
});


app.get("/file/*", async (req, res) => {

  const uriPath = decodeURIComponent(req.path);

  const cleanPath = splitPath(uriPath.replace("/file", "")).join("/");

  await fs.load();

  const file = fs.findFile(cleanPath);

  if (!file) {
    res.statusCode = 404;
    return res.end("File not found");
  }

  const f = fs.openFile(cleanPath);


  await f.load();

  if (f.mimetype.startsWith("text/")) {
    const text = (f.getData() as Doc).getText("content").toString();
    console.log({ text, mime: f.mimetype })
    res.end(text);
  } else {
    res.setHeader("Content-Type", file.mimetype);
    res.end(await f.getBinaryData());
  }
});


const { PORT = 3000 } = process.env;
app.listen(PORT, async () => {
  await fs.load();
  console.log("Listening on " + PORT);
});

app.server.on("upgrade", (req, socket, head) => handleWebsocket(req, socket, head))
