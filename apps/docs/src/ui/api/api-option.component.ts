import { Component, input, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export interface ApiOption {
  name: string;
  type: string;
  description: string;
  default?: string;
  internal?: boolean;
}

@Component({
  selector: 'app-api-option',
  template: `@let option = apiOption();
    <div class="option-info">
      <h3 [id]="option.name">
        <a [href]="'#' + option.name"
          ><span class="anchor-icon">#</span>{{ option.name }}</a
        >
      </h3>
      <h4>
        <code>{{ option.type }}</code>
      </h4>
      @if (option.internal) {
      <h4 class="internal"><code>internal</code></h4>
      } @if (option.default) {
      <h4 class="default">Default: <code>true</code></h4>
      }
      <p [innerHtml]="apiOptionDescription()"></p>
    </div>`,
  styles: [
    `
      .option-info {
        position: relative;
        margin-top: 2rem;
        border-top: 1px solid var(--mat-sys-surface-variant);
        padding-top: 1rem;

        h3 {
          position: relative;
          font-family: monospace;
          font-size: 1.25rem;
          margin-bottom: 0.5rem;

          a {
            color: var(
              --mat-sidenav-content-text-color,
              var(--mat-sys-on-background)
            );
            text-decoration: none;
          }

          &:hover {
            cursor: pointer;
            text-decoration: underline;

            .anchor-icon {
              visibility: visible;
            }
          }

          .anchor-icon {
            position: absolute;
            top: -0.2rem;
            left: -1.5rem;
            font-size: 1.5rem;
            color: var(--mat-sys-primary);
            visibility: hidden;
          }
        }

        h4 {
          display: inline-flex;
          margin: 0.5rem;
          padding: 4px 8px;
          background-color: var(--mat-sys-primary-container);
          border-radius: 0.5rem;
          border: 1px solid var(--mat-sys-primary);
          align-items: center;
          font-size: 1rem;
          gap: 0.5rem;

          code {
            font-size: 0.75rem;
            font-family: monospace;
          }

          &.internal {
            font-size: 0.75rem;
            background-color: var(--mat-sys-error-container);
            border: 1px solid var(--mat-sys-error);
          }

          &.default {
            font-size: 0.75rem;
            background-color: var(--mat-sys-surface-container);
            border: 1px solid var(--mat-sys-surface-variant);
          }
        }
      }
    `,
  ],
})
export class ApiOptionComponent {
  sanitizer = inject(DomSanitizer);
  apiOption = input.required<ApiOption>();
  apiOptionDescription = computed(() => {
    return this.sanitizer.bypassSecurityTrustHtml(
      this.apiOption().description.replace(
        /`([^`]*)`/g,
        '<code class="inline-code">$1</code>'
      )
    );
  });
}
