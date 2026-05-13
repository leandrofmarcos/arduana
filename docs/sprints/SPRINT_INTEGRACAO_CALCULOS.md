# Sprint — Integridade de Cálculos e Relacionamentos entre Solicitação → Custo → Orçamento

> **Versão:** 1.0 (Rascunho — aguardando autorização)  
> **Data:** 2026-05-13  
> **Objetivo:** Garantir que os valores produzidos pelo despachante fluam corretamente para o Orçamento de Venda, respeitando os dois modos de preenchimento do custo (detalhado ou totalGeralManual), e que as regras de negócio do fluxo completo estejam intactas e verificadas.

---

## Contexto e Problema

O fluxo da aplicação parte de uma **SolicitacaoOrcamento** que é enviada a um ou mais despachantes. Cada despachante preenche seu **CustoDespachante** em duas modalidades possíveis:

- **Modalidade A — Detalhado:** preenche FOB, Frete Internacional, Seguro, despesas operacionais, e impostos por NCM. O sistema calcula automaticamente CIF USD, FOB R$, CIF R$ e totais de imposto.
- **Modalidade B — Total manual:** preenche apenas `totalGeralManual`, sem discriminar os itens de custo.

Quando ao menos um despachante finaliza, a equipe comercial pode criar o **OrcamentoVenda** usando esse custo como referência. O orçamento pode ser ajustado (honorários, extras, despesas nacionais) e o total final gerado é o valor repassado ao cliente — **esse valor é imutável após finalização**.

Com múltiplos despachantes, o segundo pode finalizar depois de o orçamento já estar criado ou até fechado. Isso não invalida o orçamento; o segundo custo fica disponível apenas como registro histórico/comparativo. O campo `custoInternoId` registra qual despachante foi efetivamente aprovado/utilizado, sem alterar o orçamento em si.

**O que esta sprint resolve:** foram identificados gaps na implementação atual onde valores não fluem corretamente, fórmulas precisam de verificação e casos de borda (ex: custo 100% manual) podem gerar orçamentos com valores zerados ou enganosos.

---

## Análise do Estado Atual

### O que já funciona corretamente

- Ao selecionar um custo no OV (`toggleCusto`), os seguintes campos são copiados como ponto de partida: `tamContainer`, `cifReais`, `cifUsd`, `fobReais`, `fobUsd`, `taxaUsd`, `pesoBruto`, `data`, `observacao`
- `totalImpostos` é calculado somando `ValorImpostoCusto` de todos os NCMs vinculados ao custo selecionado
- As despesas do custo são pré-carregadas na lista de despesas do orçamento (editável)
- `calcTotalGeral() = cifReais + freteInternacional + totalImpostos + somaDespesas() + somaExtras() + honorarios`
- Múltiplos custos podem ser vinculados à mesma OV via `OrcamentoVendaCusto[]`
- Seleção de custo no OV é radio (um de cada vez como ponto de partida); clicando no mesmo deseleciona
- `podeNovoOrcamento` exige ao menos 1 custo Finalizado
- `custoInternoId` permite vincular custo aprovado pós-finalização sem alterar o OV
- Versionamento de OV e de CustoDespachante funcionam independentemente

### Gaps identificados (itens desta sprint)

| ID | Área | Problema |
|----|------|---------|
| G1 | CustoDespachante → OV | `totalGeralManual` não é considerado quando o despachante usou modalidade B — o OV copia `cifReais = 0` e o total fica zerado |
| G2 | Fórmula OV | `freteInternacional` no OV pode gerar dupla contagem: CIF já inclui frete internacional; o campo `freteInternacional` da OV precisa ser clarificado como frete **nacional** e separado visualmente |
| G3 | `pesoLiquido` | `toggleCusto` copia `pesoBruto` do custo mas não `pesoLiquido`; o campo fica em 0 no OV |
| G4 | Filtro de custos por solicitação | `podeNovoOrcamento` retorna `true` se qualquer custo no sistema for Finalizado — não verifica se pertence à solicitação atual |
| G5 | Solicitação pré-selecionada | Ao criar OV a partir da tela de solicitações (via `?editId` ou botão), `solicitacaoAtualId` não é definido no fluxo de criação (somente em edição) |
| G6 | `totalImpostos` no modo B | Com `totalGeralManual`, os NCMs podem estar vazios; `totalImpostos = 0` mesmo que o despachante tenha embutido impostos no total — usuário não é avisado |
| G7 | Accordion de custo | A visualização do custo selecionado mostra os detalhes corretamente, mas quando `totalGeralManual` está preenchido, não exibe destaque visual do total manual |
| G8 | `solicitacaoOrcamentoId` no create | Ao criar nova OV pelo botão "+ Novo Orçamento", `solicitacaoOrcamentoId` não é propagado para o payload — OV fica sem vínculo com a solicitação de origem |

