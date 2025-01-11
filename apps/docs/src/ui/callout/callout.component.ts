import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-callout',
  template: `
    <div
      class="callout"
      [class.info]="type() === 'info'"
      [class.warning]="type() === 'warning'"
      [class.error]="type() === 'error'"
    >
      <div class="callout-header">
        <mat-icon>{{ icon() }}</mat-icon>
        <h3>{{ title() }}</h3>
      </div>
      <div class="callout-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        padding: 0.75rem 0;
        font-size: 0.85rem;
      }

      .callout {
        border: 1px solid var(--mat-sys-surface-variant);
        border-radius: 0.5rem;
        background-color: var(--mat-sys-surface-container);
        padding: 0.5rem;

        &.info {
          border-color: var(--mat-sys-info);
          background-color: var(--mat-sys-info-container);
        }

        &.error {
          border-color: var(--mat-sys-error);
          background-color: var(--mat-sys-error-container);
        }

        &.warning {
          border-color: var(--mat-sys-warning);
          background-color: var(--mat-sys-warning-container);
        }
      }

      .callout-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        h3 {
          margin: 0;
          font-size: 0.95rem;
        }
      }

      .callout-content {
        padding-top: 0.25rem;
      }
    `,
  ],
  imports: [MatIcon],
})
export class CalloutComponent {
  type = input<'info' | 'warning' | 'error'>('info');
  icon = computed(() => {
    switch (this.type()) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
    }
  });
  title = input<string>('Info');
}
