import { Route } from '@angular/router';
import { InlCssInlTmplComponent } from './features/inl-css-inl-tmpl.component';

export const externalRoutes: Route[] = [
  {
    component: InlCssInlTmplComponent,
    path: 'inl-css-inl-tmpl',
    data: {
      title: 'InlCssInlTmpl',
    },
  },
];