---

## Fases e Atividades

---

### Fase 1 — Tratamento do `totalGeralManual` no fluxo de OV

**Objetivo:** Garantir que quando o despachante usou modalidade B (sem detalhar custos), o OV utilize `totalGeralManual` como base de referência em vez de `cifReais = 0`.

**Regra de negócio:**
- Se `custo.totalGeralManual` está preenchido (`!= null`): o total do despachante é este valor; CIF/FOB são informativos ou zerados
- O usuário do OV deve ver claramente que a referência é um total sem discriminação
- O campo de referência no OV deve exibir o `totalGeralManual` como "Custo referência (total manual)" visualmente distinto

**Atividades:**

**1.1 — `toggleCusto`: detectar modo B e popular corretamente**
```
Arquivo: orcamento-venda.component.ts — método toggleCusto() (linha ~1047)
```
- Adicionar propriedade `custoBaseUsouTotalManual: boolean = false`
- Após copiar os campos do custo, verificar:
  ```typescript
  this.custoBaseUsouTotalManual = !!c.totalGeralManual;
  ```
- Se `custoBaseUsouTotalManual`:
  - Exibir campo `form.totalManualReferencia = c.totalGeralManual` (readonly, informativo)
  - NÃO sobrescrever `form.cifReais` com 0 — manter o campo editável em branco para que o usuário preencha conscientemente
  - Exibir aviso visual: *"Este custo foi preenchido com valor total sem discriminação (R$ X.XXX,00). CIF e impostos devem ser preenchidos manualmente."*

**1.2 — Indicador visual no accordion do custo selecionado**
```
Arquivo: orcamento-venda.component.ts — template do accordion (.custo-acc-content)
```
- Quando `c.totalGeralManual != null`, exibir destaque no topo do accordion:
  ```
  💡 Total manual declarado: R$ X.XXX,00 (sem discriminação de custos)
  ```
- Garantir que a linha de total no accordion mostra `totalGeralManual` com prioridade sobre totais calculados

**1.3 — Critérios de aceite:**
- [ ] Custo com totalGeralManual selecionado → aviso aparece no painel do OV
- [ ] Campos CIF/FOB não são sobrescritos com 0 quando modo B
- [ ] Accordion exibe totalGeralManual em destaque
- [ ] Total do OV não é calculado como R$0 com custo no modo B

---

### Fase 2 — Clarificação e correção da fórmula do Total Geral

**Objetivo:** Eliminar ambiguidade e possível dupla contagem do frete no Total Geral do OV.

**Situação atual:**
```
calcTotalGeral() = cifReais + freteInternacional + totalImpostos + despesas + extras + honorarios
```

O `cifReais` copiado do custo já inclui o frete internacional (`CIF = FOB + FreteIntl + Seguro`). Se `form.freteInternacional` for preenchido com o mesmo valor de frete, há dupla contagem.

**Regra de negócio a confirmar:**
No contexto do OV, `freteInternacional` representa o **frete nacional** (do porto de chegada até o destino final do cliente), que **não está incluído no CIF**. Portanto, não há dupla contagem — mas o campo deve ser renomeado ou ter label clara.

**Atividades:**

**2.1 — Renomear label do campo `freteInternacional` no OV**
```
Arquivo: orcamento-venda.component.ts — template do formulário, campo freteInternacional
```
- Alterar label de `"Frete Internacional"` para `"Frete Nacional / Porto a Destino"`
- Adicionar tooltip: *"Frete do porto de chegada até o destino final. O frete internacional já está incluso no CIF."*
- No painel totalizador, alterar label de `"Frete Internacional"` para `"Frete Nacional"`

**2.2 — Documentar a fórmula no código**
```
Arquivo: orcamento-venda.component.ts — método calcTotalGeral()
```
- Adicionar comentário inline explicando cada componente:
  ```typescript
  // CIF R$      = (FOB + FreteIntl + Seguro) × Taxa — vem do custo despachante
  // FretePTD    = frete porto → destino final (nacional, não está no CIF)
  // Impostos    = II + IPI + PIS + COFINS + ICMS calculados sobre base NCM
  // Despesas    = despesas operacionais (porto, armazenagem, etc.)
  // Extras      = encargos adicionais definidos pelo comercial
  // Honorários  = comissão/honorário da empresa
  ```

