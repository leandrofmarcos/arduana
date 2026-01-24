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
        redirectTo: 'aliquotas'
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
        path: 'despachantes',
        loadComponent: () => import('./features/despachantes/despachantes.component').then(m => m.DespachantesComponent)
      },
      {
        path: 'orcamento',
        loadChildren: () => import('./features/orcamento/orcamento.routes').then(m => m.ORCAMENTO_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
