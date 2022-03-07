import { diff_match_patch } from "diff-match-patch";
import { File } from "@notarium/fs";
import { Doc } from "yjs";

export function createDocumentFrontend(file: File) {
  const dmp = new diff_match_patch();

  let timeout: NodeJS.Timeout;
  let lastExecution = 0;

  function getText() {
    const doc = file.getData() as Doc;
    return doc.getText("content").toString();
  }

  async function setText(t: string) {
    if (timeout) clearTimeout(timeout);
    const now = Date.now();
    if (now - lastExecution < 500) {
      await new Promise((res) => {
        timeout = setTimeout(res, 500);
      });
    } else {
      lastExecution = now;
    }

    const currentContent = getText();

    // Compute the diff:
    const diff = dmp.diff_main(currentContent, t);

    // This cleans up the diff so that the diff is more human friendly.
    dmp.diff_cleanupSemantic(diff);

    const patches = dmp.patch_make(currentContent, diff);

    file.update((doc: Doc) => {
      const text = doc.getText("content");
      patches.forEach((patch: { start1: any; diffs: [any, any][] }) => {
        let idx = patch.start1;
        patch.diffs.forEach(([operation, changeText]) => {
          switch (operation) {
            case 1: // Insertion
              text.insert(idx, changeText);
            case 0: // No Change
              idx += changeText.length;
              break;
            case -1: // Deletion
              text.delete(idx, changeText.length);
              break;
          }
        });
      });
    });
  }

  return {
    getText,
    setText,
  };
}
