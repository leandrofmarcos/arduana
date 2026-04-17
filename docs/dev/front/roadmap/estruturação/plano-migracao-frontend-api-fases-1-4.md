# Plano de Migração Frontend -> API Comex133 (Fases 1 a 4)

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

## Fase 4 — Migração do Fluxo Operacional (Backend Fase 4)

**Objetivo:** conectar o fluxo fim a fim do processo operacional no frontend usando API real.

### ATI-12 — SolicitacaoOrcamento (incremento inicial)
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

### ATI-13 — CustoDespachante (próximo incremento)
- Migrar wizard de 4 etapas para API.
- Persistir itens LI, despesas e status de forma transacional.

**Critério de aceite:** custo salvo e reaberto sem inconsistência entre etapas.

---

### ATI-14 — OrcamentoVenda
- Integrar geração e edição de orçamento vinculada à solicitação/custo.
- Validar totais, composição de despesas e status.

**Critério de aceite:** orçamento reproduz cálculos esperados e mantém vínculo com origem.

---

### ATI-15 — EmbarqueAduana e ControleNavio
- Integrar timeline de status de embarque.
- Integrar vínculo com controle de navio e dados logísticos.

**Critério de aceite:** evolução de status refletida corretamente no dashboard e acompanhamento.

---

### ATI-16 — Documentos
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
4. Fase 4 — Fluxo operacional incremental (Solicitação -> Custo -> Orçamento -> Embarque -> Documentos).

Essa ordem reduz risco, permite validação contínua no app e evita retrabalho estrutural ao longo da migração.
