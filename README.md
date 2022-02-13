# Notarium

<div align="center">

<img src="apps/editor/static/favicon.svg" width="30%"/>

<a href="https://notes.jim-fx.com/"><h2 align="center">Notarium</h2></a>

  <p align="center">
		Notarium is a selfhosted note taking app.
	</p>
</div>

# Table of contents

- [What is Notarium](#WhatIsNotarium?)
- [Architecture](#Architecture)
- [Developing](#Developing)
- [Roadmap](#Roadmap)

# What is Notarium?

Notarium is a note taking and organizing application which uses a folder as a database. Because of this you can easily use a third party program like syncthing to keep your notes synchronised across all your devices.

# Architecture

See [Architecture.md](./ARCHITECTURE.md)

# Developing

### Install prerequesits:

- Node.js
- pnpm

### Install dependancies

```bash
$ pnpm i -r
```

### Start the dev server

```bash
$ pnpm dev
```

# TODO

- [x] P2P Messaging
- [x] Automerge
- [x] Connect Editor to Automerge
- [x] Implement Data Model
  1.  [x] Tree (Half implemented)
  2.  [x] Document
- [-] Sync FSAdapter with DataBackend
  - Not completely done, need better syncing in fs adapter
- [x] Replace Automerge with yjs
- [x] Add mimetype to treeData
- [x] Implement Document parsing
- [x] Offline Mode (eg, button to download all documents);
  - Still need save the "I am in offline mode" in localStorage
- [ ] Sync Tree with Document, eg (document deletion);
- [ ] Context Loading, for a certain path check if there is a .config file or a .theme file in the directory
- [ ] Authentication / Authorization, okay p2p auth seems hard
- [ ] Theming Support
