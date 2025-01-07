import { Route } from '@angular/router';
import { ApiComponent } from '../pages/api/api.component';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'getting-started',
    children: [
      {
        path: 'introduction',
        loadComponent: () =>
          import(
            '../pages/getting-started/introduction/introduction.component'
          ).then((m) => m.IntroductionComponent),
      },
      {
        path: 'quick-start',
        loadComponent: () =>
          import(
            '../pages/getting-started/quick-start/quick-start.component'
          ).then((m) => m.QuickStartComponent),
      },
      {
        path: '',
        redirectTo: 'quick-start',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'api',
    component: ApiComponent,
    children: [
      {
        path: 'create-config',
        loadComponent: () =>
          import('../pages/api/create-config/create-config.component').then(
            (m) => m.CreateConfigComponent
          ),
      },
    ],
  },
];
