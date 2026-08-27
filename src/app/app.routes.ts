import type { Routes } from '@angular/router';

/**
 * Both pages are lazy: neither approach requires anything from
 * `devextreme/ui/*` at startup, so the widget code stays in the page chunks.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'directive' },
  {
    path: 'directive',
    title: 'Directive',
    loadComponent: () => import('./directive/directive-page.component').then((m) => m.DirectivePageComponent),
  },
  {
    path: 'projection',
    title: 'Projection',
    loadComponent: () => import('./projection/projection-page.component').then((m) => m.ProjectionPageComponent),
  },
];
