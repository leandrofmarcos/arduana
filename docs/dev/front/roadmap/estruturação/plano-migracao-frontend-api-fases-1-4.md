# Plano de Migração Frontend -> API Comex133 (Fases 1 a 6)

> **Projeto:** import-costs (Angular V2)  
> **Objetivo:** migrar o frontend de localStorage para API real, com autenticação JWT, cadastros e fluxo operacional completos  
> **Ambiente alvo (publicado):** http://www.viaveritascomex.com.br  
> **Base da API para frontend:** http://www.viaveritascomex.com.br/api  
> **Swagger de apoio:** http://www.viaveritascomex.com.br/swagger  
> **Estratégia de rollout:** incremental por fase, com feature flag por módulo e validação funcional no próprio app

---

## Diretrizes de Boas Práticas

- Manter contrato tipado para toda chamada HTTP (DTO de request/response por feature).
- Centralizar autenticação (token, refresh, logout) em um único serviço e interceptor.
- Não acessar localStorage direto nos componentes; usar camada de sessão e serviços de domínio.
- Migrar tela por tela com fallback controlado (API primeiro, fallback apenas quando explicitamente habilitado).
- Padronizar tratamento de erro de API (401, 403, 404, 422, 500) com mensagem amigável e rastreável.
- Garantir que toda listagem use paginação no padrão do backend.
- Validar cada fase com checklist de aceite antes de avançar.

---

## Arquitetura-Alvo no Frontend

```
src/app/
  core/
    api/
      api-client.service.ts
      api-endpoints.ts
      api-error.mapper.ts
    auth/
      auth.service.ts
      auth-session.service.ts
      auth.guard.ts
      auth.interceptor.ts
      role.guard.ts
    config/
      runtime-config.service.ts
  v2/
    features/
      [feature]/
        data/      // acesso HTTP da feature
        domain/    // regras locais da feature
        models/    // DTOs e modelos de UI
        pages/
```

---

## Fase 1 — Login, Sessão e Segurança (Base da Sustentação)

**Objetivo:** colocar o frontend autenticando na API real, com token JWT funcionando em toda navegação.

### ATI-01 — Configurar URL base da API por ambiente
- Adicionar configuração para `http://www.viaveritascomex.com.br/api` em produção.
- Permitir override para localhost em desenvolvimento.

**Critério de aceite:** frontend consegue alternar ambiente sem alterar código de componente.

---

### ATI-02 — Implementar AuthService com endpoints reais
- Integrar:
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Salvar sessão em serviço central (`accessToken`, `refreshToken`, expiração, usuário).

**Critério de aceite:** login válido retorna sessão ativa e usuário autenticado na UI.

---

### ATI-03 — Criar interceptor de autenticação
- Injetar `Authorization: Bearer <token>` em chamadas autenticadas.
- Tratar 401 com tentativa de refresh uma vez.
- Em falha de refresh: limpar sessão e redirecionar para login.

**Critério de aceite:** token expirado renova automaticamente sem quebrar a tela.

---

### ATI-04 — Guards de rota e proteção por perfil
- `AuthGuard`: bloqueia acesso sem sessão.
- `RoleGuard`: restringe rotas administrativas para role `Admin`.

**Critério de aceite:** acesso sem login redireciona para tela de autenticação; acesso sem role correta retorna fluxo de autorização negada.

---

### ATI-05 — Tela de login com UX de erro padronizada
- Formulário com validação de email/senha.
- Mensagens amigáveis para 401 e indisponibilidade.
- Botão de sair chamando `logout` real.

**Critério de aceite:** fluxo completo login -> home -> logout funcionando no app publicado.

---

## Fase 2 — Infra de Integração (Padrão para todas as features)

**Objetivo:** criar base técnica única para reduzir retrabalho na migração dos módulos.

### ATI-06 — ApiClientService e padrão de resposta
- Centralizar GET/POST/PUT/PATCH/DELETE com tipagem.
- Normalizar envelope `ApiResponse`.
- Centralizar headers e timeout.

**Critério de aceite:** nenhuma feature nova chama `HttpClient` diretamente fora da camada data.

---

### ATI-07 — Componente de paginação e contrato único
- Adaptar listagens para query params:
  - `page`
  - `pageSize`
- Consumir `PagedResult<T>`:
  - `items`, `totalCount`, `page`, `pageSize`, `totalPages`, `hasNextPage`, `hasPreviousPage`

**Critério de aceite:** listas de teste já exibem paginação real da API.

---

### ATI-08 — Tratamento global de erro e observabilidade frontend
- Mapear erros por status HTTP para mensagens de domínio.
- Log de erros de integração (contexto de endpoint e payload sanitizado).
- Banner/toast padrão para falhas recuperáveis.

**Critério de aceite:** erros não quebram tela; usuário recebe orientação clara.

