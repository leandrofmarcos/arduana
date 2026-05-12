# Documentação de Referência — Comex133

Este documento reúne regras de negócio, tabelas, fluxos e responsabilidades (backend/front) da aplicação Comex133. Serve como referência completa para desenvolvedores e analistas.

## Sumário
- Visão geral
- Estrutura do repositório
- Responsabilidades: Backend vs Frontend
- Banco de dados: tabelas e relacionamentos
- Regras de negócio e fluxos principais
- Autenticação e autorização
- Middlewares e comportamentos de infra
- Migrations, seeds e inicialização
- Como executar em desenvolvimento
- Pontos de integração e endpoints (resumo de controllers)
- Onde localizar código relevante

---

## 1. Visão geral
Comex133 é um sistema de gestão de importações que cobre cadastros mestres (clientes, importadores, NCM, portos, navios), fluxo operacional (solicitações de orçamento, controle de navios), cálculo e versionamento de custos do despachante e geração de orçamentos de venda.

A arquitetura é separada em duas aplicações no mesmo repositório:
- Backend: comex133_api (ASP.NET Core, Entity Framework Core)
- Frontend: comex133_front (Angular 18, Storybook)

## 2. Estrutura do repositório (relevante)
- comex133_api/: backend (C#)
  - Core/: middleware, extensões, DbContext, auth, database seeds
  - Domain/Entities/: classes de entidade (mapeamento para tabelas)
  - Controllers/: endpoints REST (ex: AuthController, UsuariosController, OrcamentosVendaController, CustosDespachanteController, etc.)
  - Features/: serviços, DTOs e validators por funcionalidade
  - Migrations/: EF migrations
  - Program.cs: inicialização, middlewares, swagger, CORS, autenticação
- comex133_front/: frontend (Angular)
  - package.json: scripts (ng serve, build, storybook)
  - storybook-stories/: componentes de UI

## 3. Responsabilidades
Backend (comex133_api):
- Expor API REST (rotas em /api/*) com controllers por área funcional
- Validação de entrada (FluentValidation) e padronização de respostas (ApiResponse)
- Autenticação JWT + refresh tokens
- Persistência via EF Core e SQL Server (AppDbContext)
- Regras de negócio críticas: geração e versionamento de custos, regras de negócio do fluxo operacional, índices/uniqueness e integridade referencial
- Middlewares: logging de requests, tratamento de exceções, rate-limit de login
- Seeds e migrations automatizados na inicialização

Frontend (comex133_front):
- Interface de usuário (SPA Angular)
- Consumo de API REST do backend
- Storybook para componentes isolados
- Suporte a SSR (scripts indicados em package.json)

## 4. Banco de dados: tabelas principais (resumo)
As entidades são registradas em AppDbContext. Principais DbSets:
- ParametrosSistema (ParametrosSistema)
- Roles, Usuarios, UsuarioRoles, RefreshTokens, UsuarioVinculos
- PortosOrigem, PortosDestino
- Cliente, Importador, Exportador, AgenteCarga, Fabricante, Despachante
- Ncm, ListaPrecoLcl, DespesaCatalogo, ModeloDespesa (+ Itens)
- SolicitacaoOrcamento, SolicitacaoOrcamentoDespachante, SolicitacaoOrcamentoDocumento
- ControleNavio, ControleNavioTrajeto
- Navio, NavioTrajeto, EmbarqueNavioVinculo
- CustoDespachante, CustoDespachanteLi, CustoDespachanteDespesa, NcmVinculadoCusto, ValorImpostoCusto
- OrcamentoVenda, OrcamentoVendaDespesa, OrcamentoVendaDespesaExtra, OrcamentoVendaCusto

Observações estruturais importantes (constraints / índices):
- Muitos índices únicos: ParametroSistema.Chave; Usuario.Email; RefreshToken.Token; Ncm.CodigoNcm; ControleNavio.NumeroViagem; SolicitacaoOrcamento.CodigoInterno; CustoDespachante.CodigoInterno; OrcamentoVenda.CodigoInterno
- Chaves compostas: UsuarioRole (UsuarioId, RoleId)
- Relações com OnDelete setadas: Cascade para dependências fortes (ex: itens de modelos, despesas de orçamento) e Restrict para referências que não devem ser apagadas automaticamente (ex: Cliente, Importador em SolicitacaoOrcamento)
- Auto-timestamps: SaveChanges() populates CriadoEm/AtualizadoEm (via IHasTimestamps) e campos específicos (AtribuidoEm, AdicionadoEm, etc.)
- Versionamento: CustoDespachante possui referência para VersaoAnterior (self-FK) para controle de versões e histórico (OnDelete SetNull)

## 5. Regras de negócio & fluxos principais
Fluxo: Solicitação de Orçamento → Custos do Despachante → Orçamento de Venda
- Uma SolicitacaoOrcamento é criada com metadados (cliente, importador, portos, NCMs associados via regras de calculo)
- Para cada solicitação, podem ser vinculados diversos Despachantes (SolicitacaoOrcamentoDespachante) — cada despachante pode gerar um CustoDespachante
- CustoDespachante contém linhas (Li), despesas e NCMs vinculados; cada NcmVinculadoCusto pode ter múltiplos ValorImpostoCusto
- CustoDespachante suporta versionamento: ao criar nova versão, VersaoAnteriorId liga ao registro anterior; histórico preservado
- OrcamentoVenda é gerado a partir de combinação de CustosDespachante e regras comerciais (margens, despesas extras), cada OrcamentoVenda referencia o CustoDespachante onde aplicável

Regras de integridade/negócio extra:
- Unicidade de códigos internos (CodigoInterno) evita duplicação de entidades operacionais
- Campos obrigatórios validados por FluentValidation nas Features correspondentes
- Deleções: remoção de entidades com dependentes geralmente é bloqueada (Restrict) ou desencadeia remoção em cascata quando apropriado (ex: itens dependentes)

## 6. Autenticação e autorização
- JWT access tokens + refresh tokens
- Endpoints de auth: /api/auth/login, /api/auth/refresh, /api/auth/logout, /api/auth/me
- Refresh tokens persistidos em tabela RefreshTokens com índice único no token
- AuthService implementa login, refresh, logout, cleanup de tokens expirados
- Program.cs aplica AddJwtAuthentication e UseAuthentication/UseAuthorization
- Swagger configurado para suportar Bearer JWT (security definition)

## 7. Middlewares e comportamento de infra
- RequestLoggingMiddleware: registra requests e respostas (para auditoria/diagnóstico)
- ExceptionHandlingMiddleware: padroniza erros (ApiResponse) e loga exceções
- LoginRateLimitMiddleware: limita tentativas de login (mitigar brute-force)
- ApiKeyMiddleware: existe para rotas/integrações que usem chaves (se configurado)
- Forwarded headers configurados para compatibilidade com reverse proxies
- CORS: política "AllowAngular" configurada para permitir localhost em dev e origens configuradas em produção

## 8. Migrations, seeds e inicialização
- Migrations armazenadas em comex133_api/Migrations (várias, com seeds de fases)
- DbInitializer.Initialize(context, logger) aplicado no startup para migrar e semear dados (navios, roles default, etc.)
- Seeds organizados por fases (Phase3, Phase4, Phase5)
- A inicialização também executa limpeza de refresh tokens expirados via AuthService.CleanupExpiredTokensAsync

## 9. Como executar localmente (dev)
Backend (dev):
- Porta padrão em dev: http://localhost:5001 (Program.cs)
- Requisitos: .NET 8+ (compatível com projeto), SQL Server configurado no appsettings
- Ao iniciar, migrations e seeds são aplicados automaticamente
- Swagger disponível em /swagger

Frontend (dev):
- Comandos (na pasta comex133_front):
  - npm install
  - npm run start (ng serve)
  - npm run storybook
- Suporta SSR (scripts indicados em package.json)

CORS: em desenvolvimento a API permite origens localhost automaticamente (qualquer porta HTTP localhost)

## 10. Endpoints e controllers (resumo)
Controllers disponíveis (arquivo controllers/):
- AuthController (api/auth): login/refresh/logout/me
- UsuariosController, UsuarioVinculosController
- RolesController
- PortosOrigemController, PortosDestinoController
- ParametrosController
- OrcamentosVendaController
- NcmsController
- NaviosController
- ModelosDespesaController
- LogisticaController
- ListaPrecoLclController
- ImportadoresController, ExportadoresController
- HealthController
- FabricantesController
- EmbarqueNavioVinculoController
- DespesasCatalogoController
- DespachantesController
- CustoDespachanteController
- ControleNaviosController
- ClientesController
- AgentesCargaController
- (e outros listados em Controllers/)

Cada controller delega validação/negócio para classes em Features/*. Ex.: OrçamentosVendaController usa OrçamentosVendaService + validators + DTOs.

## 11. Onde localizar código relevante (mapa rápido)
- Regras/Serviços: comex133_api/Features/<FeatureName>/<FeatureName>Service.cs
- Validators: comex133_api/Features/<FeatureName>/<FeatureName>Validators.cs
- DTOs: comex133_api/Features/<FeatureName>/*Dtos.cs
- Entidades/Modelos: comex133_api/Domain/Entities
- DbContext, Seeds, Migrations: comex133_api/Core/Database
- Middlewares: comex133_api/Core/Middleware
- Startup/Swagger/Auth: Program.cs e Core/Extensions/ServiceCollectionExtensions.cs
- Frontend: comex133_front/src (componentes), storybook-stories/ (exemplos)

## 12. Recomendações e notas finais
- Para entender regras de cálculo de custo, revisar: Features/CustosDespachante/CustosDepachanteService.cs e NcmVinculadoCusto/ValorImpostoCusto
- Para alterações em esquema, criar migration e testar DbInitializer em ambiente local antes de deploy
- Validadores FluentValidation centralizam as regras de entrada — alterar validators ao mudar contratos DTO
- Testar fluxo completo Solicitação → Custo → Orçamento com dados seed (Phase3/4/5) após migrations

---

Arquivo gerado automaticamente a partir da análise do código-fonte. Para dúvidas ou ampliação deste documento (ex.: detalhar cada tabela com colunas e tipos), indicar quais áreas priorizar.
