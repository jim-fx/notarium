import { NotariumBlock, parseDocument, regex } from '@notarium/parser';
import { renderFrontMatter, renderHeading } from '@notarium/parser/src/renderBlocks';
import { derived, Writable } from 'svelte/store';

interface WordBlock {
	type: 'word' | 'heading';
	data?: {
		original: string;
		translated: string;
		example?: string;
	};
}

interface VerbBlock {
	type: 'heading' | 'verbs' | 'paragraph';
	words?: string[];
	data?: {
		original: string;
		translated: string;
		example?: string;
	};
}

export interface IDictionaryDocument {
	frontmatter: {
		dictionary: {
			type: 'verbs' | 'adjectives';
		};
	};
	blocks: VerbBlock[];
}

export function renderDocument(doc: IDictionaryDocument) {
	const res: string[] = [];

	if (doc.frontmatter) {
		res.push(...renderFrontMatter(doc), '');
	}

	for (const b of doc.blocks) {
		if (b.type === 'verbs') {
			res.push('');

			let h = `## ${b.data.original} - ${b.data.translated}`;
			if ('learned' in b.data) {
				h = h + (b.data.learned ? ' - learned' : '');
			}
			res.push(h);

			res.push(...b.words);

			if (b.data.example) {
				res.push('### example');
				res.push(b.data.example);
			}
		} else {
			res.push('');
			res.push(...renderHeading(b));
		}
	}

	return res.join('\n');
}

function parseDictionaryBlocks(inputBlocks: NotariumBlock[]) {
	const blocks = [];

	let currentBlock: VerbBlock = {
		type: 'paragraph',
		words: [],
		data: {
			original: '',
			translated: ''
		}
	};

	const empty = JSON.stringify(currentBlock);
	function isEmpty(b: VerbBlock) {
		return JSON.stringify(b) === empty;
	}

	function close() {
		if (isEmpty(currentBlock)) return;
		blocks.push(currentBlock);
		currentBlock = JSON.parse(empty);
	}

	let nextBlockIsExample = false;

	for (const b of inputBlocks) {
		if (b.type === 'heading') {
			if (b?.data.weight === 2) {
				close();
				const [orig, translated, learned] = b.data.text.split(' - ');
				if (learned) {
					currentBlock.data['learned'] = true;
				}
				currentBlock.data['original'] = orig;
				currentBlock.data['translated'] = translated;
				currentBlock.type = 'verbs';
				continue;
			} else if (b?.data.weight === 3) {
				if (['ejemplo', 'example'].includes(b.data?.text)) {
					nextBlockIsExample = true;
				}
			} else {
				currentBlock = b as unknown as VerbBlock;
				close();
			}
		}

		if (b.type === 'paragraph') {
			if (currentBlock.type === 'verbs') {
				if (nextBlockIsExample) {
					nextBlockIsExample = false;
					currentBlock.data['example'] = b.data.toString();
				} else {
					currentBlock.words.push(...regex.splitLine(b.data.toString()));
				}
			}
		}
	}
	close();

	return blocks;
}

export function parseGenericDictionary(inputBlocks: NotariumBlock[]) {
	const blocks = [];

	let currentBlock: WordBlock = {
		type: 'heading',
		data: {
			original: '',
			translated: ''
		}
	};

	const empty = JSON.stringify(currentBlock);
	function isEmpty(b: WordBlock) {
		return JSON.stringify(b) === empty;
	}

	function close() {
		if (isEmpty(currentBlock)) return;
		blocks.push(currentBlock);
		currentBlock = JSON.parse(empty);
	}

	for (const b of inputBlocks) {
		if (b.type === 'heading') {
			if (b?.data.weight === 2) {
				close();
				const [orig, translated, learned] = b.data.text.split(' - ');
				currentBlock.data['original'] = orig;
				currentBlock.data['translated'] = translated;
				if (learned !== undefined) {
					currentBlock.data['learned'] = true;
				}
				currentBlock.type = 'word';
				continue;
			} else {
				currentBlock = b as unknown as WordBlock;
				close();
			}
		}

		if (b.type === 'paragraph') {
			const lines = regex.splitLine(b.data.toString());

			console.log(lines);
			for (const line of lines) {
				close();
				currentBlock.type = 'word';
				const [orig, translated, learned] = line.replace(/\t/g, ' ').split(' - ');
				currentBlock.data.translated = translated?.trim();
				currentBlock.data.original = orig?.trim();
				if (learned) {
					currentBlock.data.learned = true;
				}
			}
		}
	}

	close();

	return blocks;
}

export function parseMarkdown(s: string): IDictionaryDocument {
	console.log({ s });

	const doc = parseDocument(s);

	if (doc.frontmatter?.dictionary?.type) {
		switch (doc.frontmatter.dictionary.type) {
			case 'verbs':
				doc.blocks = parseDictionaryBlocks(doc.blocks);
				break;
		}
	} else {
		doc.blocks = parseGenericDictionary(doc.blocks);
	}

	return doc as unknown as IDictionaryDocument;
}
