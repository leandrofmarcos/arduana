# Validação de Cenários de Fluxo Operacional

**Propósito**: Confirmar cada transição de status antes de iniciar a implementação.  
**Como usar**: Leia cada cenário, confirme se a regra está correta ou anote a correção.  
**Legenda**: `[ ]` = aguardando confirmação · `[x]` = confirmado · `[~]` = revisar/ajustar

---

## MÓDULO 1 — SolicitacaoOrcamento

### 1A — Abertura e Estado Inicial

```
CENÁRIO 1A-01
  Ação:    Criar solicitação SEM associar despachantes
  Estado inicial: (novo)
  Resultado esperado:
    ✦ Solicitação.Status = Rascunho
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1A-02
  Ação:    Criar solicitação JÁ associando ≥1 despachante
  Estado inicial: (novo)
  Resultado esperado:
    ✦ Solicitação.Status = AguardandoDespachante
    ✦ CustoDespachante criado para cada despachante com Status = Pendente
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1A-03
  Ação:    Adicionar despachante a uma solicitação em Rascunho
  Estado inicial: Solicitação = Rascunho
  Resultado esperado:
    ✦ Solicitação.Status = AguardandoDespachante
    ✦ CustoDespachante criado com Status = Pendente
  [ ] Confirmado
  Anotação: ___________________________________________
```

---

### 1B — Avanço pelo ciclo dos custos → OV → Aprovação

```
CENÁRIO 1B-01
  Ação:    Há 2 despachantes. Apenas 1 finaliza o custo.
  Estado inicial: Solicitação = AguardandoDespachante
  Resultado esperado:
    ✦ Solicitação.Status permanece = AguardandoDespachante  (ainda tem 1 pendente)
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1B-02
  Ação:    Há 2 despachantes. Os 2 finalizam o custo.
  Estado inicial: Solicitação = AguardandoDespachante
  Resultado esperado:
    ✦ Solicitação.Status = AguardandoOrcamentoVenda
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1B-03
  Ação:    Há 2 despachantes. 1 finalizado + 1 cancelado pelo OV.
  Estado inicial: Solicitação = AguardandoDespachante
  Resultado esperado:
    ✦ Solicitação.Status = AguardandoOrcamentoVenda  (≥1 finalizado, cancelado não bloqueia)
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1B-04
  Ação:    Comercial coloca OV em andamento
  Estado inicial:
    Solicitação = AguardandoOrcamentoVenda
    ≥1 CustoDespachante.Status = Finalizado
  Resultado esperado:
    ✦ OrcamentoVenda.Status = EmAndamento
    ✦ Solicitação.Status permanece = AguardandoOrcamentoVenda
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1B-05
  Ação:    Comercial salva OV (sem finalizar)
  Estado inicial: OV = EmAndamento
  Resultado esperado:
    ✦ OrcamentoVenda.Status permanece = EmAndamento
    ✦ Solicitação.Status permanece = AguardandoOrcamentoVenda
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1B-06
  Ação:    Comercial finaliza OV
  Estado inicial:
    OV = EmAndamento
    ≥1 custo Finalizado vinculado
  Resultado esperado:
    ✦ OrcamentoVenda.Status = Finalizado
    ✦ Solicitação.Status = AguardandoAprovacaoCliente
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1B-07
  Ação:    Admin/Gerente aprova manualmente
  Estado inicial: Solicitação = AguardandoAprovacaoCliente, OV = Finalizado
  Resultado esperado:
    ✦ Solicitação.Status = Aprovada
    ✦ EmbarqueAduana criado automaticamente
    ✦ Todos os CustosDespachante.Imutavel = true
    ✦ OV.Imutavel = true (ou bloqueado por regra)
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1B-08
  Ação:    Admin/Gerente cancela manualmente
  Estado inicial: Solicitação = AguardandoAprovacaoCliente
  Resultado esperado:
    ✦ Solicitação.Status = Cancelada  (estado terminal)
  [ ] Confirmado
  Anotação: ___________________________________________
```

