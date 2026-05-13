# Sprint de Correções — Comex133

> **Versão:** 6.0 (Sprint encerrada)  
> **Data:** 2026-05-13 | **Status:** ✅ Concluída  
> **Legenda:** ✅ Concluído | 🔍 Verificação visual pendente (sem código a fazer)

---

## SEÇÃO A — Confirmado concluído sem ressalvas

Auditoria de código confirmou estes itens totalmente implementados. **Não requerem trabalho.**

| Item | Confirmação no código |
|------|-----------------------|
| Máscaras em todos os campos numéricos | Diretiva `appCurrencyMask` em todos os inputs |
| Cálculos automáticos FOB R$, CIF USD, CIF R$ | `recalculateFinancials()` com 3 fórmulas via `(ngModelChange)` |
| FOB ↔ Parâmetro × Peso (bidirecional) | `fobCalcSource` flag — preenche FOB → deriva Parâmetro; preenche Parâmetro → calcula FOB |
| Frete Internacional USD presente | Campo na linha 504 com `(ngModelChange)="recalculateFinancials()"` |
| Excluir Solicitações e Custos | Delete com confirmação em ambos os componentes |
| Importador não obrigatório (campo e validação) | Sem `required` no FE; sem validação no BE; coluna nullable no banco |
| Seleção de despachante obrigatória ao adicionar | `[disabled]="!despaForm.despachanteId"` no botão |
| CIF USD e CIF R$ readonly e automáticos | `[readonly]="true"` + calculados em `recalculateFinancials()` |
| Packlist na aba LI (arquivo + download) | `packlistDocs()` via `solicitacaoSvc.getDocumentos(id)` com 3 estados (avulso / sem doc / com doc) |
| Preview `👁` em todos os passos do wizard | Botão `openPreview()` nas ações de todos os 5 steps |
| Versões tree inline | Classes `.version-tree`, `.version-branch`, `.version-node-dot` |
| Preview Orçamento de Venda (Previsão de Numerário) | 3 seções completas + exportar PDF |
| **Despachante sem detalhar — valor total manual** | Modal de finalização com `totalGeralManual`; total exibido usa manual se preenchido: `(p1.totalGeralManual ?? totalGeral())` |

---

## SEÇÃO B — Revisões concluídas

Todos os pontos de revisão foram implementados e verificados.

---

### B1 ✅ — Importador: envia `null` em vez de string vazia

**Implementado:** `importadorId: this.p1.importadorId || null` nos dois branches de `salvarTudo()` (create e update). Confirmado no código — linhas 1870 e 1893 do `custo-despachante.component.ts`.

**Critério de aceite:**
- [x] Salvar sem Importador → payload envia `"importadorId": null`
- [x] Reabrir custo sem importador → campo permanece em "— Selecione —"

---

### B2 ✅ — Taxa Dólar: 4 casas decimais

**Implementado:** `[currencyMaskDecimals]="4"` no input de Taxa Dólar — linha 489 do `custo-despachante.component.ts`.

**Critério de aceite:**
- [x] Taxa Dólar aceita e exibe 4 casas decimais: `5,2239`
- [x] FOB USD mantém 2 casas
- [ ] 🔍 Peso exibe separador de milhar — verificar visualmente

---

### B3 🔍 — Parâmetro × Peso → FOB (verificação visual)

**Implementado no código.** Verificar na tela:
- [ ] Preencher Peso e Parâmetro → FOB USD calcula automaticamente
- [ ] Alterar FOB USD → Parâmetro recalcula
- [ ] Alterar Taxa → FOB R$ atualiza

---

### B4 🔍 — Grid packlist com itens e LI no mesmo step (verificação visual)

**Implementado:** Step 2 exibe formulário de LI + box de packlist.

- [ ] Confirmar visualmente: Step 2 mostra LI + arquivo da solicitação
- [ ] Botão download do packlist funciona

---

### B5 🔍 — Preview na grid de Custos Despachante (decisão de produto)

**Status:** Ícone 👁️ na grid abre o wizard em modo visualização completa.

- [ ] Decidir: manter 👁 abrindo wizard completo OU adicionar botão 📋 direto para a planilha

---

### B6 ✅ — Labels de status do custo na tabela de despachantes

**Implementado:** Métodos `custoStatusLabel()` e `custoStatusColor()` presentes no `solicitacao-orcamento.component.ts` (linhas 1120–1130) e usados no template (linhas 362–363 e 536).

**Critério de aceite:**
- [x] "EmAndamento" → "Em Andamento"
- [x] "ReabertoPeloOV" → "Reaberto"
- [x] Cores distintas por status

---

### B7 ✅ — Campos Step 1 ordenados: Taxa Dólar antes do FOB USD

**Implementado:** Ordem no template confirmada — Taxa Dólar (linha 488) precede FOB USD (linha 494), seguido de Frete, Seguro, CIF USD, FOB R$, CIF R$, Parâmetro, Peso.

