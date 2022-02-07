import * as Y from "yjs";
import { IMessageAdapter } from "@notarium/types";
import { Observable } from "lib0/observable";

export default class Provider extends Observable<string> {
  constructor(ydoc: Y.Doc, messageProvider: IMessageAdapter) {
    super();

    const id = messageProvider.getId();

    ydoc.on("update", (update: any, originId: string) => {
      // ignore updates applied by this provider
      if (originId !== id) {
        // this update was produced either locally or by another provider.
        this.emit("update", [update]);
      }
    });

    // listen to an event that fires when a remote update is received
    this.on("update", (update: Uint8Array) => {
      Y.applyUpdate(ydoc, update, id); // the third parameter sets the transaction-origin
    });
  }
}