---

### 1C — Bloqueios na Solicitação

```
CENÁRIO 1C-01
  Ação:    Tentar aprovar solicitação fora do status correto
  Estado inicial: Solicitação = AguardandoOrcamentoVenda (OV não finalizado)
  Resultado esperado:
    ✦ HTTP 422 — "Solicitação deve estar com status AguardandoAprovacaoCliente para ser aprovada."
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1C-02
  Ação:    Tentar cancelar solicitação já Aprovada
  Estado inicial: Solicitação = Aprovada
  Resultado esperado:
    ✦ HTTP 422 — "Não é possível cancelar após aprovação pelo cliente."
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 1C-03
  Ação:    Tentar adicionar despachante após Aprovada
  Estado inicial: Solicitação = Aprovada
  Resultado esperado:
    ✦ HTTP 422 — bloqueio por imutabilidade
  [ ] Confirmado
  Anotação: ___________________________________________
```

---

## MÓDULO 2 — CustoDespachante

### 2A — Ciclo de Vida Normal

```
CENÁRIO 2A-01
  Ação:    CustoDespachante criado (ao associar despachante)
  Estado inicial: (novo)
  Resultado esperado:
    ✦ Status = Pendente
    ✦ Versao = 1
    ✦ Imutavel = false
    ✦ VersaoAnteriorId = null
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 2A-02
  Ação:    Despachante salva/edita o custo pela primeira vez
  Estado inicial: Status = Pendente
  Resultado esperado:
    ✦ Status = EmAndamento
    ✦ Dados salvos normalmente
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 2A-03
  Ação:    Despachante salva novamente (já estava EmAndamento)
  Estado inicial: Status = EmAndamento
  Resultado esperado:
    ✦ Status permanece = EmAndamento
    ✦ Dados atualizados
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 2A-04
  Ação:    Despachante finaliza o custo
  Estado inicial: Status = EmAndamento, Imutavel = false
  Resultado esperado:
    ✦ Status = Finalizado
    ✦ Solicitação recalculada (ver 1B-01 e 1B-02)
  [ ] Confirmado
  Anotação: ___________________________________________
```

---

### 2B — Reabertura pelo OV

```
CENÁRIO 2B-01
  Ação:    OV solicita reabertura de um custo Finalizado
  Estado inicial:
    Custo A: Status = Finalizado, Versao = 1, Imutavel = false
    OV: Status = EmAndamento
  Resultado esperado:
    ✦ Custo A: Imutavel = true  (registro original congelado)
    ✦ Custo B NOVO criado: Status = Pendente, Versao = 2, VersaoAnteriorId = A.Id
    ✦ Solicitação.Status = AguardandoReabertura
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 2B-02
  Ação:    Despachante edita o custo reaberto (v2) pela primeira vez
  Estado inicial: Custo B (nova versão): Status = Pendente
  Resultado esperado:
    ✦ Custo B: Status = EmAndamento
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 2B-03
  Ação:    Despachante finaliza o custo reaberto (v2)
  Estado inicial: Custo B: Status = EmAndamento, Imutavel = false
  Resultado esperado:
    ✦ Custo B: Status = Finalizado
    ✦ Solicitação.Status = AguardandoOrcamentoVenda  (volta ao fluxo normal)
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 2B-04
  Ação:    OV solicita 2ª reabertura do mesmo custo (já reaberto 1x e finalizado como v2)
  Estado inicial:
    Custo B: Status = Finalizado, Versao = 2, Imutavel = false
    OV: Status = EmAndamento
  Resultado esperado:
    ✦ Custo B: Imutavel = true
    ✦ Custo C NOVO criado: Status = Pendente, Versao = 3, VersaoAnteriorId = B.Id
    ✦ Solicitação.Status = AguardandoReabertura
  [ ] Confirmado
  Anotação: ___________________________________________
```

