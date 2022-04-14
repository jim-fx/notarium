import dictionary from './dictionary/Editor.svelte';
import def from './default/Editor.svelte';

export function getParser(type: string) {
  switch (type) {
    case 'dictionary':
      return dictionary;
    default:
      return def;
  }

}
