import { FileSystem } from '@notarium/fs';
import { decoding, encoding } from "lib0";
import { CONNECTING, OPEN, WebSocket } from "ws";
import * as awarenessProtocol from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import * as Y from 'yjs';

const docs: Map<string, WSSharedDoc> = new Map()

export { docs };

const messageSync = 0
const messageAwareness = 1
// const messageAuth = 2

const updateHandler = (update: Uint8Array, origin: any, doc: WSSharedDoc) => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  doc.conns.forEach((_, conn) => send(doc, conn, message))
}

class WSSharedDoc {
  name: string
  conns: Map<WebSocket, Set<number>>
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness

  constructor(doc: Y.Doc) {
    this.doc = doc;
    this.conns = new Map()
    this.awareness = new awarenessProtocol.Awareness(doc)
    this.awareness.setLocalState(null)

    const awarenessChangeHandler = ({ added, updated, removed }: { added: Array<number>; updated: Array<number>; removed: Array<number> }, conn: WebSocket): void => {
      const changedClients = added.concat(updated, removed)
      if (conn !== null) {
        const connControlledIDs = /** @type {Set<number>} */ (this.conns.get(conn))
        if (connControlledIDs !== undefined) {
          added.forEach(clientID => { connControlledIDs.add(clientID) })
          removed.forEach(clientID => { connControlledIDs.delete(clientID) })
        }
      }
      // broadcast awareness update
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients))
      const buff = encoding.toUint8Array(encoder)
      this.conns.forEach((_, c) => {
        send(this, c, buff)
      })
    }
    this.awareness.on('update', awarenessChangeHandler)
    this.doc.on('update', (update, origin) => updateHandler(update, origin, this))

  }
}


const handleMessage = (conn: WebSocket, doc: WSSharedDoc, message: Uint8Array) => {
  try {
    const encoder = encoding.createEncoder()
    const decoder = decoding.createDecoder(message)
    const messageType = decoding.readVarUint(decoder)
    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.readSyncMessage(decoder, encoder, doc.doc, null)
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder))
        }
        break
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn)
        break
      }
    }
  } catch (err) {
    console.error(err)
    doc.doc.emit('error', [err])
  }
}


const closeConn = (doc: WSSharedDoc, conn: WebSocket) => {
  if (doc.conns.has(conn)) {

    const controlledIds: Set<number> = doc.conns.get(conn)
    doc.conns.delete(conn)
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null)

  }
  conn.close()
}


const send = (doc: WSSharedDoc, conn: WebSocket, m: Uint8Array) => {
  if (conn.readyState !== CONNECTING && conn.readyState !== OPEN) {
    closeConn(doc, conn)
  }
  try {
    conn.send(m, (err?: Error) => { err != null && closeConn(doc, conn) })
  } catch (e) {
    closeConn(doc, conn)
  }
}

const pingTimeout = 30000


export const setupWSConnection = async (fs: FileSystem, conn: WebSocket, docName: string) => {

  await fs.isLoaded;

  const file = fs.openFile(docName);
  await file.load()

  const doc = file.getData() as Y.Doc;

  const wrapped = new WSSharedDoc(doc);

  conn.binaryType = 'arraybuffer'
  wrapped.conns.set(conn, new Set())
  // listen and reply to events
  conn.on('message', (message: ArrayBuffer) => handleMessage(conn, wrapped, new Uint8Array(message)))

  // Check if connection is still alive
  let pongReceived = true
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (wrapped.conns.has(conn)) {
        closeConn(wrapped, conn)
      }
      clearInterval(pingInterval)
    } else if (wrapped.conns.has(conn)) {
      pongReceived = false
      try {
        conn.ping()
      } catch (e) {
        closeConn(wrapped, conn)
        clearInterval(pingInterval)
      }
    }
  }, pingTimeout)
  conn.on('close', () => {
    closeConn(wrapped, conn)
    clearInterval(pingInterval)
  })
  conn.on('pong', () => {
    pongReceived = true
  })
  // put the following in a variables in a block so the interval handlers don't keep in in
  // scope
  {
    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, doc)
    send(wrapped, conn, encoding.toUint8Array(encoder))
    const awarenessStates = wrapped.awareness.getStates()
    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(wrapped.awareness, Array.from(awarenessStates.keys())))
      send(wrapped, conn, encoding.toUint8Array(encoder))
    }
  }
}