---

### 2C — Cancelamento pelo OV

```
CENÁRIO 2C-01
  Ação:    OV cancela um custo (há 2 custos finalizados)
  Estado inicial:
    Custo A: Status = Finalizado
    Custo B: Status = Finalizado
    OV: Status = EmAndamento
  Resultado esperado:
    ✦ Custo A: Status = CanceladoPeloOV
    ✦ Custo B: Status permanece = Finalizado
    ✦ Solicitação.Status permanece = AguardandoOrcamentoVenda
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 2C-02
  Ação:    OV tenta cancelar o ÚNICO custo finalizado
  Estado inicial:
    Custo A: Status = Finalizado  (único não cancelado)
    OV: Status = EmAndamento
  Resultado esperado:
    ✦ HTTP 422 — "Não é possível cancelar este custo — o OV precisa de ao menos um custo finalizado."
  [ ] Confirmado
  Anotação: ___________________________________________
```

---

### 2D — Bloqueios no CustoDespachante

```
CENÁRIO 2D-01
  Ação:    Qualquer tentativa de editar custo com Imutavel = true
  Estado inicial: Custo com Imutavel = true (qualquer status)
  Resultado esperado:
    ✦ HTTP 422 — "Este custo foi finalizado e está imutável. Solicite reabertura pelo Orçamento de Vendas."
    ✦ Botão "Salvar" desabilitado no frontend
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 2D-02
  Ação:    Despachante tenta reabrir custo Finalizado por conta própria (sem passar pelo OV)
  Estado inicial: Custo: Status = Finalizado
  Resultado esperado:
    ✦ Não existe endpoint para isso — bloqueado por design
    ✦ Botão "Reabrir" não existe na tela do despachante
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 2D-03
  Ação:    Tentar finalizar custo que está como Pendente (sem ter passado por EmAndamento)
  Estado inicial: Custo: Status = Pendente
  Resultado esperado:
    ✦ HTTP 422 — custo deve estar EmAndamento para ser finalizado
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 2D-04
  Ação:    Tentar editar custo após a Solicitação ser Aprovada
  Estado inicial:
    Solicitação = Aprovada
    Custo: Imutavel = true (setado automaticamente na aprovação)
  Resultado esperado:
    ✦ HTTP 422 — bloqueio por imutabilidade (custo.Imutavel OU solicitacao.Status == Aprovada)
  [ ] Confirmado
  Anotação: ___________________________________________
```

---

## MÓDULO 3 — OrcamentoVenda

### 3A — Abertura e Finalização

```
CENÁRIO 3A-01
  Ação:    Comercial coloca OV em andamento SEM custo finalizado
  Estado inicial:
    Solicitação = AguardandoOrcamentoVenda
    Todos os custos: Status = EmAndamento (nenhum Finalizado)
  Resultado esperado:
    ✦ HTTP 422 — "Para iniciar o Orçamento de Vendas é necessário pelo menos um Custo Despachante finalizado."
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 3A-02
  Ação:    Comercial coloca OV em andamento COM ≥1 custo finalizado
  Estado inicial:
    Solicitação = AguardandoOrcamentoVenda
    Custo A: Status = Finalizado
  Resultado esperado:
    ✦ OV.Status = EmAndamento
    ✦ Solicitação.Status permanece = AguardandoOrcamentoVenda
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 3A-03
  Ação:    Comercial tenta finalizar OV sem custo finalizado vinculado
  Estado inicial:
    OV = EmAndamento
    Todos os custos vinculados: CanceladoPeloOV (nenhum Finalizado restante)
  Resultado esperado:
    ✦ HTTP 422 — "É necessário pelo menos um Custo Despachante finalizado para finalizar o OV."
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 3A-04
  Ação:    Comercial finaliza OV com ≥1 custo finalizado
  Estado inicial:
    OV = EmAndamento
    ≥1 Custo: Status = Finalizado
  Resultado esperado:
    ✦ OV.Status = Finalizado
    ✦ Solicitação.Status = AguardandoAprovacaoCliente
  [ ] Confirmado
  Anotação: ___________________________________________
```

