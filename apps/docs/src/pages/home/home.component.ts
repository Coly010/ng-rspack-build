import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

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
        height: 8px;
        border-radius: 8px;
        background-color: var(--mat-sys-surface-container);
        border: 2px solid var(--mat-sys-surface-variant);

        .benchmark-graph-bar-inner {
          position: absolute;
          top: 0;
          left: 0;
          height: 8px;
          border-radius: 8px;
          background: linear-gradient(
            to right,
            var(--mat-sys-primary),
            var(--mat-sys-secondary)
          );
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
  imports: [MatButtonModule, BenchmarkGraphComponent, RouterLink],
  templateUrl: './home.component.html',
  styles: [
    `
      .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        text-align: center;
        max-height: 45vh;
        @media (min-width: 960px) {
          text-align: left;
        }

        h1 {
          font-size: 3rem;
        }

        p {
          font-size: 1.5rem;
          margin-top: 1rem;
        }
      }

      .spacer {
        padding: 3.5rem;
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

      .bundler-container {
        padding: 1rem;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: 1fr;
        align-items: start;
        @media (min-width: 960px) {
          grid-template-columns: repeat(3, 1fr);
        }

        .bundler-name {
          grid-column: 1 / span 2;
          @media (min-width: 960px) {
            grid-column: 1;
          }
        }

        .graphs {
          display: flex;
          width: 100%;
          flex-direction: column;
          flex-grow: 1;
          gap: 8px;
        }

        .labels {
          padding-left: 8px;
          text-align: left;
          font-size: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 6px;
          @media (max-width: 960px) {
            align-items: end;
          }
        }
      }
    `,
  ],
})
export class HomeComponent {
  rspackBuildTime = {
    prodSsr: 19.974,
    prod: 18.239,
    dev: 16.477,
  };
  rsbuildBuildTime = {
    prodSsr: 24.69,
    prod: 20.49,
    dev: 19.675,
  };
  esbuildBuildTime = {
    prodSsr: 28.509,
    prod: 24.521,
    dev: 18.719,
  };
  webpackBuildTime = {
    prodSsr: 348.707,
    prod: 224.226,
    dev: 234.449,
  };
}
