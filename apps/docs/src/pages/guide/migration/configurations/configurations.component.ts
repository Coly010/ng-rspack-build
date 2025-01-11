import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CodeBlockComponent } from '../../../../ui/code-block/code-block.component';
import { CalloutComponent } from '../../../../ui/callout/callout.component';

@Component({
  preserveWhitespaces: true,
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styles: [
    `
      :host {
        margin: 0 auto;
        max-width: 85vw;
        @media (min-width: 960px) {
          max-width: 70vw;
        }
      }
    `,
  ],
  imports: [RouterLink, MatIcon, CodeBlockComponent, CalloutComponent],
})
export class ConfigurationsComponent {}
