import { Routes } from '@angular/router';

export const ORCAMENTO_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lista' },
  { path: 'criar', loadComponent: () => import('./pages/criar-orcamento.component').then(m => m.CriarOrcamentoComponent) },
  { path: 'lista', loadComponent: () => import('./pages/novo-processo.component').then(m => m.NovoProcessoNovaComponent) },
  { path: 'packlist', loadComponent: () => import('./pages/packlist.component').then(m => m.PacklistNovaComponent) },
  { path: 'custo', loadComponent: () => import('./pages/custo.component').then(m => m.CustoNovaComponent) },
  { path: 'venda', loadComponent: () => import('./pages/venda.component').then(m => m.VendaNovaComponent) },
  { path: 'aduana', loadComponent: () => import('./pages/aduana.component').then(m => m.AduanaNovaComponent) },
  { path: 'aduana/atualizar', loadComponent: () => import('./pages/aduana-atualizar.component').then(m => m.AduanaAtualizarNovaComponent) },
  { path: 'numerario', loadComponent: () => import('./pages/numerario.component').then(m => m.NumerarioNovaComponent) },
  { path: 'numerario/historico', loadComponent: () => import('./pages/numerario-historico.component').then(m => m.NumerarioHistoricoNovaComponent) },
  { path: 'fechamento', loadComponent: () => import('./pages/fechamento.component').then(m => m.FechamentoNovaComponent) },
  { path: 'historico', loadComponent: () => import('./pages/historico.component').then(m => m.HistoricoNovaComponent) }
];
