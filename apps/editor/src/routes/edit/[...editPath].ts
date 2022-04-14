import fs from '$lib/fs';

/** @type {import('./[id]').RequestHandler} */
export async function get({ params: { editPath } }) {
  await fs.load();
  const file = fs.openFile(editPath);
  await file.load();
  await file.getContext().isLoaded;

  return {
    body: {
      file
    }
  };
}
