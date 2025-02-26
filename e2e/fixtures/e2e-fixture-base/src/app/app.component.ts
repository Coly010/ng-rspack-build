import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  template: `
    <menu>
      @for (item of menuItems; track item.path) {
      <a routerLink="{{ item.path }}">{{ item.label }}</a>
      }
    </menu>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  menuItems = appRoutes.map((route, idx) => ({
    path: route.path,
    label: route?.data?.['title'] ?? `Feature ${idx}`,
  }));
  protected readonly indexedDB = indexedDB;
}