**2.3 — Verificar consistência no PDF (Preview)**
```
Arquivo: orcamento-venda.component.ts — método buildOrcamentoHtml()
```
- Confirmar que as labels no PDF gerado são consistentes com as alterações acima
- Confirmar que a linha "Frete" no PDF exibe o valor correto (nacional, não o do CIF)

**2.4 — Critérios de aceite:**
- [ ] Label "Frete Internacional" substituída por "Frete Nacional / Porto a Destino" no form e no totalizador
- [ ] Tooltip explica que frete intl está no CIF
- [ ] PDF gerado mostra label e valor corretos
- [ ] Fórmula do Total Geral permanece matematicamente correta

---

### Fase 3 — Propagação correta de campos ao importar custo

**Objetivo:** Garantir que todos os campos relevantes do custo sejam corretamente propagados para o OV ao selecionar o custo de referência.

**Atividades:**

**3.1 — `pesoLiquido` não copiado**
```
Arquivo: orcamento-venda.component.ts — toggleCusto() (linha ~1073)
```
- Adicionar `this.form.pesoLiquido = c.peso;` junto com `pesoBruto`
- *(Nota: CustoDespachante tem um campo `peso` único; OV tem `pesoBruto` e `pesoLiquido`. Definir padrão: peso do custo é o pesoBruto; pesoLiquido fica editável pelo usuário)*

**3.2 — `freteNacional` não propagado (novo campo)**
- O campo `form.freteInternacional` no OV (renomeado para "Frete Nacional") não deve ser populado do custo (já que CIF vem do custo com frete intl). Confirmar que o valor inicial é 0 na `emptyForm()` — ✅ já é 0.

**3.3 — Auditoria completa do `toggleCusto`**
```
Arquivo: orcamento-venda.component.ts — toggleCusto()
```
Mapear cada campo do `CustoDespachante` e confirmar o que deve / não deve ser copiado para o OV:

| Campo do Custo | Vai para OV? | Campo no OV |
|----------------|-------------|-------------|
| `taxaUsd` | ✅ Sim | `form.taxaUsd` |
| `fobUsd` | ✅ Sim | `form.fobUsd` |
| `fobReais` | ✅ Sim | `form.fobReais` |
| `cifUsd` | ✅ Sim | `form.cifUsd` |
| `cifReais` | ✅ Sim | `form.cifReais` |
| `peso` | ✅ Sim (pesoBruto) | `form.pesoBruto` |
| `peso` | ⚠️ Falta | `form.pesoLiquido` |
| `tamContainer` | ✅ Sim | `form.tamContainer` |
| `data` | ✅ Sim | `form.data` |
| `totalGeralManual` | ❌ Não tratado | — (ver Fase 1) |
| `despesas[]` | ✅ Sim (pré-carga) | `despesasForm` |
| `ncms → impostos` | ✅ Sim (calculado) | `form.totalImpostos` |
| `freteInternacionalUsd` | ❌ Não copiado | — (já está no CIF) |
| `seguroUsd` | ❌ Não copiado | — (já está no CIF) |
| `parametroUsd` | ❌ Não copiado | — (informativo, não vai para OV) |

**3.4 — Critérios de aceite:**
- [ ] `pesoLiquido` pré-preenchido ao selecionar custo
- [ ] Todos os campos listados na tabela acima estão corretamente mapeados
- [ ] Ao deselecionar o custo (`custosSelecionados = []`), o form é limpo corretamente

---

### Fase 4 — Filtro de Custos por Solicitação e Controle de `podeNovoOrcamento`

**Objetivo:** Corrigir a lógica de habilitação do botão "+ Novo Orçamento" e garantir que a visão de custos no OV seja filtrada pela solicitação correta.

**Atividades:**

**4.1 — `podeNovoOrcamento` deve respeitar contexto de solicitação**
```
Arquivo: orcamento-venda.component.ts — getter podeNovoOrcamento() (linha ~960)
```
Situação atual:
```typescript
get podeNovoOrcamento(): boolean {
  return this.custos.some(c => c.status === 'Finalizado');
}
```
Problema: retorna `true` se QUALQUER custo no sistema for Finalizado, independente da solicitação.

