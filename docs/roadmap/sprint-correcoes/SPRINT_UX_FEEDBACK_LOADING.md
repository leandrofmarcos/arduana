# Sprint: UX Feedback de Carregamento e Ações

> **Status:** Aguardando aprovação  
> **Data de elaboração:** 2026-05-13  
> **Objetivo:** Garantir que o usuário sempre saiba o que está acontecendo — carregando, salvando, erro ou sucesso — em toda interação com o backend, aplicando padrões consolidados do mercado.

---

## Contexto e Diagnóstico

A aplicação já possui infraestrutura de feedback parcialmente implementada:

| O que já existe | Cobertura |
|---|---|
| `ToastService` (success / error / warning / info) | 100% das telas |
| Tratamento de erro automático no `ApiClientService` | Todas as chamadas HTTP |
| `ConfirmDialogService` para ações destrutivas | ~80% das exclusões |
| Texto "Carregando..." em alguns empty-states | ~30% das listagens |
| `loading = true/false` em algumas telas | ~40% (inconsistente) |

**O que falta e que gera má experiência:**

- Nenhum botão de salvar/confirmar desabilita durante a operação → usuário pode clicar duas vezes e gerar duplicatas
- Dropdowns de lookup (despachante, importador, porto) não sinalizam que estão carregando
- Wizard de Custo Despachante não indica que está salvando entre passos
- Tela de Solicitações exibe texto simples "Carregando solicitações..." sem nenhum indicador visual animado
- Nenhuma tela tem skeleton loader — ao carregar, a área fica em branco ou só com texto
- Erros de rede não oferecem retry imediato visível

---

## Padrões Adotados (referência de mercado)

### 1. Button Loading State
Botão de ação primária (Salvar, Confirmar, Enviar) deve:
- Ficar **desabilitado** durante a operação (`[disabled]="isSaving"`)
- Mostrar um **spinner inline** no lugar do ícone/label (`Salvando...` ou `⟳`)
- Recuperar o estado normal ao concluir (sucesso ou erro)

### 2. Skeleton Loader para Listagens
Enquanto a lista carrega, exibir "ossos" (placeholders animados em cinza) no formato das linhas da tabela. Evita layout shift e comunica que conteúdo virá.

### 3. Loading Overlay para Wizards / Formulários Complexos
Durante a submissão de um formulário multi-step, aplicar um overlay semitransparente sobre o card com spinner centralizado, impedindo interação enquanto a operação está em curso.

### 4. Dropdown com Estado "Carregando"
Enquanto os dados de um `<select>` ainda não foram carregados do backend, mostrar a opção `Carregando...` (desabilitada) ao invés de `— Selecione —`, e desabilitar o select.

### 5. Empty State Animado
Trocar textos estáticos de carregamento por um componente reutilizável com spinner animado + mensagem contextual.

### 6. Retry Inline em Erros de Lista
Quando o carregamento de uma listagem falha, exibir mensagem de erro + botão "Tentar novamente" na própria área da lista (já existe em algumas telas, padronizar para todas).

---

## Fases da Sprint

---

### FASE 1 — Infraestrutura Compartilhada
> Criar os blocos reutilizáveis que as demais fases vão consumir. Sem esta fase, as demais não fazem sentido.

| # | Atividade | Detalhes | Critério de conclusão |
|---|---|---|---|
| 1.1 | **Componente `<app-spinner>`** | Spinner SVG animado reutilizável. Aceita `size` (sm/md/lg) e `color`. Usado inline em botões e como overlay. | Renderiza corretamente em contexto de botão e de overlay |
| 1.2 | **Componente `<app-skeleton-list>`** | Exibe N linhas de placeholder animado (shimmer effect) com larguras variadas. Aceita `rows` (padrão 5) e `cols` (padrão 3). | Visualmente substitui uma tabela em carregamento |
| 1.3 | **Componente `<app-empty-loading>`** | Substitui os textos "Carregando X..." espalhados. Usa `app-spinner` + mensagem customizável via `@Input`. | Todos os textos estáticos de loading substituídos |
| 1.4 | **Diretiva `appLoadingButton`** | Diretiva aplicada em `<button>`: recebe `[loading]="isSaving"`. Enquanto `true`, desabilita o botão e substitui conteúdo por spinner. Quando `false`, restaura. | Botão desabilita, não duplica requisições, restaura após operação |
| 1.5 | **Estilo CSS global `.loading-overlay`** | Classe utilitária para sobrepor spinner em card/modal: `position:relative` no container, overlay semitransparente + spinner centralizado. | Funciona em qualquer card sem CSS adicional |

