import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CodeBlockComponent } from '../../../ui/code-block/code-block.component';

@Component({
  imports: [MatTabsModule, CodeBlockComponent],
  preserveWhitespaces: true,
  selector: 'app-quick-start',
  templateUrl: './quick-start.component.html',
  styles: [
    `
      :host {
        max-width: 85vw;
        margin: 0 auto;
        @media (min-width: 960px) {
          max-width: 70vw;
        }
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
