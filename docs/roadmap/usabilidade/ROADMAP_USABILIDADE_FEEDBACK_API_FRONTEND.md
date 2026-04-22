# Roadmap de Usabilidade Frontend - Feedback de API

## 1. Objetivo
Padronizar toda a experiencia de comunicacao com API no frontend, com foco em:
- popup de loading (global e por acao)
- mensagens de erro consistentes
- alertas e confirmacoes padronizadas
- paginacao consistente e reutilizavel
- feedback claro ao usuario em sucesso, erro, vazio e reprocessamento

Este documento cobre somente planejamento e rastreabilidade. Nao inicia implementacao.

## 1.1 Status de execucao (atualizado em 2026-04-22)
### Resumo executivo
- Status geral do roadmap: Em andamento
- Backlog macro concluido: 3 de 8 itens (37,5%)
- Fases iniciadas: 3 de 6 (Fases 1, 2 e 3 implementadas)
- Fases concluidas e aprovadas: 0 de 6

### Estatisticas da Fase 1 (piloto: Logistica > Controle de Navios)
- Entregas tecnicas implementadas: 5 de 5 atividades previstas (100% da implementacao tecnica)
- Validacao funcional do usuario: Pendente
- Gate para inicio da Fase 2: Liberado

### Estatisticas da Fase 2 (Cadastros)
- Entregas tecnicas implementadas: 3 de 3 atividades previstas (100% da implementacao tecnica)
- Cobertura de telas do menu Cadastros: 13 de 13 paginas (100%)
- Validacao funcional do usuario: Pendente

### Estatisticas da Fase 3 (Operacao)
- Entregas tecnicas implementadas: 3 de 3 atividades previstas (100% da implementacao tecnica)
- Cobertura de telas alvo: 5 de 5 componentes/paginas (100%)
- Validacao funcional do usuario: Pendente

### Evidencias de implementacao da Fase 2
- Confirm dialog global implementado e integrado no app root
- Remocao de `confirm()` nativo em 13 de 13 paginas de Cadastros
- Padronizacao de toasts de sucesso/erro em operacoes de escrita
- Substituicao de `NotificationService` por `ToastService` nas telas de Cadastros
- Estado de erro com retry aplicado em telas com carga principal paginada (Portos e Navios)
- Build do frontend executado com sucesso apos o rollout da fase

### Evidencias de implementacao da Fase 3
- Remocao de `alert()`/`confirm()` nativos nos fluxos de Operacao
- Confirm dialog padronizado em acoes destrutivas (solicitacao, custo, orcamento, embarque e vinculo de navio)
- Padronizacao de toasts em salvar, remover, finalizar, atualizar status e efetivar pagamento
- Tratamento padronizado para bloqueio de popup em exportacoes
- Build do frontend executado com sucesso apos o rollout da fase

### Registro de fechamento tecnico
- Fase 3 finalizada tecnicamente em 2026-04-22
- Mudancas registradas em commit local na branch de usabilidade
- Proxima fase recomendada: Fase 4 (Administracao e Documentos), condicionada a validacao funcional das Fases 1 a 3

### Evidencias de implementacao da Fase 1
- Loading inline para carga principal da tela
- Loading bloqueante para acoes criticas de escrita
- Substituicao de `alert()`/`confirm()` por dialogs padronizados da feature
- Padronizacao de toasts de sucesso/erro/informacao
- Estado de erro principal com acao de retry
- Build do frontend executado com sucesso apos as alteracoes

## 2. Escopo
### 2.1 Em escopo
- Aplicacao Angular V2 (menu principal completo)
- Fluxos autenticados com chamadas HTTP
- Listagens CRUD e telas operacionais
- Tratamento central de erros e mensagens

### 2.2 Fora de escopo (neste roadmap)
- Refatoracao de regras de negocio backend
- Redesenho visual completo da aplicacao
- Mudancas de autorizacao/perfil

## 3. Diagnostico Atual (revisao do frontend)
### 3.1 Estado atual identificado
- Existe `ToastService` + `ToastContainerComponent` em uso global.
- Existe `NotificationService` paralelo, criando duplicidade de padrao.
- Existe `ApiClientService` e `ApiErrorMapper`, mas o feedback ainda nao e 100% centralizado por feature.
- Existem varios usos de `alert()` e `confirm()` nativos em diversas features.
- Paginacao reutilizavel (`PaginationComponent`) esta implementada, mas uso parcial (nao aplicado em toda a aplicacao).
- Nao existe um loading global padronizado para requisicoes concorrentes.