Correção: A regra deve ser mantida permissiva (qualquer custo Finalizado habilita o botão) pois OVs avulsas (sem solicitação vinculada) também devem poder ser criadas. O ajuste é apenas visual/informativo:
- Manter `podeNovoOrcamento` como está (correto para OVs avulsas)
- No fluxo de criar OV **a partir de uma solicitação** (via tela de solicitações), verificar se há ao menos 1 custo Finalizado para *aquela* solicitação antes de navegar
- Adicionar `title` mais descritivo ao botão quando desabilitado

**4.2 — `solicitacaoAtualId` não propagado no create**
```
Arquivo: orcamento-venda.component.ts — openForm() sem parâmetro (linha ~1212)
```
Quando o usuário clica "+ Novo Orçamento" na tela de OV:
- `solicitacaoAtualId` fica `undefined`
- O payload `create()` envia `solicitacaoOrcamentoId: undefined`
- OV é criada sem vínculo com nenhuma solicitação

Isso pode ser intencional (OV avulsa) OU pode ser uma perda de contexto quando o usuário vem da tela de solicitações.

Correção:
- Adicionar parâmetro opcional `openForm(item?: OrcamentoVenda, solicitacaoId?: string)`
- Quando chamado com `solicitacaoId`, pré-setar `solicitacaoAtualId`
- A tela de solicitações pode chamar `openForm(undefined, sol.id)` ao navegar para OV

**4.3 — Painel de custos filtrado por solicitação**
```
Arquivo: orcamento-venda.component.ts — getter custosFiltrados (linha ~935)
```
- Quando `solicitacaoAtualId` está definido: filtrar automaticamente o painel esquerdo de custos para mostrar apenas custos da solicitação
- Manter o comportamento atual como fallback quando `solicitacaoAtualId` é undefined
- Adicionar toggle "Ver outros custos" para caso o usuário queira referenciar custo de outra solicitação

**4.4 — Critérios de aceite:**
- [ ] Novo OV criado a partir de solicitação → `solicitacaoOrcamentoId` é salvo corretamente
- [ ] Painel de custos no OV mostra apenas custos da solicitação vinculada (com opção de expandir)
- [ ] OV avulsa (sem solicitação) continua funcionando normalmente

---

### Fase 5 — Imutabilidade do Valor Repassado ao Cliente e Histórico de Despachantes

**Objetivo:** Confirmar e reforçar as regras de negócio de imutabilidade do OV finalizado e rastreabilidade do despachante aprovado.

**Atividades:**

**5.1 — Verificar imutabilidade pós-finalização**
```
Arquivo: orcamento-venda.component.ts — isOrcamentoEditavel() (linha ~919)
         orcamento-venda.service.ts — método update()
         Backend: OrcamentosVendaController.cs
```
Confirmar que:
- `isOrcamentoEditavel()` retorna `false` para status `Finalizado`
- O backend rejeita `PUT /api/orcamentos-venda/{id}` quando `status = Finalizado` (campo `imutavel` ou validação no service)
- A reabertura (`reabrir`) cria nova versão, nunca modifica a versão original
- Versão original fica com `imutavel = true` após reabertura

**5.2 — Segundo despachante finaliza depois do OV fechado**
Verificar o fluxo completo:
1. Solicitação com 2 despachantes (D1 e D2)
2. D1 finaliza → usuário cria OV baseado em D1, fecha com valor X para o cliente
3. D2 finaliza depois
4. Usuário abre a OV finalizada → deve ver:
   - Alerta de "somente leitura"
   - Seção "Custo Interno (pós-aprovação)" disponível
   - Select listando D2 (e D1) como opções para `custoInternoId`
5. Usuário vincula D2 via `custoInternoId` → apenas registra qual foi aprovado; **Total Geral permanece X**

Pontos a verificar:
- `custosFinalizadosDisponiveis` (linha ~964): lista somente custos Finalizados correntes — confirmar que inclui D2 mesmo após OV estar Finalizada
- A seção "Custo Interno" aparece somente quando `editing?.status === 'Finalizado'` — ✅ correto
- `setCustoInterno` não altera `totalGeral`, apenas registra `custoInternoId` — ✅ correto no backend

**5.3 — Exibir despachante aprovado na listagem de OVs**
```
Arquivo: orcamento-venda.component.ts — template da tabela (linha ~219)
```
- Na coluna "Custo Base" da listagem, se `custoInternoId` estiver preenchido, mostrar o código do custo aprovado com destaque (ex: badge verde "aprovado")
- Atualmente a coluna exibe `codigosCustosDaOrc(o.id)` (todos os custos vinculados) — complementar com indicação do custo interno

