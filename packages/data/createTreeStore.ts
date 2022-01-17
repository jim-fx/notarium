import { Readable, readable } from "svelte/store";
import { IDataBackend, TreeData } from "@notarium/types";

export function createTreeStore(
  backend: IDataBackend<TreeData>
): Readable<TreeData> {
  return readable(backend._doc || {}, function start(set) {
    return backend._addSubscriber({
      handle: (evenType: string, data: unknown | TreeData) => {
        if (evenType === "data") {
          console.log("[adapt/store] update content");
          set(data as TreeData);
        }
      },
    });
  });
}
