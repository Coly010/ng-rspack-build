import { Component } from '@angular/core';

@Component({
  selector: 'app-create-config',
  templateUrl: './create-config.component.html',
  styles: [
    `
      :host {
        max-width: 90vw;
        margin: 0 auto;
      }

      h1 {
        padding-bottom: 2rem;
      }
    `,
  ],
})
export class CreateConfigComponent {}
