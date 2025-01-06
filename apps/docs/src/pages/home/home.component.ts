import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-benchmark-graph',
  template: ` <div class="container">
    <div class="benchmark-graph-container">
      <div
        class="benchmark-graph-bar-inner"
        [style.width]="filledPercentage() + '%'"
      ></div>
    </div>
  </div>`,
  styles: [
    `
      .container {
        width: 100%;
      }

      .benchmark-graph-container {
        position: relative;
        width: 100%;
        height: 16px;
        border-radius: 8px;
        background-color: var(--mat-sys-surface-container);
        border: 2px solid var(--mat-sys-surface-variant);

        .benchmark-graph-bar-inner {
          position: absolute;
          top: 0;
          left: 0;
          height: 16px;
          border-radius: 8px;
          background-color: var(--mat-sys-primary);
        }
      }
    `,
  ],
})
class BenchmarkGraphComponent {
  maxValue = input.required<number>();
  value = input.required<number>();
  filledPercentage = computed(() => {
    return (this.value() / this.maxValue()) * 100;
  });
}

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, BenchmarkGraphComponent],
  templateUrl: './home.component.html',
  styles: [
    `
      .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 30vh;
        padding: 1rem;

        h1 {
          font-size: 3rem;
        }

        p {
          font-size: 1.5rem;
          margin-top: 1rem;
        }
      }

      .spacer {
        padding: 4rem;
      }

      .info-box-container {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        grid-auto-rows: 1fr;
        justify-content: space-evenly;
        align-items: start;
        gap: 1rem;
        @media (min-width: 960px) {
          gap: 0.5rem;
          grid-template-columns: repeat(3, 1fr);
        }
      }

      .info-box {
        background-color: var(--mat-sys-primary-container);
        border-radius: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
        gap: 1rem;
        padding: 1rem;
        height: 100%;

        max-width: 90vw;
        @media (min-width: 960px) {
          max-width: 30vw;
        }

        p {
          text-align: center;
        }

        img {
          width: 100px;
          height: 100px;
        }
      }

      .note {
        font-style: italic;
      }

      .subsection {
        text-align: center;
        font-size: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        h2 {
          font-size: 2.5rem;
        }

        .subsection-header {
          max-width: 70vw;
        }
      }

      .benchmark-graph {
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: center;
        flex-grow: 1;
        width: 100%;
        gap: 4px;
        padding: 0.5rem;

        span {
          font-size: 1.15rem;
          font-weight: 500;
        }

        app-benchmark-graph {
          width: 100%;
        }
      }
    `,
  ],
})
export class HomeComponent {
  rspackBuildTime = 19.974;
  rsbuildBuildTime = 24.69;
  esbuildBuildTime = 28.509;
  webpackBuildTime = 348.707;
}
