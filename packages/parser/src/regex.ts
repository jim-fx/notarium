export const isLineTable = (s: string) => s.match(/^(\|(?!\|).*).*\|/gm);
export const isLineHeading = (s: string) => s.match(/^[\#]{1,4}(?!\#)/gm);
export const isTableSeperator = (s: string) => !!s.match(/^(\|[\-\s]*)*\|$/);
export const isCheckList = (s: string) => s.match(/^(\s*)\-\s\[[x\s]\]\s/gm);
export const isCodeOpening = (s: string) => !!s.match(/^[`]{3}([a-z])*$/gm);
export const isCodeClosing = (s: string) => !!s.match(/^[`]{3}$/gm);
export const isLineChecked = (s: string) => !!s.match(/^(\s*)\-\s\[[x]\]\s/gm);
export const isFrontMatter = (s: string) => !!s.match(/^[\-]{3}$/gm);
