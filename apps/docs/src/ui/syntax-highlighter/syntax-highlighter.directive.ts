import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  SyntaxHighlighter,
  SupportedLanguages,
} from './syntax-highlighter.provider';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Directive({
  selector: 'code[highlight]',
})
export class SyntaxHighlighterDirective implements OnInit, OnDestroy {
  sanitizer = inject(DomSanitizer);
  syntaxHighlighter = inject(SyntaxHighlighter);
  el = inject(ElementRef);
  platformId = inject(PLATFORM_ID);
  language = input<SupportedLanguages>();
  rendered = false;

  constructor() {
    if (isPlatformServer(this.platformId)) {
      this.renderCode();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !this.rendered) {
      this.renderCode();
    }
  }

  ngOnDestroy() {
    this.rendered = false;
  }

  private renderCode() {
    const result = this.syntaxHighlighter.highlight(
      this.el.nativeElement.innerText,
      {
        language: this.getLanguage(),
      }
    );
    this.el.nativeElement.innerHTML = result.value;
    this.rendered = true;
  }

  private getLanguage() {
    let language = this.language() ?? 'typescript';
    if (language === 'css') {
      language = 'css';
    } else if (language === 'javascript') {
      language = 'javascript';
    } else if (language === 'js') {
      language = 'javascript';
    } else if (language === 'json') {
      language = 'json';
    } else if (language === 'html') {
      language = 'html';
    } else if (language === 'scss') {
      language = 'scss';
    } else if (language === 'shell') {
      language = 'shell';
    } else if (language === 'ts') {
      language = 'typescript';
    } else if (language === 'typescript') {
      language = 'typescript';
    }
    return language;
  }
}
