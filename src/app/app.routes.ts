import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [() => import('./core/auth/auth.guard').then(m => m.authGuard)],
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'planilhas'
      },
      {
        path: 'planilhas',
        loadComponent: () => import('./features/planilhas/planilhas.component').then(m => m.PlanilhasComponent)
      },
      {
        path: 'processos',
        loadComponent: () => import('./features/planilhas/planilhas.component').then(m => m.PlanilhasComponent)
      },
      {
        path: 'processos/:id/versoes',
        loadComponent: () => import('./features/processos/versoes.component').then(m => m.VersoesProcessoComponent)
      },
      {
        path: 'processos/:id/comparar',
        loadComponent: () => import('./features/processos/comparar.component').then(m => m.CompararVersoesComponent)
      },
      {
        path: 'aliquotas',
        loadComponent: () => import('./features/aliquotas/aliquotas.component').then(m => m.AliquotasComponent)
      },
      {
        path: 'portos',
        loadComponent: () => import('./features/portos/portos.component').then(m => m.PortosComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/clientes.component').then(m => m.ClientesComponent)
      },
      {
        path: 'importacao',
        loadComponent: () => import('./features/planilha/planilha.component').then(m => m.PlanilhaComponent)
      },
      {
        path: 'fechamento',
        loadComponent: () => import('./features/fechamento/fechamento.component').then(m => m.FechamentoComponent),
        canActivate: [() => import('./core/auth/role.guard').then(m => m.roleGuard)],
        data: { roles: ['admin','despachante'] }
      },
      {
        path: 'numerario',
        loadComponent: () => import('./features/numerario/numerario.component').then(m => m.NumerarioComponent),
        canActivate: [() => import('./core/auth/role.guard').then(m => m.roleGuard)],
        data: { roles: ['admin','despachante'] }
      },
      {
        path: 'processos/:id/numerario',
        loadComponent: () => import('./features/numerario/numerario.component').then(m => m.NumerarioComponent)
      },
      {
        path: 'venda',
        loadComponent: () => import('./features/venda/venda.component').then(m => m.VendaComponent),
        canActivate: [() => import('./core/auth/role.guard').then(m => m.roleGuard)],
        data: { roles: ['admin','cliente'] }
      },
      {
        path: 'anexos',
        loadComponent: () => import('./features/anexos/anexos.component').then(m => m.AnexosComponent),
        canActivate: [() => import('./core/auth/role.guard').then(m => m.roleGuard)],
        data: { roles: ['admin','despachante','cliente'] }
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
