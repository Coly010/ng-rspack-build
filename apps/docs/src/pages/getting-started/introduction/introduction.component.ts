import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatIconModule],
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
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

      .disclaimer {
        margin-top: 1rem;
        margin-bottom: 1rem;
        padding: 1rem;
        background-color: var(--mat-sys-error-container);
        border-radius: 0.5rem;
        border: 1px solid var(--mat-sys-error);

        h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }
    `,
  ],
})
export class IntroductionComponent {}
