import { Component, inject, computed } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import {
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
  subheader?: boolean;
  children?: DrawerLink[];
}

@Component({
  imports: [MatListModule, RouterLink, RouterLinkActive],
  selector: 'app-drawer',
  template: `
    @let activeRoute = currentRoute();
    <mat-nav-list>
      @for (link of list; track link) { @if (link.children) {
      <div class="menu-item-header" [class.subheader]="link.subheader">
        {{ link.label }}
      </div>
      @for (childLink of link.children; track childLink) {
      <a
        mat-list-item
        [routerLink]="childLink.href"
        [activated]="childLink.href === activeRoute"
        class="subheader-link-item"
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
        border-top: 1px solid var(--mat-sys-surface-variant);
      }

      .subheader {
        font-size: 1rem;
        font-weight: 500;
        border-top: 1px solid var(--mat-sys-surface-variant);
        border-bottom: 1px solid var(--mat-sys-surface-variant);
      }

      .subheader-link-item {
        --mdc-list-list-item-label-text-size: 0.85rem;
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
      href: '/guide',
      label: 'Guide',
      children: [],
    },
    {
      isActive: false,
      href: '/guide/migration',
      label: 'Migration',
      subheader: true,
      children: [
        {
          isActive: false,
          href: '/guide/migration/configurations',
          label: 'Configurations',
        },
      ],
    },
    {
      isActive: false,
      href: '/api',
      label: 'API',
      children: [],
    },
    {
      isActive: false,
      href: '/api/rsbuild',
      label: '@ng-rsbuild/plugin-angular',
      subheader: true,
      children: [
        {
          isActive: false,
          href: '/api/rsbuild/create-config',
          label: 'createConfig',
        },
        {
          isActive: false,
          href: '/api/rsbuild/with-configurations',
          label: 'withConfigurations',
        },
        {
          isActive: false,
          href: '/api/rsbuild/create-server',
          label: 'createServer',
        },
      ],
    },
  ];
}
