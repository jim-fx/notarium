import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
// Languages import
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import yaml from 'highlight.js/lib/languages/yaml';
import { Remarkable } from 'remarkable';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('typescript', typescript);

const remark = new Remarkable({
	highlight: function (str: string, language: string) {
		if (language && hljs.getLanguage(language)) {
			try {
				return hljs.highlight(str, { language }).value;
			} catch (err) {
				/*"asdasd"*/
			}
		}

		try {
			return hljs.highlightAuto(str).value;
		} catch (err) {
			/*asdasd*/
		}

		return ''; // use external default escaping
	}
});

export default (md: string): string => {
	return remark.render(md);
};
