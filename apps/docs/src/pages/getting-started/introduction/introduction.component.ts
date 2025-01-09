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
        margin: 0 auto;
        font-size: 1.15rem;
        line-height: 2rem;
        @media (min-width: 960px) {
          max-width: 70vw;
        }
      }

      h1,
      h2 {
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

      .spacer {
        margin-top: 4rem;
        margin-bottom: 4rem;
        border-top: 1px solid var(--mat-sys-surface-variant);
      }
    `,
  ],
})
export class IntroductionComponent {}