**5.4 — Critérios de aceite:**
- [ ] OV Finalizada: não pode ser editada diretamente (modo visualização)
- [ ] OV Finalizada: `totalGeral` não muda após vincular `custoInternoId`
- [ ] OV Finalizada: segundo despachante aparece como opção em `custosFinalizadosDisponiveis`
- [ ] Reabertura do OV cria nova versão; versão anterior fica imutável
- [ ] Listagem de OV exibe indicador do custo aprovado quando `custoInternoId` preenchido

---

### Fase 6 — Verificação da Fórmula de Impostos e Consistência do Preview PDF

**Objetivo:** Validar que o `totalImpostos` calculado ao importar o custo é consistente com o que o despachante declarou, e que o PDF gerado reflete corretamente todos os valores.

**Atividades:**

**6.1 — Fórmula de impostos por NCM**
```
Arquivo: orcamento-venda.component.ts — calcNcvTotal() (linha ~1035)
         custo-despachante.component.ts — método análogo no wizard
```
Fórmula atual (OV):
```typescript
calcNcvTotal(nv) {
  const ii     = nv.baseCalculo * (nv.aliIi / 100);
  const baseIpi = nv.baseCalculo + ii;
  const ipi    = baseIpi * (nv.aliIpi / 100);
  const pis    = nv.baseCalculo * (nv.aliPis / 100);
  const cofins = nv.baseCalculo * (nv.aliCofins / 100);
  const icms   = (baseIpi + ipi) * (nv.aliIcms / 100);
  return ii + ipi + pis + cofins + icms;
}
```

Verificar se esta fórmula é **idêntica** à usada no CustoDespachante ao calcular e salvar `ValorImpostoCusto`. Se divergirem, os valores exibidos no OV serão diferentes dos que o despachante calculou.

**6.2 — `totalImpostos` no OV vs soma de `ValorImpostoCusto`**
```
Arquivo: orcamento-venda.component.ts — toggleCusto() (linha ~1078)
```
```typescript
this.form.totalImpostos = ncvs.reduce((acc, nv) => {
  return acc + this.custoSvc.getValoresImposto(nv.id).reduce((a, v) => a + v.totalImpostos, 0);
}, 0);
```
- `v.totalImpostos` é a soma dos impostos calculados pelo backend para aquele NCM
- Confirmar que `ValorImpostoCusto.totalImpostos` é calculado e persistido pelo backend (não apenas calculado no frontend)
- Se o backend apenas persiste as alíquotas mas não o totalImpostos, garantir que `v.valorCalculado` (ou campo equivalente) está sendo usado

**6.3 — Consistência do Preview PDF**
```
Arquivo: orcamento-venda.component.ts — buildOrcamentoHtml() (linha ~1400+)
```
Verificar que o PDF gerado inclui e exibe corretamente:
- [ ] CIF R$ (valor base do custo importado)
- [ ] Frete nacional (renomeado conforme Fase 2)
- [ ] Total de impostos (discriminados por NCM se disponível)
- [ ] Despesas operacionais (lista detalhada)
- [ ] Extras
- [ ] Honorários
- [ ] **Total Geral** em destaque (valor que vai para o cliente)
- [ ] Código da Solicitação de origem
- [ ] Nome do despachante(s) base (via `OrcamentoVendaCusto`)
- [ ] Indicação do custo aprovado (`custoInternoCodigoInterno`) quando preenchido

**6.4 — Critérios de aceite:**
- [ ] Fórmula de imposto no OV é idêntica à do CustoDespachante
- [ ] `totalImpostos` no OV bate com a soma dos `ValorImpostoCusto` do custo selecionado
- [ ] PDF exibe todos os campos listados acima com valores corretos
- [ ] PDF com custo totalGeralManual exibe aviso de "custo sem discriminação" adequadamente

---

## Dependências entre Fases

```
Fase 1 (totalGeralManual) ──── bloqueia ──── Fase 6 (PDF modo B)
Fase 2 (renomear frete)   ──── bloqueia ──── Fase 6 (PDF labels)
Fase 3 (importação)       ──── paralelo a ── Fase 4
Fase 4 (solicitação)      ──── paralelo a ── Fase 5
Fase 5 (imutabilidade)    ──── paralelo a ── Fase 6
```

