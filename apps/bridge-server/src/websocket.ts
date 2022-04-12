import WSClient from '@notarium/adapters/network/WSClient'
import { IncomingMessage } from 'http'
import { Duplex } from 'stream'
import WebSocket from 'ws'
import fs from "./fs"
import * as yjsDoc from './yjs-docs'
import * as yjsSignal from './yjs-signal'

const wss = new WebSocket.Server({ noServer: true })

export default (request: IncomingMessage, socket: Duplex, head: Buffer) => {

  if (request.url.startsWith("/yjs")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      const filePath = request.url.replace(/^\/yjs\//, "").replace(/^\/yjs/, "");
      console.log("new ws:yjs", { filePath })
      yjsDoc.setupWSConnection(fs, ws, filePath);
    })
  } else if (request.url.startsWith("/signal")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log("new ws:signal")
      yjsSignal.handleConnection(ws);
    })
  } else {
    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log("new ws:ws")
      WSClient.connect(ws)
    })
  }
}
