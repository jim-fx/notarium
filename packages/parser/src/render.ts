import {
	renderChecklist,
	renderCode,
	renderFrontMatter,
	renderHeading,
	renderParagraph,
	renderTable
} from './renderBlocks';
import type { NotariumDocument } from './types';

export default function renderDocument(d: NotariumDocument): string {
	if (!d || !d.blocks) return '';
	const frontMatter = renderFrontMatter(d);

	//console.trace("Render", d)

	const renderedBlocks = d.blocks.map((b) => {
		switch (b.type) {
			case 'table':
				return renderTable(b);
			case 'heading':
				return renderHeading(b);
			case 'checklist':
				return renderChecklist(b);
			case 'code':
				return renderCode(b);
			case 'paragraph':
				return renderParagraph(b);
			default:
				console.error('Need to implement render for type', b.type);
				return [];
		}
	});

	return [
		...frontMatter,
		...renderedBlocks
			.map((block) => (Array.isArray(block) ? block : [block]))
			.map((block) => [...block, ''])
			.flat()
	].join('\n');
}
