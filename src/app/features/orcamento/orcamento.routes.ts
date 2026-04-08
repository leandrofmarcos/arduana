import { Routes } from '@angular/router';

export const ORCAMENTO_ROUTES: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/novo-processo.component').then(m => m.NovoProcessoNovaComponent) },
  { path: 'lista', loadComponent: () => import('./pages/novo-processo.component').then(m => m.NovoProcessoNovaComponent) },
  { path: 'dash', loadComponent: () => import('./pages/orcamento-dash.component').then(m => m.OrcamentoDashComponent) },
  { path: ':id', loadComponent: () => import('./pages/orcamento-detail.component').then(m => m.OrçamentoDetailComponentV2) }
];
