import { Route } from '@angular/router';
import { UrlLessInlTmplComponent } from './features/url-less-inl-tmpl.component';

export const externalRoutes: Route[] = [
  {
    component: UrlLessInlTmplComponent,
    path: 'inl-less-inl-tmpl',
    data: {
      title: 'InlLessInlTmpl',
    },
  },
];
