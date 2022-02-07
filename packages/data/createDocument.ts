import DiffMatchPatch from "diff-match-patch";
import { IDataBackend, DocumentData } from "@notarium/types";

export function createDocument(backend: IDataBackend<DocumentData>) {
  const dmp = new DiffMatchPatch();

  let timeout;
  let lastExecution = 0;

  async function setText(t: string) {
    if (timeout) clearTimeout(timeout);
    const now = Date.now();
    if (now - lastExecution < 2000) {
      await new Promise((res) => {
        timeout = setTimeout(res, 500);
      });
    } else {
      lastExecution = now;
    }

    const currentContent = backend._doc.content.toString();

    // Compute the diff:
    const diff = dmp.diff_main(currentContent, t);

    // This cleans up the diff so that the diff is more human friendly.
    dmp.diff_cleanupSemantic(diff);

    const patches = dmp.patch_make(currentContent, diff);

    backend.update((doc: DocumentData) => {
      patches.forEach((patch) => {
        let idx = patch.start1;
        patch.diffs.forEach(([operation, changeText]) => {
          switch (operation) {
            case 1: // Insertion
              doc.content.insertAt(idx, ...changeText.split(""));
            case 0: // No Change
              idx += changeText.length;
              break;
            case -1: // Deletion
              for (let i = 0; i < changeText.length; i++) {
                doc.content.deleteAt(idx);
              }
              break;
          }
        });
      });
    });
  }

  return {
    setText,
  };
}