---

## Fase 3 — Migração dos Cadastros Base (Backend Fase 3)

**Objetivo:** migrar os cadastros administrativos para API real sem perda de produtividade da operação.

### ATI-09 — Prioridade de migração dos módulos
Ordem recomendada:
1. Portos de Origem
2. Portos de Destino
3. Clientes
4. Importadores
5. Exportadores
6. Agentes de Carga
7. Fabricantes
8. Despachantes
9. NCMs
10. Lista Preço LCL
11. Despesas Catálogo
12. Modelos de Despesa

---

### ATI-10 — Para cada cadastro, executar o mesmo playbook
- Criar serviço data da feature (API).
- Migrar listagem para paginação real.
- Migrar CRUD (create/update/delete/ativo).
- Remover dependência de seed localStorage daquela feature.
- Validar filtros e ordenação com dados da API.

**Critério de aceite por cadastro:** CRUD completo funcional no app, sem uso de storage local para a entidade.

---

### ATI-11 — Migração de Parametros, Usuarios e Roles
- Ajustar consumo dos endpoints já padronizados e paginados.
- Garantir telas de administração com proteção por role.

**Critério de aceite:** administração funcional e protegida por sessão JWT.

---

### ATI-11B — Remoção completa de persistência local e seed no frontend (incremento Fase 3)
- Remover uso de `localStorage` para dados do módulo V2.
- Migrar serviços de cadastros da Fase 3 para consumo API-first:
  - Portos de Origem
  - Portos de Destino
  - Clientes
  - Importadores
  - Exportadores
  - Agentes de Carga
  - Fabricantes
  - Despachantes
  - NCMs
  - Lista Preço LCL
  - Despesas Catálogo
  - Modelos de Despesa
- Desativar seed local automático no shell/layout.
- Desativar seed demo e carga de dados fictícios no dashboard.
- Manter helper legado de storage apenas como memória volátil (sem persistência local).

**Critério de aceite:**
- Nenhuma entidade da Fase 3 grava em `localStorage`.
- Cadastros da Fase 3 são carregados por comunicação HTTP com a API.
- Reiniciar navegador não reaproveita dados locais persistidos do V2.

---

## Fase 4 — Administração Completa (Roles e Usuários)

**Objetivo:** implementar o módulo administrativo completo via telas, com integração 100% API para Roles e Usuários, mantendo segurança por perfil Admin.

### ATI-12 — Mapeamento de contrato e arquitetura do módulo administrativo
- Consolidar contratos reais da API backend para administração:
  - `api/roles` (CRUD completo)
  - `api/usuarios` (CRUD + ativação + senha + atribuição de roles)
- Definir modelos frontend tipados para requests e responses:
  - `RoleDto`, `CreateRoleRequest`, `UpdateRoleRequest`
  - `UsuarioDto`, `CreateUsuarioRequest`, `UpdateUsuarioRequest`, `AtivoRequest`, `AtribuirRolesRequest`, `AlterarSenhaAdminRequest`
- Definir pasta e padrão por feature:
  - `v2/features/administracao/roles/{models,data,pages}`
  - `v2/features/administracao/usuarios/{models,data,pages}`

**Critério de aceite:** contratos de frontend alinhados aos DTOs reais do backend e sem campos ambíguos.

---

### ATI-13 — Tela completa de Roles (CRUD)
- Implementar listagem paginada de roles:
  - `GET /api/roles?page={page}&pageSize={pageSize}`
- Implementar detalhe:
  - `GET /api/roles/{id}`
- Implementar criação:
  - `POST /api/roles`
- Implementar edição:
  - `PUT /api/roles/{id}`
- Implementar exclusão:
  - `DELETE /api/roles/{id}`
- Regras de UX:
  - confirmação antes de excluir
  - feedback visual para sucesso/erro
  - validação de formulário para `nome` obrigatório

**Critério de aceite:** CRUD de roles funcional em tela, com paginação real e validações de erro da API.

---

### ATI-14 — Tela completa de Usuários (CRUD + operações administrativas)
- Implementar listagem paginada de usuários:
  - `GET /api/usuarios?page={page}&pageSize={pageSize}`
- Implementar detalhe:
  - `GET /api/usuarios/{id}`
- Implementar criação de usuário:
  - `POST /api/usuarios`
- Implementar edição de dados básicos:
  - `PUT /api/usuarios/{id}`
- Implementar ativar/desativar:
  - `PATCH /api/usuarios/{id}/ativo`
- Implementar atribuição de roles:
  - `PUT /api/usuarios/{id}/roles`
- Implementar redefinição de senha por Admin:
  - `PATCH /api/usuarios/{id}/senha`
- Implementar exclusão:
  - `DELETE /api/usuarios/{id}`
