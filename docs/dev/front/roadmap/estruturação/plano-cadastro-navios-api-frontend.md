# Plano Revisado — Navios em Cadastros + Trajeto Operacional Bidirecional

> Projeto: import-costs / comex133_api  
> Objetivo: padronizar Navio como cadastro mestre, modelar Trajeto como entidade operacional de primeira classe com sincronizacao bidirecional com Embarques, e usar Logistica como visao operacional consolidada.

---

## 1. Decisao Arquitetural

A partir desta revisao:

- **Navio** e entidade de cadastro mestre (estatica), gerenciada em Cadastros.
- **NavioTrajeto** e entidade operacional de primeira classe — representa uma perna da viagem (Porto A → Porto B com ETD e ETA).
  - Pode ser atualizado pela tela de Logistica/Controle de Navios.
  - Atualizacoes no trajeto refletem no Embarque vinculado (ex.: ETA atualizado).
- **EmbarqueNavioVinculo** e a tabela de ligacao entre Embarque e o trecho especifico do navio onde aquela carga esta embarcada.
  - Atualizacoes no Embarque (ex.: mudanca de porto destino) podem refletir no trajeto associado.
- **Logistica/Controle de Navios** e visao operacional: lista navios que tem embarques ativos, seus trajetos e a posicao atual no porto.

Resumo funcional:

1. **Cadastros/Navios**: cria, edita, ativa/inativa navios (dados fixos do navio).
2. **Embarque Aduana**: associa o embarque a um navio e a uma perna especifica do trajeto.
3. **Logistica/Controle de Navios**:
   - Gerencia trajetos de navios em operacao (pernas Porto A → Porto B, ETD/ETA, status, sequencia).
   - Visualiza embarques ativos por navio.
   - Permite ver "navio esta no Porto X" e listar quais embarques estao naquele porto.
   - Atualizacoes de trajeto refletem nos embarques vinculados.

---

## 2. Regras de Negocio

### 2.1 Navio

- Cadastro mestre imutavel durante operacao (nome, IMO, armador).
- Ativo/Inativo: somente navios ativos podem ser vinculados a novos embarques.
- Exclusao bloqueada quando houver vinculo de embarque ativo.

### 2.2 NavioTrajeto (perna da viagem)

- Representa um trecho: Porto Origem → Porto Destino, com ETD, ETA e Status.
- Um navio pode ter multiplos trechos em sequencia para a mesma viagem.
- Status de perna: Previsto, Em Transito, Atracado, Concluido.
- "Porto atual do navio" = porto destino da perna com status Atracado ou porto origem da perna Em Transito.
- Atualizacao do ETA de uma perna dispara atualizacao do ETA esperado nos embarques vinculados a essa perna.

### 2.3 EmbarqueNavioVinculo

- Liga um Embarque Aduana a um Navio e, opcionalmente, a uma perna especifica (NavioTrajetoId).
- Um embarque tem no maximo 1 vinculo ativo por vez.
- Historico de trocas de navio e mantido (vinculo anterior fica inativo).
- Campos de rota do embarque (ex.: ETA prevista de chegada) sao derivados/sincronizados da perna vinculada.

### 2.4 Sincronizacao bidirecional

- **Trajeto → Embarque**: quando ETA/status de uma perna e atualizado, todos os embarques vinculados a essa perna devem ter seu ETA esperado atualizado.
- **Embarque → Trajeto**: quando porto de destino do embarque e alterado, o vinculo e atualizado para a perna correspondente.
- Regra de conflito: a ultima atualizacao vence (sem merge automatico); o usuario e responsavel por validar discrepancias.

### 2.5 Visao operacional em Logistica

- Somente aparecem navios com pelo menos 1 embarque ativo vinculado.
- Embarque ativo: status com ordem menor que Entregue/Finalizado.
- Quando todos os embarques ativos de um navio sao encerrados, o navio sai da visao operacional.

---

## 3. Modelo de Dados

### 3.1 Navio (cadastro mestre)

```
Navio
  Id
  NomeNavio          (obrigatorio)
  CodigoImo          (opcional, unico quando informado)
  Armador            (opcional)
  Observacao         (opcional)
  Ativo              (bool)
  CriadoEm
  AtualizadoEm
```

Nota: NumeroViagem nao fica no cadastro mestre do navio — varia por operacao e fica no vinculo.

### 3.2 NavioTrajeto (perna da viagem)

```
NavioTrajeto
  Id
  NavioId            (FK → Navio)
  NumeroViagem       (ex.: "V-2026-041", agrupa pernas da mesma viagem)
  Sequencia          (int, ordem das pernas: 1, 2, 3...)
  PortoOrigemId      (FK → Porto)
  PortoDestinoId     (FK → Porto)
  Etd                (date, estimativa de saida do porto origem)
  Eta                (date, estimativa de chegada no porto destino)
  StatusPerna        (enum: Previsto | EmTransito | Atracado | Concluido)
  Observacao         (opcional)
  CriadoEm
  AtualizadoEm
```

