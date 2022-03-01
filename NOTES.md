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

# Authorization

Each frontmatter can contain a group key, with multiple keys
Only when a user is in a group he/she can edit files

this way it is possible to create "join with url"

## Flow

## API

```ts
const authProvider = new AuthProvider({ messageAdapter, persistanceAdapter });

authProvider.addPeer(p);

const canEdit = await authProvider.isInGroup(userId, groupId);
```

##

# Better Data Structure

Add a mime type to the tree data

- Detect mime type with file content (magic numbers) or file ending?
- I chose file ending, because magic numbers are a bit wonky
- When choosing file ending you can't have folders named "index.md" or "test.som" but that's acceptable for me.

# What happens when a folder gets renamed on the serverside?

Because the docId is the path the docId then changes on all child documents
That means that if a client is offline for some while and has made some changes on a document those changes
are lost when synced

### Ideas:

- Keep a log of renames, eg. [{old: "Archive/test", new: "Archive/test2"}];

  - THen every client needs to check if there are unapplied renames and apply them to there local documents

- Don't use the document path as the docId,
  - Do not like the idea
  - Because then we need to store the id of the document alongside the document somewhere, in the frontmatter? Not every filetype has frontmatter

# Linking/Backlinking

Create links to other pages (maybe target specific sections in that page)
For this we need a way to identify specific pages

Store these informations in the [#Indexing](Index)

## How to identify specific pages

If we use the page ID, aka the path, then that does not stay persistent when moving notes

We could use a cleaned up version of the file name, and if it is `index.md` then we use the name of the parent folder

# Indexing (distributed?)

This is for back linking and searching of tags, text and stuff, maybe could also be useful for a graph visualization

## Index API

```ts
const indexManager = new IndexManager({ messageAdapter, persistanceAdapter });

indexManager.getBackLinks(docId);

indexManager.updateIndex(docId, docText);

indexManager.setIndex(docId, index);
```

## Distribution

1.  Initial index on startup
2.  When a document is opened update the index for that document every nth second (maybe 2 or 3)
    a. Broadcast that index
3.  When we receive an index, first check if that document is open, when it is, ignore it, when not update the local index for that document

## How to do updates to the index?

Optimally the index would always be up-to-date for all documents, this could be bad for performance
because then we would keep all documents open all the time and sync all changes.

Maybe this is prematurely optimized, need to do some testing how much memory that consumes

## Single Entry for single document

```json
{
  "id": "Ressources/Biology/growing/mint",
  "name": "Growing Mint",
  "family": ["Ressources", "Biology", "Growing", "Mint"],
  "keywords": ["growing", "mint", "node", "test", "test", "checklist", "items"],
  "sections": {
    "sadasd": {
      "asdsad": true
    }
  },
  "section2": [
    {
      "name": "Asdasd",
      "children": [
        {
          "name": "Whatvev",
          "depth": 1
        }
      ]
    }
  ]
}
```

## For search:

[https://www.npmjs.com/package/keyword-extractor](Extract keywords) so that we don't have to do fulltext search

# How to do the config?

We need to have a config for `authN`, `authZ`, `theming`
We need to somehow resolve the current config

## In index.md

Store the config inside the index.md

**Downsides**
If I want to configure a directory I have to add an empty index.md file

**Upsides**
Don’t have to create an extra `.config` file

### how to resolve this config

- Walk up the path until we reach the rootNode
- for each folder check if it contains a "index.md" file and parse it
- then somehow merge all the configs into one
- This config needs to react to changes in the tree (delete/add any index.md in the path)
- Also needs to react to changes in all the opened index.md's

## Naive Idea 1

- Walk up the path until we reach the rootNode
- for each folder check if it contains a ".config" file and parse it
- then somehow merge all the configs into one

## Naive Idea 2

- In the tree store keep a reference to all .config files
- Add a function to the treeFrontend / store to resolve all .config files for a single path
- Then parse and merge all those configs
