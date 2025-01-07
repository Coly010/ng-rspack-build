import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  imports: [MatTabsModule],
  selector: 'app-quick-start',
  templateUrl: './quick-start.component.html',
  styles: [
    `
      :host {
        max-width: 90vw;
        @media (min-width: 960px) {
          max-width: 70vw;
        }
        margin: 0 auto;
      }

      h1 {
        padding-bottom: 2rem;
      }

      h3 {
        padding-top: 1rem;
      }
    `,
  ],
})
export class QuickStartComponent {}