Regra de posicao atual:
- Porto atual do navio = PortoDestino da perna com StatusPerna = Atracado (mais recente)
- Se nenhuma Atracado: PortoOrigem da perna Em Transito

### 3.3 EmbarqueNavioVinculo (ligacao embarque x perna)

```
EmbarqueNavioVinculo
  Id
  EmbarqueAduanaId   (FK → EmbarqueAduana)
  NavioId            (FK → Navio)
  NavioTrajetoId     (FK → NavioTrajeto, opcional — perna especifica onde a carga esta)
  NumeroViagem       (desnormalizado para facilitar queries sem join)
  Ativo              (bool)
  VinculadoEm
  DesvinculadoEm     (nullable)
  Observacao         (opcional)
```

Regras:
- 1 EmbarqueNavioVinculo ativo por EmbarqueAduanaId.
- NavioTrajetoId pode ser nulo inicialmente e informado depois conforme a operacao.
- Historico e mantido (registros inativos).

### 3.4 Compatibilidade legada

- EmbarqueAduana.controleNavioId permanece durante transicao.
- Sincronizacao: ao criar/atualizar EmbarqueNavioVinculo, atualizar tambem controleNavioId do embarque.
- No futuro, controleNavioId pode ser depreciado em favor do vinculo dedicado.

---

## 4. Fluxos Operacionais

### Fluxo 1 — Cadastrar navio e preparar viagem

1. Criar Navio em Cadastros.
2. Criar NavioTrajeto pernas da viagem (via tela de Logistica ou API).
3. Embarque associa o navio e opcionalmente a perna especifica.

### Fluxo 2 — Acompanhar embarque pelo navio

1. Abrir Logistica/Controle de Navios.
2. Ver navio com embarques ativos listados.
3. Ver em qual porto o navio esta atualmente.
4. Atualizar ETA de uma perna → embarques vinculados atualizam automaticamente.

### Fluxo 3 — Ver por porto qual embarque esta la

1. Abrir Logistica, selecionar um navio.
2. Ver trajeto com pernas e status.
3. Na perna com status Atracado ou Em Transito, ver lista de embarques daquela perna.
4. Isso responde: "navio esta no Porto X, os embarques A, B e C estao nele".

### Fluxo 4 — Embarque atualiza rota

1. Operador abre embarque, muda porto de destino.
2. Sistema atualiza o NavioTrajetoId do vinculo para a nova perna correspondente (ou operador seleciona a perna).
3. ETA do embarque e derivada da perna vinculada.

---

## 5. Escopo API — Ordem de Implementacao

### API-01 — Cadastros/Navios

```
GET    /api/navios
GET    /api/navios/{id}
POST   /api/navios
PUT    /api/navios/{id}
PATCH  /api/navios/{id}/ativo
DELETE /api/navios/{id}   (bloqueado se houver vinculo ativo)
```

### API-02 — NavioTrajeto (pernas da viagem)

```
GET    /api/navios/{navioId}/trajetos
POST   /api/navios/{navioId}/trajetos
PUT    /api/navios/{navioId}/trajetos/{id}
DELETE /api/navios/{navioId}/trajetos/{id}
PATCH  /api/navios/{navioId}/trajetos/{id}/status
```

Ao atualizar ETA via PUT ou PATCH/status:
- disparar sincronizacao de ETA nos EmbarqueNavioVinculo vinculados a essa perna.

### API-03 — EmbarqueNavioVinculo

```
GET    /api/embarques/{embarqueId}/navio-vinculo
POST   /api/embarques/{embarqueId}/navio-vinculo
PATCH  /api/embarques/{embarqueId}/navio-vinculo
DELETE /api/embarques/{embarqueId}/navio-vinculo
```

Ao criar/atualizar vinculo:
- sincronizar EmbarqueAduana.controleNavioId durante transicao.

### API-04 — Logistica operacional (visao consolidada)

```
GET /api/logistica/controle-navios
GET /api/logistica/controle-navios/{navioId}
```

Retorna:
- navio com pernas de trajeto ativas.
- por perna: porto atual, embarques vinculados.
- filtro obrigatorio: somente navios com embarque ativo.

Query util: "qual porto esta o navio e quais embarques estao la":
- perna com StatusPerna = Atracado ou EmTransito, com embarques vinculados listados.

---

## 6. Escopo Frontend — Ordem de Implementacao

### FE-01 — Cadastro de Navios em Cadastros

- Listagem, criacao, edicao, ativacao/inativacao.
- Padrao dos outros cadastros do sistema.

### FE-02 — Embarque Aduana

