import { InjectionToken } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import shell from 'highlight.js/lib/languages/bash';
import scss from 'highlight.js/lib/languages/scss';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';

type SyntaxHighlighter = typeof hljs;
export type SupportedLanguages =
  | 'css'
  | 'javascript'
  | 'js'
  | 'json'
  | 'html'
  | 'scss'
  | 'shell'
  | 'typescript'
  | 'ts';

export const SyntaxHighlighter: InjectionToken<SyntaxHighlighter> =
  new InjectionToken<SyntaxHighlighter>('SyntaxHighlighter');

export function provideSyntaxHighlighter() {
  hljs.registerLanguage('css', css);
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('html', xml);
  hljs.registerLanguage('scss', scss);
  hljs.registerLanguage('shell', shell);
  hljs.registerLanguage('typescript', typescript);

  return {
    provide: SyntaxHighlighter,
    useValue: hljs,
  };
}