---

### 3B — Reabertura do OV

```
CENÁRIO 3B-01
  Ação:    Comercial reabre OV já Finalizado
  Estado inicial:
    OV = Finalizado
    Solicitação = AguardandoAprovacaoCliente  (≠ Aprovada)
  Resultado esperado:
    ✦ OV.Status = EmAndamento
    ✦ Solicitação.Status = AguardandoOrcamentoVenda
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 3B-02
  Ação:    Comercial tenta reabrir OV após Solicitação ser Aprovada
  Estado inicial:
    OV = Finalizado
    Solicitação = Aprovada
  Resultado esperado:
    ✦ HTTP 422 — "O Orçamento de Vendas não pode ser reaberto após a aprovação pelo cliente."
    ✦ Botão "Reabrir" oculto/desabilitado no frontend
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 3B-03
  Ação:    Após reabrir OV, comercial salva (sem finalizar)
  Estado inicial: OV = EmAndamento (reaberto)
  Resultado esperado:
    ✦ OV.Status permanece = EmAndamento
    ✦ Solicitação.Status permanece = AguardandoOrcamentoVenda
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 3B-04
  Ação:    Após reabrir OV, comercial finaliza novamente
  Estado inicial:
    OV = EmAndamento (reaberto)
    ≥1 custo Finalizado
  Resultado esperado:
    ✦ OV.Status = Finalizado  (nova versão/finalização)
    ✦ Solicitação.Status = AguardandoAprovacaoCliente
  [ ] Confirmado
  Anotação: ___________________________________________
```

---

### 3C — Bloqueios no OV

```
CENÁRIO 3C-01
  Ação:    Tentar salvar OV que não está EmAndamento
  Estado inicial: OV = Finalizado
  Resultado esperado:
    ✦ HTTP 422 — OV só pode ser editado quando EmAndamento
    ✦ Formulário readonly no frontend quando status ≠ EmAndamento
  [ ] Confirmado
  Anotação: ___________________________________________
```

```
CENÁRIO 3C-02
  Ação:    OV tenta solicitar reabertura de custo que NÃO está Finalizado
  Estado inicial:
    OV = EmAndamento
    Custo: Status = EmAndamento (não finalizado)
  Resultado esperado:
    ✦ HTTP 422 — só pode solicitar reabertura de custo com Status = Finalizado
  [ ] Confirmado
  Anotação: ___________________________________________
```

---

## MÓDULO 4 — Fluxos Combinados (Ponta a Ponta)

### 4A — Happy Path Completo (1 despachante)

```
CENÁRIO 4A-01  "Fluxo mínimo sem intercorrências"
  Passo a passo:
    1. Criar solicitação + 1 despachante
       → Solicitação = AguardandoDespachante, Custo A = Pendente
    2. Despachante salva custo A
       → Custo A = EmAndamento
    3. Despachante finaliza custo A
       → Custo A = Finalizado, Solicitação = AguardandoOrcamentoVenda
    4. Comercial coloca OV em andamento
       → OV = EmAndamento
    5. Comercial finaliza OV
       → OV = Finalizado, Solicitação = AguardandoAprovacaoCliente
    6. Admin aprova
       → Solicitação = Aprovada, EmbarqueAduana criado
       → Custo A.Imutavel = true
  [ ] Todos os passos confirmados
  Anotação: ___________________________________________
```

---

### 4B — Happy Path com 2 Despachantes

