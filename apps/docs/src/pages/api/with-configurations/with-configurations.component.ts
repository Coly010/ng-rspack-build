import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import {
  ApiOption,
  ApiOptionComponent,
} from '../../../ui/api/api-option.component';
import { CodeBlockComponent } from '../../../ui/code-block/code-block.component';
import { MatList, MatListItem, MatNavList } from '@angular/material/list';
import { RouterLink } from '@angular/router';

@Component({
  imports: [
    MatTabsModule,
    ApiOptionComponent,
    CodeBlockComponent,
    MatListItem,
    RouterLink,
    MatNavList,
  ],
  preserveWhitespaces: true,
  selector: 'app-with-configurations',
  templateUrl: './with-configurations.component.html',
  styleUrls: ['./with-configurations.component.scss'],
})
export class WithConfigurationsComponent {
  options: ApiOption[] = [];
}
