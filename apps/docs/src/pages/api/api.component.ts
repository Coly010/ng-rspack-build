import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-api',
  template: ` <h1>API Reference</h1>
    <router-outlet></router-outlet>`,
  styles: [
    `
      :host {
        max-width: 85vw;
        @media (min-width: 960px) {
          max-width: 70vw;
        }
        margin: 0 auto;
      }

      h1 {
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--mat-sys-surface-variant);
        margin-bottom: 4rem;
      }
    `,
  ],
})
export class ApiComponent {}