- Suporte de visualização de roles no grid e no detalhe.

**Critério de aceite:** administração de usuários completa via interface, incluindo ciclo de vida e vínculo com roles.

---

### ATI-15 — Navegação administrativa, segurança e autorização de tela
- Criar rotas dedicadas para administração:
  - `/admin/roles`
  - `/admin/usuarios`
- Aplicar `AuthGuard` + `RoleGuard` (Admin) nas rotas administrativas.
- Garantir ocultação de menus administrativos para usuários não Admin.
- Exibir mensagem de acesso negado (403) quando aplicável.

**Critério de aceite:** somente Admin acessa e visualiza o módulo administrativo completo.

---

### ATI-16 — Qualidade, testes funcionais e prontidão de entrega do módulo administrativo
- Testar cenários positivos e negativos de Roles e Usuários:
  - validação de campos obrigatórios
  - conflito de dados
  - acesso sem permissão
- Validar paginação, filtros e atualização de estado na tela sem refresh manual.
- Padronizar mapeamento de erros para mensagens amigáveis (400/401/403/404/422/500).
- Remover qualquer dependência residual de storage local para features administrativas novas.

**Critério de aceite:** módulo administrativo pronto para homologação com cobertura funcional mínima documentada.

---

## Fase 5 — Remoção Completa do Legado V1 (Descomissionamento)

**Objetivo:** eliminar dependências, rotas, componentes e artefatos de UI da versão legada (V1), mantendo somente a V2 como base oficial da aplicação.

### Baseline técnico validado (estado atual do frontend)
- O acesso à V1 está centralizado no bloco de rota `path: 'legacy'` em `app.routes.ts`.
- A entrada para V1 ainda está visível na V2 pelo item de menu `routerLink="/legacy"` em `shell-v2.component.ts`.
- O layout da V1 está concentrado em `core/layout/shell.component.ts`.
- As telas V1 são carregadas dentro do bloco `/legacy` (dashboard, alíquotas, portos, clientes, despachantes, funcionários, templates packlist, custo, orçamentos, aduana, histórico e profile).
- Não foi identificado acoplamento direto de imports entre `src/app/v2/**` e `src/app/features/**`.
- Ponto crítico identificado: o link de perfil da V2 usa `routerLink="/profile"`, porém a rota `profile` hoje está dentro do bloco legado; a remoção da V1 exige criar rota de perfil própria para V2 antes de desativar o legado.

### Escopo seguro de remoção (o que NÃO remover)
- Não remover a feature de autenticação em `src/app/features/auth/**` (é usada pela aplicação atual para login/sessão/guards).
- Não remover `core/api/**` e serviços de integração usados pela V2.
- Não remover componentes/páginas da V2 em `src/app/v2/**`.
- Não remover rotas administrativas/operacionais da V2 já ativas.

### ATI-17 — Inventário e mapeamento de impactos do legado V1
- Mapear tudo que ainda referencia V1 no frontend:
  - rotas e redirecionamentos para `/legacy`
  - componentes/layouts da V1
  - serviços e models exclusivos da V1
  - links de menu para telas legadas
- Registrar matriz de dependências para cada item legado:
  - origem da referência
  - destino
  - ação (remover, substituir, manter temporariamente)
- Classificar itens por tipo:
  - remoção imediata
  - migração necessária para V2
  - desativação temporária controlada por flag

**Critério de aceite:** inventário completo validado e sem referência órfã não catalogada.

---

### ATI-18 — Remover acesso de navegação ao legado
- Pré-requisito obrigatório: criar rota de perfil fora do bloco legado para não quebrar o link de perfil da V2.
- Remover link “Versão Legada (V1)” da navegação.
- Remover rotas públicas/internas de entrada na V1.
- Garantir redirecionamento seguro para V2 quando houver acesso a paths antigos (`/legacy` e filhos).

**Critério de aceite:** usuário não acessa mais telas da V1 por menu nem por rota antiga ativa.

---

### ATI-19 — Desacoplar e remover artefatos técnicos da V1
- Remover componentes, páginas e módulos V1 não utilizados.
- Remover serviços e helpers exclusivos V1 sem uso na V2.
- Limpar imports, providers e referências de build ligados à V1.
- Preservar explicitamente os artefatos compartilhados não-legados (auth, api client, guards e contratos em uso da V2).
- Manter apenas os contratos necessários para compatibilidade temporária (se houver), com data de expiração definida.

**Critério de aceite:** código legado V1 não participa mais do fluxo de execução da aplicação.

---

### ATI-20 — Limpeza de configuração e documentação pós-remoção
- Atualizar documentação técnica indicando V2 como única versão ativa.
- Atualizar mapa de rotas oficial sem referências V1.
- Remover observações de convivência V1/V2 dos documentos de operação.