### 3.2 Impactos na usabilidade
- Feedback inconsistente entre telas para o mesmo tipo de ocorrencia.
- Falta de previsibilidade para usuario durante operacoes longas.
- Confirmacoes nativas sem padrao visual e sem contexto rico.
- Diferencas de comportamento entre listagens com e sem paginacao.

## 4. Padrao Alvo (componentes e contratos)
## 4.1 Componentes e servicos padrao
1. `GlobalLoadingOverlayComponent`
- Overlay global bloqueante para operacoes criticas.
- Exibe mensagem contextual opcional: "Salvando...", "Carregando dados...".

2. `InlineLoadingComponent`
- Placeholder/skeleton para secoes internas (tabela/card).

3. `AppToast` (padrao unico)
- Unificar em um unico servico: manter `ToastService` como oficial.
- Tipos: success, error, warning, info.
- Mensagens com titulo opcional + detalhe curto.

4. `ConfirmDialogComponent`
- Substituir `confirm()` nativo.
- Suporta texto principal, impacto da acao e botoes primario/secundario.

5. `AlertDialogComponent`
- Substituir `alert()` nativo para avisos e bloqueios.

6. `PaginationComponent` (padrao unico)
- Uso obrigatorio para listas > 20 registros ou endpoint paginado.
- Estado vazio padronizado quando sem dados.

## 4.2 Padrao de comunicacao com API
1. Todas as chamadas passam por `ApiClientService`.
2. Erros devem ser mapeados por `ApiErrorMapper` e convertidos em mensagem amigavel.
3. Regras de feedback por tipo de operacao:
- GET lista: loading inline + estado vazio
- GET detalhe: loading inline + fallback de erro com retry
- POST/PUT/PATCH/DELETE: loading bloqueante na acao + toast de sucesso/erro
4. Nao usar `console.error` como feedback visivel ao usuario.
5. Nao usar `alert()` / `confirm()` nativos.

## 5. Estrategia de Implementacao por Fases
## Fase 0 - Preparacao e baseline (planejamento tecnico)
Objetivo: criar infraestrutura base e padrao unico.
Atividades:
- Definir servico oficial de notificacao (unificar ToastService/NotificationService).
- Definir contratos de mensagem (titulo, detalhe, codigo, acao recomendada).
- Definir guideline de UX para loading, erro, sucesso e estado vazio.
Entregaveis:
- ADR curta de decisao tecnica
- checklist de conformidade por tela

## Fase 1 - Piloto para validacao (OBRIGATORIA antes das demais)
Objetivo: implementar em uma feature representativa e validar com usuario.
Feature piloto recomendada: `Logistica > Controle de Navios`.
Justificativa:
- tela com leitura + escrita + acoes criticas
- fluxo com expand/collapse, salvar e feedback operacional
- impacto alto na operacao
Atividades:
- adicionar loading global e inline na feature
- substituir alerts/confirm por dialog padrao
- padronizar toasts de sucesso/erro
- garantir feedback de erro de API com mensagem clara
- revisar estados vazios e retries
Status de execucao da fase:
- Implementacao tecnica concluida
- Em validacao funcional com usuario
Criterios de validacao da fase piloto:
- 100% sem `alert/confirm` nativos na feature
- todas as acoes com feedback visual em <= 300ms
- erros de API mapeados sem mensagem tecnica crua
- aprovacao funcional do usuario
Gate:
- Sem aprovacao da Fase 1, nao iniciar rollout das fases seguintes.

## Fase 2 - Rollout Cadastros (menu Cadastros)
Objetivo: escalar padrao para CRUDs de base.
Cobertura:
- portos origem/destino
- clientes, importadores, exportadores
- agentes de carga, fabricantes, despachantes
- NCM, lista preco LCL, navios
- despesas catalogo, modelos despesa
Atividades:
- aplicar padrao de loading/erro/sucesso
- padronizar paginacao e estado vazio
- remover feedback nativo
Status de execucao da fase:
- Implementacao tecnica concluida
- Em validacao funcional com usuario