- Select de navio (GET /api/navios — ativos).
- Ao selecionar navio, carregar pernas disponíveis (GET /api/navios/{id}/trajetos).
- Operador pode vincular embarque a uma perna especifica.
- Ao salvar: criar/atualizar EmbarqueNavioVinculo.

### FE-03 — Logistica/Controle de Navios

- Consumir GET /api/logistica/controle-navios.
- Mostrar somente navios com embarques ativos.
- Expandir para ver pernas do trajeto e embarques por perna.
- Permitir atualizar ETA/status de uma perna diretamente na tela.
- Atualizacao de perna exibe quais embarques serao afetados antes de confirmar.
- Coluna/indicador de "porto atual do navio".

### FE-04 — Transicao de compatibilidade

- Manter leitura do campo legado controleNavioId enquanto nao for migrado.
- Migrar gradualmente para EmbarqueNavioVinculo como fonte de verdade.

---

## 7. Contratos de Integracao

### 7.1 Navio

```json
{
  "id": 12,
  "nomeNavio": "MSC Aurora",
  "codigoImo": "9876543",
  "armador": "MSC",
  "observacao": "",
  "ativo": true
}
```

### 7.2 NavioTrajeto

```json
{
  "id": 55,
  "navioId": 12,
  "numeroViagem": "V-2026-041",
  "sequencia": 2,
  "portoOrigemId": 3,
  "portoOrigemNome": "Shanghai",
  "portoDestinoId": 8,
  "portoDestinoNome": "Santos",
  "etd": "2026-04-15",
  "eta": "2026-05-10",
  "statusPerna": "EmTransito"
}
```

### 7.3 EmbarqueNavioVinculo

```json
{
  "id": 101,
  "embarqueAduanaId": 9001,
  "navioId": 12,
  "navioTrajetoId": 55,
  "numeroViagem": "V-2026-041",
  "ativo": true,
  "vinculadoEm": "2026-04-01T10:20:00Z"
}
```

### 7.4 Logistica consolidada — visao por navio

```json
{
  "items": [
    {
      "navioId": 12,
      "nomeNavio": "MSC Aurora",
      "numeroViagem": "V-2026-041",
      "portoAtualNome": "Shanghai",
      "embarquesAtivos": 3,
      "trajetos": [
        {
          "id": 55,
          "sequencia": 2,
          "portoOrigemNome": "Shanghai",
          "portoDestinoNome": "Santos",
          "etd": "2026-04-15",
          "eta": "2026-05-10",
          "statusPerna": "EmTransito",
          "embarques": [
            {
              "embarqueId": 9001,
              "codigoInterno": "EMB-2026-001",
              "status": "EmTransito",
              "importadorNome": "Empresa X"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 8. Criticos de Negocio

- Navio e cadastro mestre, gerenciado em Cadastros, nao em Logistica.
- Trajeto (NavioTrajeto) e entidade operacional de primeira classe — nao derivada do embarque.
- Vinculo embarque x perna do trajeto permite localizar embarques por porto.
- Atualizacao de ETA/status do trajeto sincroniza embarques vinculados automaticamente.
- Visao de Logistica: somente navios com embarques ativos. Sem embarque ativo, navio nao aparece.
- "Porto atual do navio" e derivado da perna com status Atracado ou Em Transito.
- Exclusao de navio bloqueada se houver vinculo ativo.

---

## 9. Plano de Entrega — Sequencia Obrigatoria

1. API-01: Cadastros/Navios
2. API-02: NavioTrajeto (pernas)
3. API-03: EmbarqueNavioVinculo
4. API-04: Logistica operacional consolidada
5. FE-01: Cadastro de Navios em Cadastros
6. FE-02: Embarque com vinculo a navio e perna
7. FE-03: Logistica operacional com trajetos e embarques por perna

---

## 10. Criterios de Aceite

- Existe cadastro de navio em Cadastros com API funcionando.
- Embarque associa navio e perna de trajeto via vinculo dedicado.
- Tela de Logistica lista somente navios com embarques ativos.
- Atualizacao de ETA numa perna reflete no ETA esperado dos embarques vinculados.
- E possivel ver "navio esta no Porto X" e listar embarques daquela perna.
- Ao encerrar todos os embarques ativos de um navio, navio sai da visao operacional.
- Fluxo fim a fim validado: cadastrar navio → criar trajeto com pernas → vincular embarque a perna → visualizar em Logistica → atualizar ETA → ver reflexo no embarque.

---

## 11. Observacao de Execucao

Este documento define a reorganizacao funcional e tecnica completa.
Implementacao segue a sequencia de etapas acima.
Nenhuma etapa deve ser pulada — cada uma e pre-requisito da proxima.

Proxima etapa de implementacao deve seguir exatamente a ordem:

- primeiro API;
- depois Frontend.
