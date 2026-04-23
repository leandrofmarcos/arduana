import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './features/auth/auth.providers';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login.component').then(m => m.LoginComponent)
  },

  // ─── V2 — sistema novo ────────────────────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./v2/core/layout/shell-v2.component').then(m => m.ShellV2Component),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./v2/features/dashboard/dashboard.component').then(m => m.DashboardV2Component)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/auth/pages/profile.component').then(m => m.ProfileComponent)
      },

      // Cadastros — Bloco 1
      {
        path: 'portos-origem',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/portos-origem/pages/portos-origem.component').then(m => m.PortosOrigemComponent)
      },
      {
        path: 'exportadores',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/exportadores/pages/exportadores.component').then(m => m.ExportadoresComponent)
      },
      {
        path: 'agentes-carga',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/agentes-carga/pages/agentes-carga.component').then(m => m.AgentesCargaComponent)
      },
      {
        path: 'fabricantes',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/fabricantes/pages/fabricantes.component').then(m => m.FabricantesComponent)
      },
      {
        path: 'ncm',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/ncm/pages/ncm.component').then(m => m.NcmComponent)
      },
      {
        path: 'lista-preco-lcl',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/lista-preco-lcl/pages/lista-preco-lcl.component').then(m => m.ListaPrecoLclComponent)
      },
      {
        path: 'portos-destino',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/portos-destino/pages/portos-destino.component').then(m => m.PortosDestinoComponent)
      },
      {
        path: 'clientes',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/clientes/pages/clientes-v2.component').then(m => m.ClientesV2Component)
      },
      {
        path: 'importadores',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/importadores/pages/importadores.component').then(m => m.ImportadoresComponent)
      },
      {
        path: 'despachantes',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/despachantes/pages/despachantes-v2.component').then(m => m.DespachantesV2Component)
      },
      {
        path: 'navios',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/navios/pages/navios.component').then(m => m.NaviosComponent)
      },

      // Administração — Etapa 3
      {
        path: 'admin/roles',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/administracao/roles/pages/roles.component').then(m => m.RolesComponent)
      },
      {
        path: 'admin/usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/administracao/usuarios/pages/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'admin/push-test',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/administracao/push-test/push-test.component').then(m => m.PushTestComponent)
      },
      // Logística — Etapa 4
      {
        path: 'controle-navios',
        loadComponent: () => import('./v2/features/logistica/controle-navios/pages/controle-navios.component').then(m => m.ControleNaviosComponent)
      },
      // Custo Despachante — Etapa 5
      {
        path: 'custos',
        loadComponent: () => import('./v2/features/custo-despachante/pages/custo-despachante.component').then(m => m.CustoDespachanteComponent)
      },
      // Orçamento de Venda — Etapa 6
      {
        path: 'orcamentos-venda',
        loadComponent: () => import('./v2/features/orcamento-venda/pages/orcamento-venda.component').then(m => m.OrcamentoVendaComponent)
      },
      // Embarque Aduana — Etapa 7
      {
        path: 'embarques',
        loadComponent: () => import('./v2/features/embarque-aduana/pages/embarque-aduana.component').then(m => m.EmbarqueAduanaComponent)
      },
      // Documentos — Etapa 8
      {
        path: 'documentos',
        loadComponent: () => import('./v2/features/documentos/pages/documentos.component').then(m => m.DocumentosComponent)
      },
      // Despesas e Modelos — Etapa 11
      {
        path: 'despesas-cadastro',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/despesas-cadastro/pages/despesas-cadastro.component').then(m => m.DespesasCadastroComponent)
      },
      {
        path: 'modelos-despesa',
        canActivate: [adminGuard],
        loadComponent: () => import('./v2/features/cadastros/modelos-despesa/pages/modelos-despesa.component').then(m => m.ModelosDespesaComponent)
      },
      {
        path: 'solicitacoes',
        loadComponent: () => import('./v2/features/solicitacao-orcamento/pages/solicitacao-orcamento.component').then(m => m.SolicitacaoOrcamentoComponent)
      }
    ]
  },

  {
    path: 'legacy',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  { path: '**', redirectTo: '' }
];