## Fase 3 - Rollout Operacao (menu Operacao)
Cobertura:
- solicitacoes
- custos despachante
- orcamentos venda
- embarques e acompanhamento
Atividades:
- padronizar feedback em fluxos longos
- padronizar erro de upload/download e bloqueio popup
- aplicar confirm dialog para acoes destrutivas
Status de execucao da fase:
- Implementacao tecnica concluida
- Em validacao funcional com usuario

## Fase 4 - Rollout Administracao e Documentos
Cobertura:
- cargos, niveis de acesso, roles, usuarios
- documentos e anexos
Atividades:
- padrao completo de mensagens de permissao/erro
- padrao de acoes destrutivas e estados vazios

## Fase 5 - Hardening e conformidade final
Atividades:
- auditoria final por checklist
- testes E2E focados em UX de feedback
- baseline de metricas de erro e tempo de resposta percebido
- ajustes finais e aceite

## 6. Rastreabilidade (macro backlog)
| ID | Fase | Menu/Feature | Tema | Status |
|---|---|---|---|---|
| USAB-001 | 0 | Core | Unificacao ToastService/NotificationService | Planejado |
| USAB-002 | 0 | Core | Contrato de feedback API | Planejado |
| USAB-003 | 1 | Logistica/Controle de Navios | Piloto completo | Implementado (aguardando validacao) |
| USAB-004 | 2 | Cadastros | Padrao loading + erros + paginacao | Implementado (aguardando validacao) |
| USAB-005 | 3 | Operacao | Feedback de fluxos longos e acoes criticas | Implementado (aguardando validacao) |
| USAB-006 | 4 | Administracao | Dialogs e feedback padrao | Planejado |
| USAB-007 | 4 | Documentos | Upload/erro/sucesso padrao | Planejado |
| USAB-008 | 5 | Global | Auditoria e conformidade final | Planejado |

### 6.1 Estatistica de rastreabilidade
- Itens planejados: 8
- Itens implementados (aguardando validacao ou aprovados): 3
- Itens totalmente aprovados: 0
- Percentual de execucao tecnica: 37,5%

## 7. Checklist de conformidade por tela
Cada tela deve cumprir:
- [ ] Nao usa `alert()`
- [ ] Nao usa `confirm()`
- [ ] Exibe loading durante chamadas HTTP
- [ ] Exibe toast de sucesso em operacoes de escrita
- [ ] Exibe erro amigavel em falhas
- [ ] Possui estado vazio padronizado
- [ ] Usa paginacao padrao quando aplicavel
- [ ] Possui acao de retry em falhas de carga principal

### 7.1 Checklist do piloto (Controle de Navios)
- [x] Nao usa `alert()`
- [x] Nao usa `confirm()`
- [x] Exibe loading durante chamadas HTTP
- [x] Exibe toast de sucesso em operacoes de escrita
- [x] Exibe erro amigavel em falhas
- [x] Possui estado vazio padronizado
- [ ] Usa paginacao padrao quando aplicavel (nao aplicavel ao piloto atual)
- [x] Possui acao de retry em falhas de carga principal

Estatistica do checklist piloto:
- Itens aplicaveis ao piloto: 7
- Itens conformes: 7
- Conformidade do piloto (itens aplicaveis): 100%

## 8. Matriz de prioridade (ordem recomendada)
1. Controle de Navios (piloto)
2. Embarques / Solicitacoes / Orcamentos
3. Cadastros com maior volume (Clientes, Despachantes, Navios)
4. Demais cadastros
5. Administracao e Documentos

## 9. Riscos e mitigacao
1. Risco: divergencia de padrao entre times/features
- Mitigacao: checklist obrigatorio em PR + template de PR com itens de usabilidade.

2. Risco: regressao visual em telas antigas
- Mitigacao: rollout por fase e validacao com usuario antes de expandir.

3. Risco: excesso de toasts
- Mitigacao: regra de deduplicacao e prioridade de mensagem.

## 10. Criterios de aceite global do roadmap
- Padrao unico de feedback adotado em toda app V2.
- Zero uso de `alert/confirm` nativo em features V2.
- Paginacao padronizada nas listagens alvo.
- Usuario valida Fase 1 e aprova continuidade por fases.