**Critério de aceite:**
- [x] Taxa Dólar aparece como primeiro campo financeiro
- [x] Sequência: Taxa → FOB USD → Frete → Seguro → CIF USD → FOB R$ → CIF R$

---

### B8 ✅ — Despachante readonly somente quando vem de solicitação

**Implementado:** `[disabled]="!!p1.solicitacaoOrcamentoId || despachantes.length === 0"` — linha 433 do `custo-despachante.component.ts`.

**Critério de aceite:**
- [x] Custo vinculado a solicitação → Despachante bloqueado
- [x] Custo avulso → Despachante selecionável

---

## SEÇÃO C — Novos itens implementados

Todos os novos itens foram implementados. Pendências são apenas de homologação visual.

### N1 ✅ — Upload real do packlist

**Critério de aceite:**
- [x] Upload ocorre → URL real salva em `linkDocumento`
- [x] Botão mostra estado de envio; desabilitado durante upload
- [x] Arquivo acessível via URL
- [ ] 🔍 Homologar: arquivos em `wwwroot/uploads/packlist/`

---

### N2 ✅ — Loading states durante chamadas à API

**Critério de aceite:**
- [x] Botões Salvar/Finalizar/Reabrir exibem estado de loading
- [x] Lista exibe skeleton ao carregar dados
- [x] Duplo-clique não dispara múltiplas requisições

---

### N3 ✅ — Custos agrupados pela Solicitação na listagem

**Critério de aceite:**
- [x] Custos com mesma solicitação agrupados sob cabeçalho da solicitação
- [x] Custos avulsos agrupados em "Sem Solicitação"
- [x] Agrupamento preserva versões tree

---

### N4 ✅ — Download do packlist visível em todas as telas relevantes

**Critério de aceite:**
- [x] Packlist visível em Step 1, Step 2, Resumo e modo visualização
- [ ] 🔍 Homologar: link abre/baixa corretamente

---

### N5 ✅ — OV pode iniciar com apenas 1 despachante finalizado

**Critério de aceite:**
- [x] 1 de 2 despachantes finalizado → botão "+ Novo Orçamento" disponível
- [x] 2º despachante pendente → não bloqueia OV já criada
- [x] Sem nenhum finalizado → botão desabilitado com tooltip

---

### N6 ✅ — Incorporar custo posterior sem alterar OV aprovada

**Critério de aceite:**
- [x] OV finalizada exibe seção "Custo Interno (pós-aprovação)"
- [x] Select lista apenas custos com status Finalizado
- [x] Vincular persiste `custoInternoId`; tela atualiza sem reload
- [x] Remover limpa o campo; OV não muda de versão
- [x] OV em outros status não exibe a seção

---

### N7 ✅ — Nome da empresa configurável via ParametroSistema

**Critério de aceite:**
- [x] Preview exibe nome vindo da API (fallback `Ominium S/A` se falhar)
- [ ] 🔍 Homologar: alterar chave no banco → próximo acesso reflete novo nome

---

### N8 ✅ — Preview lateral na listagem de Solicitações

**Critério de aceite:**
- [x] Ícone 👁️ visível na coluna de ações
- [x] Painel abre à direita sem sair da listagem
- [x] Clicar fora fecha o painel
- [ ] 🔍 Homologar: despachantes, custos e documentos exibidos corretamente

---

## Estabilização técnica (encerramento da sprint)

Correções técnicas aplicadas para versão estável:

| # | Arquivo | Problema | Correção |
|---|---------|----------|----------|
| T1 | `auth.interceptor.ts` | `getAccessToken()`, `refreshToken()`, `logout().subscribe()` inexistentes no `AuthService` | Simplificado: usa `getToken()` + `logout()` sem fluxo de refresh (protótipo sem backend JWT real) |
| T2 | `clientes/cliente-detail.component.ts` | `templatesService.getAll()` inexistente | Corrigido para `list$().pipe(take(1)).subscribe(...)` |
| T3 | `clientes/clientes-list.component.ts` | `templatesService.getAll()` inexistente | Corrigido para `list$().pipe(take(1)).subscribe(...)` |
| T4 | `.gitignore` | Uploads de packlist não ignorados | Adicionado `comex133_api/wwwroot/uploads/` |

**`tsc --noEmit` após correções:** 0 erros ✅

---

## Homologação pendente (sem código — verificação visual)

| # | Item |
|---|------|
| B3 | Parâmetro × Peso → FOB calcula corretamente |
| B4 | Step 2: formulário LI + arquivo packlist visíveis |
| B5 | Decidir sobre botão de planilha direto na grid |
| N1 | Arquivos em `wwwroot/uploads/packlist/` |
| N4 | Links de packlist abrem/baixam corretamente |
| N7 | Nome da empresa atualiza ao trocar parâmetro no banco |
| N8 | Preview lateral exibe dados corretos |
