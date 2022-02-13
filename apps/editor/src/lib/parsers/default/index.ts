import type { Parser } from '../types';
import Editor from './Editor.svelte';

export default {
	Editor,
	Viewer: Editor
} as unknown as Parser;
