import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatListModule, RouterLink],
  selector: 'app-drawer',
  template: `
    <mat-nav-list>
      @for (link of list; track link) {
      <a mat-list-item [routerLink]="link.href" [activated]="link.isActive">{{
        link.label
      }}</a>
      }
    </mat-nav-list>
  `,
})
export class DrawerComponent {
  list: { isActive: boolean; href: string; label: string }[] = [
    {
      isActive: true,
      href: './',
      label: 'Home',
    },
    {
      isActive: false,
      href: './getting-started',
      label: 'Getting Started',
    },
    {
      isActive: false,
      href: './api',
      label: 'API',
    },
  ];
}
