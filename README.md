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

1. [x] P2P Messaging
2. [x] Automerge
3. [x] Connect Editor to Automerge
4. [x] Implement Data Model
   1. [x] Tree (Half implemented)
   2. [x] Document
   3. [ ] Block
5. [ ] Sync FSAdapter with DataBackend
6. [ ] Implement Document parsing
7. [ ] Sync Tree with Document, eg (document deletion);
