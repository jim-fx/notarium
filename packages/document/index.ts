import Automerge from "automerge";

const doc = Automerge.from({
  type: "md",
  path: "/test/okat/asd",
  frontmatter: {
    some: "random",
    shit: true,
  },
  blocks: [
    {
      type: "h1",
      data: {
        some: "stuff",
      },
    },
  ],
});