**Ordem de execução recomendada:**
1. Fases 3 e 4 em paralelo (mudanças isoladas, sem dependências cruzadas)
2. Fase 2 (renomear campo — simples, sem impacto em cálculos)
3. Fase 1 (totalGeralManual — mais complexo, requer novo estado no componente)
4. Fase 5 (verificação de imutabilidade — revisão e eventuais ajustes)
5. Fase 6 (impostos e PDF — depende de 1 e 2 estarem prontos)

---

## Checklist de Homologação

### Cenário A — Custo detalhado (modalidade A), 1 despachante

- [ ] Criar solicitação → enviar para despachante D1
- [ ] D1 preenche FOB, frete, seguro, NCMs, despesas → Finaliza
- [ ] Criar OV: custo D1 aparece no painel esquerdo
- [ ] Selecionar D1: campos CIF/FOB/Taxa/Impostos/Despesas são pré-preenchidos corretamente
- [ ] Ajustar honorários e extras → Total Geral calculado corretamente
- [ ] Salvar → OV criada com `solicitacaoOrcamentoId` correto
- [ ] Finalizar → OV fica imutável
- [ ] PDF: todos os campos com valores corretos

### Cenário B — Custo total manual (modalidade B), 1 despachante

- [ ] D1 preenche apenas `totalGeralManual = R$ 5.000,00` (sem NCMs, sem despesas)
- [ ] D1 finaliza
- [ ] Criar OV: selecionar D1
- [ ] OV exibe aviso: "custo sem discriminação, total manual = R$ 5.000,00"
- [ ] Campos CIF/FOB ficam editáveis em branco (não zerados de forma confusa)
- [ ] `totalImpostos` fica em 0 com alerta de que deve ser preenchido manualmente
- [ ] Usuário preenche os campos necessários → Total Geral calculado
- [ ] Salvar → OV criada corretamente

### Cenário C — 2 despachantes, OV criada após o 1º finalizar

- [ ] Solicitação com D1 e D2
- [ ] D1 finaliza → Criar OV baseado em D1, valor cliente = R$ 8.000,00 → Finalizar
- [ ] D2 finaliza depois (custo menor: R$ 4.000,00)
- [ ] Abrir OV finalizada (modo somente leitura): `totalGeral` = R$ 8.000,00 inalterado
- [ ] Seção "Custo Interno" aparece → vincular D2 → `custoInternoId = D2`
- [ ] `totalGeral` permanece R$ 8.000,00 após vinculação
- [ ] Listagem de OV mostra indicador do custo aprovado (D2)

### Cenário D — Reabertura e nova versão

- [ ] OV Finalizada v1 com Total = R$ 8.000,00
- [ ] Reabrir → nova OV v2 criada; v1 fica `imutavel = true`
- [ ] Editar v2 (novo valor negociado) → Finalizar v2
- [ ] Visualizar v1: ainda mostra R$ 8.000,00 (não alterado)
- [ ] Listagem mostra ambas as versões quando "Mostrar versões anteriores" ativado

---

## Estimativa de Esforço

| Fase | Esforço estimado | Complexidade |
|------|-----------------|-------------|
| Fase 1 — totalGeralManual | 2–3h | Alta (novo estado, UI condicional) |
| Fase 2 — renomear frete | 30 min | Baixa (labels, tooltip, PDF) |
| Fase 3 — importação de campos | 1h | Média (auditoria + pesoLiquido) |
| Fase 4 — filtro por solicitação | 1–2h | Média (propagação de contexto) |
| Fase 5 — imutabilidade | 1h | Média (verificação + exibição na lista) |
| Fase 6 — impostos e PDF | 1–2h | Alta (validação numérica + PDF) |
| **Total** | **~8–11h** | |

---

## Arquivos principais afetados

| Arquivo | Fases |
|---------|-------|
| `comex133_front/src/app/v2/features/orcamento-venda/pages/orcamento-venda.component.ts` | 1, 2, 3, 4, 5, 6 |
| `comex133_front/src/app/v2/features/orcamento-venda/services/orcamento-venda.service.ts` | 4, 5 |
| `comex133_front/src/app/v2/features/orcamento-venda/models/orcamento-venda.models.ts` | 1, 3 |
| `comex133_api/Features/OrcamentosVenda/OrcamentosVendaService.cs` | 5 |
| `comex133_api/Controllers/OrcamentosVendaController.cs` | 5 |
