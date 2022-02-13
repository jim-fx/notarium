import { NotariumDocument, parseDocument, renderDocument, renderMarkdown } from '@notarium/parser';

export function parse(input: string) {
	return parseDocument(input);
}

export function renderDoc(input: NotariumDocument) {
	return renderMarkdown(renderDocument(input));
}

export function renderMark(input: NotariumDocument) {
	return renderDocument(input, { showFrontMatter: true });
}
