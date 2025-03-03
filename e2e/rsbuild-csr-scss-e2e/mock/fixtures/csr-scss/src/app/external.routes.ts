import { Route } from '@angular/router';
import { InlScssInlTmplComponent } from './features/inl-scss-inl-tmpl.component';

export const externalRoutes: Route[] = [
  {
    component: InlScssInlTmplComponent,
    path: 'inl-scss-inl-tmpl',
    data: {
      title: 'InlScssInlTmpl',
    },
  },
];
