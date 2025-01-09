import { Directive, ElementRef, inject } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: 'code[highlight]',
})
export class SyntaxHighlighterDirective {
  sanitizer = inject(DomSanitizer);
  constructor(private el: ElementRef) {
    hljs.registerLanguage('javascript', javascript);
    const result = hljs.highlight(this.el.nativeElement.innerHTML, {
      language: 'javascript',
    });
    this.el.nativeElement.innerHTML = result.value;
  }
}