---

### FASE 2 — Telas de Fluxo Crítico
> As telas mais usadas no dia a dia do sistema. Maior impacto perceptível pelo usuário.

#### 2A — Solicitação de Orçamento

| # | Atividade | Detalhes | Critério de conclusão |
|---|---|---|---|
| 2A.1 | Substituir texto "Carregando solicitações..." | Usar `<app-empty-loading mensagem="Carregando solicitações...">` com spinner animado | Visual claramente animado, não mais texto estático |
| 2A.2 | Skeleton na listagem | Enquanto `loading = true`, mostrar `<app-skeleton-list rows="6">` no lugar da tabela | Transição suave de skeleton → tabela preenchida |
| 2A.3 | Botão "Nova Solicitação" com loading state | `isSavingSolicitacao: boolean` + `appLoadingButton` no botão de criar | Botão não responde a cliques durante save |
| 2A.4 | Botão "Enviar para Despachante" com loading state | Idem acima — operação crítica com alto risco de duplo-clique | Botão desabilita, toast de sucesso ao concluir |
| 2A.5 | Retry visível ao falhar carregamento | Mensagem de erro + botão "Tentar novamente" (já existe parcialmente — padronizar visual) | Erro de rede exibe botão de retry, clique recarrega |

#### 2B — Custo Despachante (Wizard)

| # | Atividade | Detalhes | Critério de conclusão |
|---|---|---|---|
| 2B.1 | Overlay de loading no wizard durante save | `isSaving: boolean` + overlay `.loading-overlay` no card do step ativo enquanto salva | Card não clicável durante operação, spinner visível |
| 2B.2 | Botão "Próximo / Salvar" com loading state | `appLoadingButton` em todos os botões de avanço de step | Sem duplo clique possível |
| 2B.3 | Botão "Salvar e Finalizar" com loading state | Operação mais crítica do wizard | Idem — inclui feedback "Finalizando..." |
| 2B.4 | Dropdown de Despachante com estado de carregamento | Se `despachantes.length === 0` após `ngOnInit`, mostrar `<option disabled>Carregando...</option>` e `[disabled]="despachantesLoading"` | Usuário entende que a lista ainda está sendo buscada |
| 2B.5 | Dropdown de Importador com estado de carregamento | Idem para importadores | Idem |
| 2B.6 | Skeleton na listagem de custos | `<app-skeleton-list>` enquanto `load()` está em execução | Transição visual limpa |

#### 2C — Orçamento de Venda

| # | Atividade | Detalhes | Critério de conclusão |
|---|---|---|---|
| 2C.1 | Botão "Salvar Orçamento" com loading state | `isSaving` + `appLoadingButton` | Sem duplo clique |
| 2C.2 | Loading ao selecionar Custo Base | Quando trocar custo base e recalcular, mostrar micro-spinner no painel de impostos | Cálculo recalcula sem travar a tela visivelmente |
| 2C.3 | Skeleton na listagem de orçamentos | `<app-skeleton-list>` no carregamento inicial | Transição visual limpa |

---

### FASE 3 — Embarque e Aduana

| # | Atividade | Detalhes | Critério de conclusão |
|---|---|---|---|
| 3.1 | Skeleton na listagem de embarques | `<app-skeleton-list rows="8">` no carregamento | Visual consistente com outras telas |
| 3.2 | Botões de ação de status (Embarcar, Desembaraçar, etc.) | `isSavingStatus: boolean` + `appLoadingButton` | Sem duplo clique em operações de mudança de status |
| 3.3 | Overlay ao abrir modal de alterar status | Spinner no modal enquanto busca dados antes de abrir | Modal não abre com dados incompletos |
| 3.4 | Loading nos dropdowns de Navio e Agente | Idem fase 2B — `carregando...` se lista vazia | Usuário sabe que está buscando |
| 3.5 | Retry na listagem ao falhar | Padrão: mensagem + botão "Tentar novamente" | Consistente com outras telas |

