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
    path: 'guide',
    children: [
      {
        path: 'migration',
        children: [
          {
            path: 'from-webpack',
            loadComponent: () =>
              import(
                '../pages/guide/migration/from-webpack/from-webpack.component'
              ).then((m) => m.FromWebpackComponent),
          },
          {
            path: 'configurations',
            loadComponent: () =>
              import(
                '../pages/guide/migration/configurations/configurations.component'
              ).then((m) => m.ConfigurationsComponent),
          },
        ],
      },
    ],
  },
  {
    path: 'api',
    component: ApiComponent,
    children: [
      {
        path: 'rsbuild',
        children: [
          {
            path: 'create-config',
            loadComponent: () =>
              import(
                '../pages/api/rsbuild/create-config/create-config.component'
              ).then((m) => m.CreateConfigComponent),
          },
          {
            path: 'with-configurations',
            loadComponent: () =>
              import(
                '../pages/api/rsbuild/with-configurations/with-configurations.component'
              ).then((m) => m.WithConfigurationsComponent),
          },
          {
            path: 'create-server',
            loadComponent: () =>
              import(
                '../pages/api/rsbuild/create-server/create-server.component'
              ).then((m) => m.CreateServerComponent),
          },
        ],
      },
      {
        path: 'rspack',
        children: [
          {
            path: 'create-config',
            loadComponent: () =>
              import(
                '../pages/api/rspack/create-config/create-config.component'
              ).then((m) => m.CreateConfigComponent),
          },
        ],
      },
    ],
  },
];