```
CENÁRIO 4B-01  "2 despachantes, ambos finalizam"
  Passo a passo:
    1. Criar solicitação + 2 despachantes
       → Custo A = Pendente, Custo B = Pendente
       → Solicitação = AguardandoDespachante
    2. Desp. 1 finaliza custo A
       → Custo A = Finalizado
       → Solicitação permanece = AguardandoDespachante  (Custo B ainda Pendente)
    3. Desp. 2 finaliza custo B
       → Custo B = Finalizado
       → Solicitação = AguardandoOrcamentoVenda
    4. Comercial inicia OV → finaliza OV
       → Solicitação = AguardandoAprovacaoCliente
    5. Admin aprova → EmbarqueAduana criado
  [ ] Todos os passos confirmados
  Anotação: ___________________________________________
```

```
CENÁRIO 4B-02  "2 despachantes, OV cancela 1 e segue com 1"
  Passo a passo:
    1. Criar solicitação + 2 despachantes
    2. Ambos finalizam → Solicitação = AguardandoOrcamentoVenda
    3. OV inicia → OV = EmAndamento
    4. OV cancela Custo A
       → Custo A = CanceladoPeloOV
       → Custo B permanece = Finalizado (≥1 finalizado ✓)
    5. OV finaliza
       → OV = Finalizado, Solicitação = AguardandoAprovacaoCliente
  [ ] Todos os passos confirmados
  Anotação: ___________________________________________
```

---

### 4C — Fluxo com Reabertura de Custo

```
CENÁRIO 4C-01  "OV solicita reabertura → despachante retrabalha → OV finaliza"
  Passo a passo:
    1. Solicitação + 1 despachante, custo finalizado, OV em andamento
    2. OV solicita reabertura do Custo A (v1)
       → Custo A (v1): Imutavel = true
       → Custo B (v2) NOVO: Status = Pendente, Versao = 2
       → Solicitação = AguardandoReabertura
    3. Despachante edita Custo B → EmAndamento
    4. Despachante finaliza Custo B
       → Custo B = Finalizado
       → Solicitação = AguardandoOrcamentoVenda
    5. OV retoma → finaliza → Solicitação = AguardandoAprovacaoCliente
    6. Admin aprova → EmbarqueAduana criado
  [ ] Todos os passos confirmados
  Anotação: ___________________________________________
```

```
CENÁRIO 4C-02  "Dupla reabertura (2 ciclos de revisão)"
  Passo a passo:
    1. Custo B (v2) foi finalizado. OV solicita reabertura novamente.
       → Custo B (v2): Imutavel = true
       → Custo C (v3) NOVO: Status = Pendente, Versao = 3, VersaoAnteriorId = B.Id
       → Solicitação = AguardandoReabertura
    2. Despachante finaliza Custo C (v3)
       → Solicitação = AguardandoOrcamentoVenda
    3. OV finaliza → Admin aprova
  [ ] Todos os passos confirmados
  Anotação: ___________________________________________
```

---

### 4D — Fluxo com Reabertura do OV

```
CENÁRIO 4D-01  "OV finalizado → reaberto → refinado → finalizado novamente"
  Passo a passo:
    1. OV finalizado → Solicitação = AguardandoAprovacaoCliente
    2. Comercial reabre OV
       → OV = EmAndamento
       → Solicitação = AguardandoOrcamentoVenda
    3. Comercial edita OV (salva) → status não muda
    4. Comercial finaliza OV novamente
       → OV = Finalizado
       → Solicitação = AguardandoAprovacaoCliente
    5. Admin aprova normalmente
  [ ] Todos os passos confirmados
  Anotação: ___________________________________________
```

---

## MÓDULO 5 — Imutabilidade Pós-Aprovação

```
CENÁRIO 5-01
  Ação:    Tentar editar qualquer campo da Solicitação após Aprovada
  Resultado esperado: HTTP 422 — processo finalizado/imutável
  [ ] Confirmado

CENÁRIO 5-02
  Ação:    Tentar editar CustoDespachante após Solicitação Aprovada
  Resultado esperado: HTTP 422 — processo finalizado/imutável
  [ ] Confirmado

CENÁRIO 5-03
  Ação:    Tentar editar OrcamentoVenda após Solicitação Aprovada
  Resultado esperado: HTTP 422 — processo finalizado/imutável
  [ ] Confirmado

CENÁRIO 5-04
  Ação:    Tentar deletar EmbarqueAduana criado automaticamente
  Resultado esperado: HTTP 403/422 — não permitido
  [ ] Confirmado

  Anotação geral sobre imutabilidade: ___________________
```

