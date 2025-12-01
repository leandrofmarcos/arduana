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
        redirectTo: 'importacao'
      },
      {
        path: 'importacao',
        loadComponent: () => import('./features/planilha/planilha.component').then(m => m.PlanilhaComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
