import dictionary from './dictionary';
import def from './default';
import type { Parser } from './types';

export function getParser(type: string): Parser {
	if (!type) return;
	switch (type) {
		case 'dictionary':
			return dictionary;
		default:
			return def;
	}
}