---

## MÓDULO 6 — Regras de Recálculo Automático do Status da Solicitação

> Estas regras são executadas pelo método `RecalcularStatusAsync` a cada mudança em CustoDespachante ou OrcamentoVenda. Confirme a prioridade entre elas.

```
REGRA RCA-01  [Maior prioridade]
  Condição: Solicitação.Status == Aprovada  OU  == Cancelada
  Ação:     NÃO alterar — estado terminal
  [ ] Confirmado

REGRA RCA-02
  Condição: ≥1 CustoDespachante.Status == ReabertoPeloOV
  Ação:     Solicitação → AguardandoReabertura
  [ ] Confirmado

REGRA RCA-03
  Condição: TODOS os custos estão IN (Finalizado, CanceladoPeloOV)
            AND ≥1 está Finalizado
            AND OV.Status == Finalizado
  Ação:     Solicitação → AguardandoAprovacaoCliente
  [ ] Confirmado

REGRA RCA-04
  Condição: TODOS os custos estão IN (Finalizado, CanceladoPeloOV)
            AND ≥1 está Finalizado
            AND (OV.Status == EmAndamento  OU  OV não existe)
  Ação:     Solicitação → AguardandoOrcamentoVenda
  [ ] Confirmado

REGRA RCA-05
  Condição: ≥1 custo NÃO está em (Finalizado, CanceladoPeloOV, ReabertoPeloOV)
            (ou seja, Pendente ou EmAndamento)
  Ação:     Solicitação → AguardandoDespachante
  [ ] Confirmado

REGRA RCA-06  [Menor prioridade]
  Condição: Nenhum CustoDespachante associado
  Ação:     Solicitação → Rascunho
  [ ] Confirmado

  Anotação sobre prioridade das regras: ________________
```

---

## Resumo de Confirmações

| Módulo | Total | Confirmados | Revisar |
|--------|-------|-------------|---------|
| 1 — SolicitacaoOrcamento | 11 | — | — |
| 2 — CustoDespachante | 10 | — | — |
| 3 — OrcamentoVenda | 9 | — | — |
| 4 — Fluxos Ponta a Ponta | 6 | — | — |
| 5 — Imutabilidade | 4 | — | — |
| 6 — Regras de Recálculo | 6 | — | — |
| **Total** | **46** | — | — |

---

## Questões em Aberto (responder antes de implementar)

```
Q1: Ao criar uma solicitação, os despachantes são adicionados na mesma tela/request,
    ou primeiro cria-se a solicitação e depois associam-se os despachantes?
    → Resposta: ___________________________________________

Q2: O OV é criado automaticamente quando o status da solicitação chega em
    AguardandoOrcamentoVenda, ou o comercial cria manualmente?
    → Resposta: ___________________________________________

Q3: Quando o OV é reaberto (3B-01), os custos que estavam CanceladoPeloOV
    permanecem cancelados ou podem ser reativados?
    → Resposta: ___________________________________________

Q4: Existe um papel/role específico "Despachante" na plataforma (usuário vinculado)
    ou qualquer usuário autorizado pode editar o custo de qualquer despachante?
    → Resposta: ___________________________________________

Q5: Ao solicitar reabertura de custo (2B-01), os dados copiados para a nova versão
    incluem apenas os campos do CustoDespachante ou também os itens (LIs, despesas, NCMs)?
    → Resposta: ___________________________________________

Q6: O campo Status na tabela SolicitacaoOrcamentoDespachante (tabela de vínculo)
    deve ser removido ou mantido para rastreabilidade histórica?
    → Resposta: ___________________________________________
```
