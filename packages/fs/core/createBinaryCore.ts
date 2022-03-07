export default function wrapBinary(file, d, adapters) {
  let data = d;

  return {
    async update(cb, originalAdapter) {
      data = await cb(data);
      adapters.forEach((a) => {
        if (a !== originalAdapter) {
          a.saveFile(d);
        }
      });
    },
    getData() {
      return data;
    },
    destroy() {},
  };
}
