import { Component } from '@angular/core';

@Component({
  selector: 'diagnostic-emissions',
  template: `<h1>diagnostic-emissions.component.ts</h1>`,
})
export class DiagnosticEmissionsComponent {
  title: string = 42; // Semantic Error: Type 'number' is not assignable to type 'string'

  // Warning: "message" is declared but never used.
  @Input() message!: string;

  // Error: Missing type annotation for the method.
  handleClick() {
    console.log('Button clicked!');
  }
}
