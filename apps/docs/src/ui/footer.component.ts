import { Component, computed } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-footer',
  template: `
    <footer>
      <img
        src="logo-small.png"
        alt="Angular Rspack and Rsbuild Tools"
        width="50"
      />
      <p>Angular Rspack and Rsbuild Tools. Licensed under MIT.</p>
      <a href="https://github.com/Coly010/ng-rspack-build">GitHub</a>
      <div class="rsbuild-callout">
        <p>
          Built for {{ env() }} by <a href="https://rsbuild.dev">Rsbuild</a>
        </p>
      </div>
    </footer>
  `,
  styles: [
    `
      footer {
        text-align: center;
        padding: 1rem;
        border-top: 1px solid var(--mat-sys-surface-variant);

        img {
          opacity: 0.5;
        }

        .rsbuild-callout {
          margin-top: 1rem;
          border-top: 1px solid var(--mat-sys-surface-variant);
        }
      }
    `,
  ],
})
export class FooterComponent {
  env = computed(() => environment.name);
}
