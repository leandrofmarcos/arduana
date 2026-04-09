import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './features/auth/auth.providers';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login.component').then(m => m.LoginComponent)
  },

  // ─── V1 Legacy — congelada, somente referência visual ────────────────────
  {
    path: 'legacy',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'orcamento/dash'
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

      // Cadastros — Bloco 1
      {
        path: 'portos-origem',
        loadComponent: () => import('./v2/features/cadastros/portos-origem/pages/portos-origem.component').then(m => m.PortosOrigemComponent)
      },
      {
        path: 'exportadores',
        loadComponent: () => import('./v2/features/cadastros/exportadores/pages/exportadores.component').then(m => m.ExportadoresComponent)
      },
      {
        path: 'agentes-carga',
        loadComponent: () => import('./v2/features/cadastros/agentes-carga/pages/agentes-carga.component').then(m => m.AgentesCargaComponent)
      },
      {
        path: 'fabricantes',
        loadComponent: () => import('./v2/features/cadastros/fabricantes/pages/fabricantes.component').then(m => m.FabricantesComponent)
      },
      {
        path: 'ncm',
        loadComponent: () => import('./v2/features/cadastros/ncm/pages/ncm.component').then(m => m.NcmComponent)
      },
      {
        path: 'lista-preco-lcl',
        loadComponent: () => import('./v2/features/cadastros/lista-preco-lcl/pages/lista-preco-lcl.component').then(m => m.ListaPrecoLclComponent)
      },
      {
        path: 'portos-destino',
        loadComponent: () => import('./v2/features/cadastros/portos-destino/pages/portos-destino.component').then(m => m.PortosDestinoComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./v2/features/cadastros/clientes/pages/clientes-v2.component').then(m => m.ClientesV2Component)
      },
      {
        path: 'importadores',
        loadComponent: () => import('./v2/features/cadastros/importadores/pages/importadores.component').then(m => m.ImportadoresComponent)
      },
      {
        path: 'despachantes',
        loadComponent: () => import('./v2/features/cadastros/despachantes/pages/despachantes-v2.component').then(m => m.DespachantesV2Component)
      },

      // Administração — Etapa 3
      {
        path: 'cargos',
        loadComponent: () => import('./v2/features/administracao/cargos/pages/cargos.component').then(m => m.CargosComponent)
      },
      {
        path: 'niveis-acesso',
        loadComponent: () => import('./v2/features/administracao/niveis-acesso/pages/niveis-acesso.component').then(m => m.NiveisAcessoComponent)
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
        loadComponent: () => import('./v2/features/cadastros/despesas-cadastro/pages/despesas-cadastro.component').then(m => m.DespesasCadastroComponent)
      },
      {
        path: 'modelos-despesa',
        loadComponent: () => import('./v2/features/cadastros/modelos-despesa/pages/modelos-despesa.component').then(m => m.ModelosDespesaComponent)
      },
      {
        path: 'solicitacoes',
        loadComponent: () => import('./v2/features/solicitacao-orcamento/pages/solicitacao-orcamento.component').then(m => m.SolicitacaoOrcamentoComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
