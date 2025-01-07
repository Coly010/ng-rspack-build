import { Component, inject, computed } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

interface DrawerLink {
  isActive: boolean;
  href: string;
  label: string;
  children?: DrawerLink[];
}

@Component({
  imports: [MatListModule, RouterLink, RouterLinkActive],
  selector: 'app-drawer',
  template: `
    @let activeRoute = currentRoute();
    <mat-nav-list>
      @for (link of list; track link) { @if (link.children) {
      <div class="menu-item-header">{{ link.label }}</div>
      @for (childLink of link.children; track childLink) {
      <a
        mat-list-item
        [routerLink]="childLink.href"
        [activated]="childLink.href === activeRoute"
        >{{ childLink.label }}</a
      >
      } } @else {
      <a
        mat-list-item
        [routerLink]="link.href"
        [activated]="link.href === activeRoute"
        >{{ link.label }}</a
      >
      } }
    </mat-nav-list>
  `,
  styles: [
    `
      .menu-item-header {
        padding: 1rem;
        font-size: 1.15rem;
        font-weight: 500;
      }
    `,
  ],
})
export class DrawerComponent {
  router = inject(Router);
  routerEvents = toSignal(this.router.events);
  currentRoute = computed(() => {
    const event = this.routerEvents();
    if (event instanceof NavigationEnd) {
      return event.urlAfterRedirects;
    }
    return '';
  });
  list: DrawerLink[] = [
    {
      isActive: true,
      href: '/',
      label: 'Home',
    },
    {
      isActive: false,
      href: '/getting-started',
      label: 'Getting Started',
      children: [
        {
          isActive: false,
          href: '/getting-started/introduction',
          label: 'Introduction',
        },
        {
          isActive: false,
          href: '/getting-started/quick-start',
          label: 'Quick Start',
        },
      ],
    },
    {
      isActive: false,
      href: '/api',
      label: 'API',
    },
  ];
}
