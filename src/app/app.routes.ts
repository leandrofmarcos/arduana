import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [() => import('./core/auth/auth.guard').then(m => m.authGuard)],
    loadComponent: () => import('./core/layout/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'aliquotas'
      },
      {
        path: 'aliquotas',
        loadComponent: () => import('./features/aliquotas/pages/aliquotas.component').then(m => m.AliquotasComponent)
      },
      {
        path: 'portos',
        loadComponent: () => import('./features/portos/pages/portos.component').then(m => m.PortosComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/pages/clientes.component').then(m => m.ClientesComponent)
      },
      {
        path: 'despachantes',
        loadComponent: () => import('./features/despachantes/pages/despachantes.component').then(m => m.DespachantesComponent)
      },
      {
        path: 'orcamento',
        loadChildren: () => import('./features/orcamento/orcamento.routes').then(m => m.ORCAMENTO_ROUTES)
      },
      {
        path: 'packlist',
        loadComponent: () => import('./features/packlist/pages/packlist.component').then(m => m.PacklistNovaComponent)
      },
      {
        path: 'custo',
        loadComponent: () => import('./features/custo/pages/custo.component').then(m => m.CustoNovaComponent)
      },
      {
        path: 'venda',
        loadComponent: () => import('./features/venda/pages/venda.component').then(m => m.VendaNovaComponent)
      },
      {
        path: 'aduana',
        loadComponent: () => import('./features/aduana/pages/aduana.component').then(m => m.AduanaNovaComponent)
      },
      {
        path: 'aduana/atualizar',
        loadComponent: () => import('./features/aduana/pages/aduana-atualizar.component').then(m => m.AduanaAtualizarNovaComponent)
      },
      {
        path: 'numerario',
        loadComponent: () => import('./features/numerario/pages/numerario.component').then(m => m.NumerarioNovaComponent)
      },
      {
        path: 'numerario/historico',
        loadComponent: () => import('./features/numerario/pages/numerario-historico.component').then(m => m.NumerarioHistoricoNovaComponent)
      },
      {
        path: 'fechamento',
        loadComponent: () => import('./features/fechamento/pages/fechamento.component').then(m => m.FechamentoNovaComponent)
      },
      {
        path: 'historico',
        loadComponent: () => import('./features/historico/pages/historico.component').then(m => m.HistoricoNovaComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
