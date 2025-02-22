import { Component } from '@angular/core';
import { CodeBlockComponent } from '../../../../ui/code-block/code-block.component';
import {
  ApiOption,
  ApiOptionComponent,
} from '../../../../ui/api/api-option.component';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

@Component({
  imports: [CodeBlockComponent, ApiOptionComponent, MatTab, MatTabGroup],
  preserveWhitespaces: true,
  selector: 'app-create-server',
  templateUrl: './create-server.component.html',
  styles: [
    `
      :host {
        max-width: 90vw;
        margin: 0 auto;

        .spacer {
          border-top: 1px solid var(--mat-sys-surface-variant);
        }
      }
    `,
  ],
})
export class CreateServerComponent {
  options: ApiOption[] = [
    {
      name: 'app',
      type: 'express.Express',
      description: 'The express application instance.',
    },
    {
      name: 'listen',
      type: '(port?: number) => void',
      description:
        'Starts the express application on the specified port. If no port is provided, the default port (4000) is used.',
    },
  ];
}
