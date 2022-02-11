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

# Authentication Ideas

## Hash Based

- SENDING: Hash {docId, userName} during sending with a salt, the salt is the password
- RECEIVING: Hash the {docId, userName} with the password, and then check if the hashes match

This way the password doesn't go over the wire.

## Public Private Key

In the .config file is a list of public keys from which updates are accepted

There is also a password that allows to add public keys to that config file

The server does not accept updates to this .config file, only through the fs adapter

### How to store

_.config file_

```json
{
  "password": "this-is-a-very-secure-password-not",
  "max_authorized_users": 20,
  "authorized_keys": ["po8nhinhhzvtdizagsdn278nasdasdon28m0m9p user@machine"]
}
```

## Better Data Structure

Add a mimetype to the treedata

## What happens when a folder gets renamed on the serverside?

Because the docId is the path the docId then changes on all child documents
That means that if a client is offline for some while and has made some changes on a document those changes
are lost when synced

### Ideas:

- Keep a log of renames, eg. [{old: "Archive/test", new: "Archive/test2"}];

  - THen every client needs to check if there are unapplied renames and apply them to there local documents

- Don't use the document path as the docId,
  - Do not like the idea
  - Because then we need to store the id of the document alongside the document somewhere, in the frontmatter? Not every filetype has frontmatter

## Distributed Indexing
