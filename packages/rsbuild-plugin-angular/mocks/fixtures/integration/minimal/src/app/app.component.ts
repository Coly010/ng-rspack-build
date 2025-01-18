import { Component } from '@angular/core';
import { getTitle } from './get-title';
import { DiagnosticEmissionsComponent } from './diagnostic-emissions.component';

@Component({
  selector: 'app-root',
  imports: [DiagnosticEmissionsComponent],
  template: `
    <h1>{{ title }}</h1>
    <diagnostic-emissions></diagnostic-emissions>
  `,
})
export class AppComponent {
  title = getTitle();
}
