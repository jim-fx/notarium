import { EditorState, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { history } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { vim } from '@replit/codemirror-vim';


type VimOptions = {
  extensions?: Extension[]
}

const FontSizeTheme = EditorView.theme({
  '&': {
    fontSize: '12pt'
  },
  '.cm-content': {
    fontFamily: 'Menlo, Monaco, Lucida Console, monospace',
    minHeight: '200px'
  },
  '.cm-gutters': {
    minHeight: '200px'
  },
  '.cm-scroller': {
    overflow: 'auto',
    maxHeight: '600px'
  },
  '.cm-o-replacement': {
    display: 'inline-block',
    width: '.5em',
    height: '.5em',
    borderRadius: '.25em'
  }
});


export default function(text: string, wrapper: HTMLElement, { extensions = [] }: VimOptions = {}) {
  const state = EditorState.create({
    doc: text,
    extensions: [
      history(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      vim(),
      markdown(),
      FontSizeTheme,
      ...extensions
    ]
  });

  const view = new EditorView({
    state,
    parent: wrapper
  });

  return () => {
    view.destroy();
  }

}