**Critério de aceite:** documentação e configuração refletem exclusivamente a arquitetura V2.

---

### ATI-21 — Validação final de regressão pós-descomissionamento
- Executar smoke test de navegação nas principais áreas V2.
- Validar autenticação, autorização e menu sem qualquer quebra por remoção da V1.
- Validar acesso ao perfil na V2 após desacoplamento da rota legada.
- Validar build sem warnings críticos relacionados a imports órfãos do legado.
- Executar busca por referências residuais (`/legacy`, `shell.component`, imports de `src/app/features/*` não compartilhados).

**Critério de aceite:** aplicação estável após remoção da V1, sem regressões funcionais críticas.

---

## Fase 6 — Migração do Fluxo Operacional (Backend Fase 4)

**Objetivo:** conectar o fluxo fim a fim do processo operacional no frontend usando API real.

### ATI-22 — SolicitacaoOrcamento (incremento inicial)
- Integrar endpoints já entregues:
  - `GET /api/solicitacoes-orcamento`
  - `POST /api/solicitacoes-orcamento`
  - `GET /api/solicitacoes-orcamento/{id}`
  - `PATCH /api/solicitacoes-orcamento/{id}/status`
  - `GET/POST/DELETE /api/solicitacoes-orcamento/{id}/despachantes`
  - `GET/POST/DELETE /api/solicitacoes-orcamento/{id}/documentos`
- Ajustar fluxo de criação/edição e vínculo de despachantes/documentos.

**Critério de aceite:** criar solicitação, vincular despachante e documento, listar e detalhar no app.

---

### ATI-23 — CustoDespachante (próximo incremento)
- Migrar wizard de 4 etapas para API.
- Persistir itens LI, despesas e status de forma transacional.

**Critério de aceite:** custo salvo e reaberto sem inconsistência entre etapas.

---

### ATI-24 — OrcamentoVenda
- Integrar geração e edição de orçamento vinculada à solicitação/custo.
- Validar totais, composição de despesas e status.

**Critério de aceite:** orçamento reproduz cálculos esperados e mantém vínculo com origem.

---

### ATI-25 — EmbarqueAduana e ControleNavio
- Integrar timeline de status de embarque.
- Integrar vínculo com controle de navio e dados logísticos.

**Critério de aceite:** evolução de status refletida corretamente no dashboard e acompanhamento.

---

### ATI-26 — Documentos
- Integrar gestão de tipo de documento e vínculo por entidade.
- Padronizar upload, listagem e remoção com segurança.

**Critério de aceite:** documento anexado aparece no contexto da entidade correta.

---

## Estratégia de Teste por Fase (Dentro da Aplicação)

### Testes obrigatórios Fase 1
- Login válido e inválido.
- Renovação de token em expiração.
- Logout e bloqueio de rota protegida.

### Testes obrigatórios Fase 3
- CRUD completo de ao menos 3 cadastros críticos (Clientes, Despachantes, NCM).
- Paginação funcionando com mudança de página e tamanho.
- Ativar/desativar refletindo em listagem.

### Testes obrigatórios Fase 4
- Roles: criar, editar, excluir e listar com paginação.
- Usuários: criar, editar, ativar/desativar, atribuir roles, redefinir senha e excluir.
- Bloqueio de acesso para usuário não Admin em rotas administrativas.

### Testes obrigatórios Fase 5
- Não existir entrada de navegação para V1 no menu.
- Rotas legadas retornarem para fluxo V2 definido.
- Build sem referência ativa a componentes da V1 removidos.

### Testes obrigatórios Fase 6
- Fluxo mínimo: Solicitação -> vínculo de despachante -> vínculo de documento.
- Persistência confirmada após recarregar página.
- Tratamento de erro 401/403/404 em tela operacional.

---

## Definição de Pronto para Deploy Frontend

- 100% das telas migradas da fase corrente sem dependência de localStorage.
- Logs de erro de integração sem falhas críticas abertas.
- Guardas de autenticação e autorização ativos em todas as rotas administrativas.
- Checklist de testes da fase executado e registrado.
- Homologação manual no ambiente publicado `http://www.viaveritascomex.com.br` concluída.

---

## Ordem Recomendada de Execução (Sustentável)

1. Fase 1 — Login/JWT completo.
2. Fase 2 — Infra padrão de API e paginação.
3. Fase 3 — Cadastros base por ordem de prioridade.
4. Fase 4 — Administração completa (Roles e Usuários com CRUD e autorização por perfil Admin).
5. Fase 5 — Descomissionamento completo do legado V1.
6. Fase 6 — Fluxo operacional incremental (Solicitação -> Custo -> Orçamento -> Embarque -> Documentos).

Essa ordem reduz risco, permite validação contínua no app e evita retrabalho estrutural ao longo da migração.
