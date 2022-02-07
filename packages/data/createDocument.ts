import DiffMatchPatch from "diff-match-patch";
import { IDataBackend, DocumentData } from "@notarium/types";

export function createDocument(backend: IDataBackend<DocumentData>) {
  const dmp = new DiffMatchPatch();

  let timeout;
  let lastExecution = 0;

  function getText() {
    return backend.doc.getText("content").toString();
  }

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

    const currentContent = backend.doc.getText("content").toString();

    // Compute the diff:
    const diff = dmp.diff_main(currentContent, t);

    // This cleans up the diff so that the diff is more human friendly.
    dmp.diff_cleanupSemantic(diff);

    const patches = dmp.patch_make(currentContent, diff);

    backend.update(() => {
      const doc = backend.doc.getText("content");
      patches.forEach((patch: { start1: any; diffs: [any, any][] }) => {
        let idx = patch.start1;
        patch.diffs.forEach(([operation, changeText]) => {
          switch (operation) {
            case 1: // Insertion
              doc.insert(idx, changeText);
            case 0: // No Change
              idx += changeText.length;
              break;
            case -1: // Deletion
              doc.delete(idx, changeText.length);
              break;
          }
        });
      });
    });
  }

  return {
    setText,
    getText,
  };
}
