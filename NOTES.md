# Refactoring Ideas

# Opening Documents Pseudocode

## ClientSide

```typescript
const path = documentPath;

const doc = createNewDocument(path, persistanceAdapter, syncAdapter);

const store = createSvelteStore(doc);

function setText(v: string) {
  doc.setText(v);
}
```

## ServerSide

```typescript
const openDocuments = [];

ws.on("p2p-open-document", (docId, peerId) => {
  const path = docId;
  const doc = createNewDocument(path, persistanceAdapter, syncAdapter);
});

ws.on("p2p-sync-document", (docId, syncMessage) => {});
```

## Adapters Pseudocode

```typescript
const treeBackend = createDataBackend("tree", persistanceAdapter, syncAdapter);

const treeStore = createTreeStore(treeBackend);
const tree = createTree(dataBackend);

const documentBackend = createDataBackend(
  "test/archive/someshit",
  IDBAdapter,
  p2p
);

const documentStore = createDocumentStore(documentBackend);
const document = createDocument(documentBackend);

function onClose() {
  tree.close();
  document.close();
}
```

```dataBackend

const syncStates = {};
const documents = {};

const syncAdapter = ...;
const persistanceAdapter = ...;

function update(docId, cb){
  const [newDoc, changes] = Frontend.change(document, cb);
  persistanceAdapter.saveDocument(docId, newDoc);
  syncAdapter.sendToPeers();
}

function getDocument(docId){
  const doc = persistanceAdapter.getDocument(docId);
  if(!doc) // initiate getting doc from network;
  documents[docId] = doc;
}

function close(){

}

```