---

### FASE 4 — Cadastros

> Os cadastros têm menor frequência de uso, mas precisam ser consistentes com o restante da aplicação.

| # | Atividade | Detalhes | Critério de conclusão |
|---|---|---|---|
| 4.1 | Portos Origem e Destino — botão salvar com loading | Já têm `loading` para GET. Adicionar `isSaving` para POST/PUT | Botão desabilita durante save |
| 4.2 | Navios — botão salvar com loading | Idem | Botão com spinner |
| 4.3 | Skeleton em todos os cadastros paginados | Portos, Navios, NCM, Agentes — `<app-skeleton-list>` no carregamento | Visual uniforme |
| 4.4 | Importadores, Despachantes, Clientes | Operações síncronas — adicionar feedback mínimo de "Salvando..." mesmo que rápido | Toast de sucesso já existe; revisar se todos disparam |
| 4.5 | Administração (Usuários, Roles) | `isSaving` + skeleton | Consistência |

---

### FASE 5 — Polimento Global

| # | Atividade | Detalhes | Critério de conclusão |
|---|---|---|---|
| 5.1 | Dropdowns globais: estado inicial unificado | Padronizar: se lista vazia no momento do render → `Carregando...` (disabled). Se lista carregada → `— Selecione —`. | Todos os `<select>` de lookup seguem o mesmo comportamento |
| 5.2 | Timeout de operação | Se uma requisição demorar mais de 15s, mostrar toast warning "A operação está demorando mais que o esperado. Aguarde..." | Usuário não acha que travou |
| 5.3 | Toast de sucesso em todas as ações de salvar | Auditar todas as operações POST/PUT/PATCH — garantir que todas disparam `toast.success()` | Nenhuma ação muda dado silenciosamente |
| 5.4 | Mensagem "Sem resultados" vs "Carregando" separadas | Hoje algumas telas exibem "nenhum registro" antes de carregar os dados (falso negativo). Separar os estados: `loading` → skeleton; `loaded + empty` → "Nenhum registro encontrado" | Sem falsos negativos de empty state |
| 5.5 | Teste de UX em fluxo completo | Navegar em: criar solicitação → gerar custo despachante → criar OV → simular erro de rede. Verificar feedback em cada etapa. | Todos os estados de loading/erro/sucesso estão presentes |

---

## Resumo de Esforço Estimado

| Fase | Atividades | Complexidade | Estimativa |
|---|---|---|---|
| Fase 1 — Infraestrutura | 5 | Média (componentes novos) | 1 dia |
| Fase 2 — Fluxo Crítico | 14 | Alta (maior impacto) | 2–3 dias |
| Fase 3 — Embarque | 5 | Média | 1 dia |
| Fase 4 — Cadastros | 5 | Baixa (padrão repetitivo) | 1 dia |
| Fase 5 — Polimento | 5 | Baixa–Média | 1 dia |
| **Total** | **34** | | **6–7 dias úteis** |

---

## Dependências e Restrições

- As Fases 2–5 dependem completamente da Fase 1 (infraestrutura).
- A Fase 2 deve ser executada antes das Fases 3 e 4 por ser a de maior visibilidade.
- Não há mudanças de backend necessárias — todas as alterações são exclusivamente de frontend.
- Nenhuma alteração em regras de negócio, modelos de dados ou APIs.

---

## Critério de Aceite Global da Sprint

A sprint é considerada concluída quando:

1. Toda operação que faz requisição ao backend desabilita o botão de ação durante a execução.
2. Toda listagem exibe skeleton animado enquanto carrega.
3. Toda operação de salvar/confirmar dispara toast de sucesso ao concluir.
4. Toda falha de carregamento de lista exibe mensagem + botão de retry.
5. Todo dropdown de lookup exibe "Carregando..." quando ainda não tem dados.
6. Nenhum empty state de "sem registros" aparece antes do carregamento estar completo.
