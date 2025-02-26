import { Route } from '@angular/router';
import { externalRoutes } from './external.routes';
import { WelcomeComponent } from './features/welcome.component';

export const appRoutes: Route[] = [
  {
    component: WelcomeComponent,
    path: 'app-welcome',
    data: {
      title: 'Welcome',
    },
  },
  ...externalRoutes,
];
