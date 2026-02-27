import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './features/auth/auth.providers';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/aduana/pages/aduana.component').then(m => m.AduanaNovaComponent)
      },
      {
        path: 'processos',
        loadComponent: () => import('./features/dashboard/pages/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'dashboard',
        redirectTo: 'processos',
        pathMatch: 'full'
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
        path: 'funcionarios',
        loadComponent: () => import('./features/funcionarios/pages/funcionarios.component').then(m => m.FuncionariosComponent)
      },
      {
        path: 'templates-packlist',
        loadComponent: () => import('./features/templates-packlist/components/templates-packlist.component').then(m => m.TemplatesPacklistComponent)
      },
      {
        path: 'packlist/:id',
        loadComponent: () => import('./features/packlist/pages/packlist-detail-new.component').then(m => m.PacklistDetalheComponent)
      },
      {
        path: 'custo/:id',
        loadComponent: () => import('./features/custo/pages/custo-detail.component').then(m => m.CustoDetailComponent)
      },
      {
        path: 'orcamento',
        loadChildren: () => import('./features/orcamento/orcamento.routes').then(m => m.ORCAMENTO_ROUTES)
      },
      {
        path: 'aduana',
        loadComponent: () => import('./features/aduana/pages/aduana.component').then(m => m.AduanaNovaComponent)
      },
      {
        path: 'historico',
        loadComponent: () => import('./features/historico/pages/historico.component').then(m => m.HistoricoNovaComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/auth/pages/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
