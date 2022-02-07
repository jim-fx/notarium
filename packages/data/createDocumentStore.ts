import { Readable, readable } from "svelte/store";
import { IDataBackend, DocumentData } from "@notarium/types";

export function createDocumentStore(
  backend: IDataBackend<DocumentData>
): Readable<DocumentData> {
  return readable(backend?._doc || ({} as DocumentData), function start(set) {
    return backend._addSubscriber({
      handle: (evenType: string, data: DocumentData) => {
        if (evenType === "data") {
          console.log("[adapt/store] update content");
          set(data);
        }
      },
    });
  });
}
