# Análise de Conformidade — Phase 5: Navios

**Data**: 2026-04-17  
**Status**: ⚠️ **PASSAR FALHOU** — Gaps críticos entre plano e implementação

---

## 1. Resumo Executivo

O documento de plano (`plano-cadastro-navios-api-frontend.md`) define uma arquitetura clara e regras de negócio bem estruturadas. Porém, a implementação tem **3 gaps críticos** que impedem a regra de negócio funcionar completamente:

1. ❌ **Sincronização Bidirecional vazia** — `SyncEtaEmbarquesAsync()` não implementada
2. ❌ **Campo legado não sincronizado** — `EmbarqueAduana.controleNavioId` não atualizado ao criar vínculo
3. ⚠️ **Frontend não mapeia embarques** — `ControleNavioTrajeto` não tem campo para embarques

---

## 2. Confrontação Detalhada

### ✅ Regra 1: Navio é cadastro mestre

**Plano (Seção 2.1)**:
```
- Cadastro mestre imutável durante operação (nome, IMO, armador).
- Ativo/Inativo: somente navios ativos podem ser vinculados a novos embarques.
- Exclusão bloqueada quando houver vínculo de embarque ativo.
```

**Implementação**:
- ✅ Entity `Navio` implementada corretamente
- ✅ Controller em `/api/navios` com CRUD
- ✅ **Bloqueio de exclusão**: `NaviosService.DeleteAsync()` (linha 79-86) verifica `hasVinculo` antes de deletar
- ✅ **Validação de navio ativo**: `CreateVinculoAsync()` (linha 230) valida `if (!navio.Ativo) throw...`

**Status**: ✅ **CONFORME**

---

### ✅ Regra 2: NavioTrajeto é perna da viagem

**Plano (Seção 2.2)**:
```
- Representa um trecho: Porto Origem → Porto Destino, com ETD, ETA e Status.
- Um navio pode ter múltiplos trechos em sequência para a mesma viagem.
- Status de perna: Previsto, Em Trânsito, Atracado, Concluído.
- Porto atual do navio = porto destino da perna com status Atracado ou porto origem da perna Em Trânsito.
- Atualização do ETA de uma perna dispara atualização do ETA esperado nos embarques vinculados.
```

**Implementação**:
- ✅ Entity `NavioTrajeto` implementada
- ✅ Endpoints `/api/navios/{navioId}/trajetos` CRUD
- ✅ Cálculo de **Porto Atual**: `GetControleNaviosOperacionalAsync()` (linha 334-341) calcula corretamente:
  ```csharp
  var pernaAtual = trajetosDoNavio
      .Where(t => t.StatusPerna == StatusPerna.Atracado || t.StatusPerna == StatusPerna.EmTransito)
      .OrderByDescending(t => t.Sequencia)
      .FirstOrDefault();
  ```
- ❌ **Sincronização ETA vazia**: `SyncEtaEmbarquesAsync()` (linha 401-407) é apenas placeholder:
  ```csharp
  private async Task SyncEtaEmbarquesAsync(int trajetoId, DateTime novaEta)
  {
      // Futura extensão: atualizar campo de ETA esperado nos embarques vinculados
      // Atualmente apenas registra — implementar conforme o campo for adicionado ao SolicitacaoOrcamento
      await Task.CompletedTask;
  }
  ```

**Status**: ⚠️ **PARCIALMENTE CONFORME** — Falta sincronização de ETA

---

### ✅ Regra 3: EmbarqueNavioVinculo liga embarque a navio + perna

**Plano (Seção 2.3)**:
```
- Liga um Embarque Aduana a um Navio e, opcionalmente, a uma perna específica.
- Um embarque tem no máximo 1 vínculo ativo por vez.
- Histórico de trocas de navio é mantido (vínculo anterior fica inativo).
- Campos de rota do embarque (ex.: ETA prevista de chegada) são derivados/sincronizados da perna vinculada.

[Seção 3.4 — Compatibilidade legada]:
- EmbarqueAduana.controleNavioId permanece durante transição.
- Sincronização: ao criar/atualizar EmbarqueNavioVinculo, atualizar também controleNavioId do embarque.
```

**Implementação**:
- ✅ Entity `EmbarqueNavioVinculo` implementada
- ✅ Endpoints `/api/embarques/{id}/navio-vinculo` GET/POST/PATCH/DELETE
- ✅ **1 vínculo ativo por embarque**: `CreateVinculoAsync()` (linha 232-239) desativa anterior:
  ```csharp
  var vinculoAtivo = await _db.EmbarqueNavioVinculos
      .FirstOrDefaultAsync(v => v.EmbarqueAduanaId == embarqueId && v.Ativo);
  if (vinculoAtivo is not null)
  {
      vinculoAtivo.Ativo = false;
      vinculoAtivo.DesvinculadoEm = DateTime.UtcNow;
  }
  ```
- ❌ **Campo legado NÃO sincronizado**: Em `CreateVinculoAsync()` (linha 218-253), NÃO há linha que atualiza `embarque.controleNavioId`
  - Deveria ter algo como: `embarque.controleNavioId = request.NavioId;` após criar vínculo

**Status**: ⚠️ **PARCIALMENTE CONFORME** — Falta sincronizar `controleNavioId`

---

### ✅ Regra 4: Sincronização bidirecional

**Plano (Seção 2.4)**:
```
- Trajeto → Embarque: quando ETA/status de uma perna é atualizado, 
  todos os embarques vinculados a essa perna devem ter seu ETA esperado atualizado.
- Embarque → Trajeto: quando porto de destino do embarque é alterado, 
  o vínculo é atualizado para a perna correspondente.
```

**Implementação**:
- ❌ **Trajeto → Embarque**: `SyncEtaEmbarquesAsync()` é vazia (placeholder)
- ❌ **Embarque → Trajeto**: Não implementado (seria em feature de alterar embarque)

**Status**: ❌ **NÃO CONFORME**

---

### ✅ Regra 5: Visão operacional em Logística

**Plano (Seção 2.5)**:
```
- Somente aparecem navios com pelo menos 1 embarque ativo vinculado.
- Embarque ativo: status com ordem menor que Entregue/Finalizado.
- Quando todos os embarques ativos de um navio são encerrados, o navio sai da visão operacional.
```

**Implementação**:
- ✅ Endpoint `GET /api/logistica/controle-navios` implementado
- ✅ **Filtro de embarques ativos**: `GetControleNaviosOperacionalAsync()` (linha 300-307) filtra:
  ```csharp
  var statusFinais = new[] { "Entregue", "Finalizado", "Cancelado" };
  var vinculosAtivos = vinculos
      .Where(v => !statusFinais.Contains(v.EmbarqueAduana.Status, StringComparer.OrdinalIgnoreCase))
      .ToList();
  ```
- ✅ **Navios com embarque ativo**: (linha 311) `if (!vinculosAtivos.Any()) return new List<NavioOperacionalDto>();`
- ✅ **Estrutura retornada**: Inclui `navioId`, `nomeNavio`, `embarquesAtivos`, `portoAtualNome`, `trajetos` com embarques

**Status**: ✅ **CONFORME**

---

### ❌ Problema: Frontend não mapeia resposta corretamente

**O que o backend retorna** (`NavioOperacionalDto`):
```json
{
  "navioId": 12,
  "nomeNavio": "MSC Aurora",
  "embarquesAtivos": 3,
  "portoAtualNome": "Shanghai",
  "trajetos": [
    {
      "id": 55,
      "numeroViagem": "V-2026-041",
      "sequencia": 1,
      "portoOrigemNome": "Shanghai",
      "portoDestinoNome": "Santos",
      "etd": "2026-04-15",
      "eta": "2026-05-10",
      "statusPerna": "EmTransito",
      "embarques": [         // ← NOVO: Lista de embarques por perna
        {
          "embarqueId": 9001,
          "codigoInterno": "EMB-2026-001",
          "status": "EmTransito",
          "numeroViagem": "V-2026-041"
        }
      ]
    }
  ]
}
```

**O que o frontend espera** (`ControleNavioService.refres hTrajetos()`, linha 207):
```typescript
// Interface mapeada
interface NavioTrajetoApiDto {
  id: number;
  navioId: number;
  numeroViagem: string;
  sequencia: number;
  portoOrigemId: number;
  portoOrigemNome: string;
  portoDestinoId: number;
  portoDestinoNome: string;
  etd: string;
  eta: string;
  statusPerna: 'Previsto' | 'EmTransito' | 'Atracado' | 'Concluido';
  observacao?: string;
  // ❌ FALTA: embarques: EmbarqueResumoDto[]
  // ❌ FALTA: informações de porto atual do navio
}
```

**Mapeamento no frontend** (`ControleNavioTrajeto`):
```typescript
private mapTrajetoDto(dto: NavioTrajetoApiDto): ControleNavioTrajeto {
    return {
      id: dto.id.toString(),
      controleNavioId: dto.navioId.toString(),
      portoOrigemId: dto.portoOrigemId.toString(),
      portoOrigemNome: dto.portoOrigemNome,
      portoDestinoId: dto.portoDestinoId.toString(),
      portoDestinoNome: dto.portoDestinoNome,
      etd: this.toDateOnly(dto.etd),
      eta: this.toDateOnly(dto.eta),
      trajetoDescricao: dto.observacao
      // ❌ FALTA: embarques (array)
      // ❌ FALTA: porto atual do navio
    };
}
```

**Status**: ❌ **NÃO CONFORME** — Frontend não pode exibir embarques por trajeto

---

## 3. Fluxo de Negócio vs Implementação

### Fluxo 1: "Criar navio, adicionar trajetos, vincular embarque"

```
1. CREATE navio em Cadastros
   ✅ Implementado: POST /api/navios
   
2. CREATE trajectos (pernas da viagem)
   ✅ Implementado: POST /api/navios/{navioId}/trajetos
   
3. No embarque, ASSOCIAR navio (criar vínculo)
   ✅ Implementado: POST /api/embarques/{embarqueId}/navio-vinculo
   ⚠️ MAS: embarque.controleNavioId NÃO é sincronizado → UI antiga quebra
   
4. VISUALIZAR navio em Logística/Controle de Navios
   ✅ Implementado: GET /api/logistica/controle-navios
   ⚠️ MAS: Frontend não mapeia embarques da resposta
```

**Status**: ⚠️ **FUNCIONA PARCIALMENTE** — Falta UI do frontend

---

### Fluxo 2: "Ver navio em logística, atualizar ETA, embarque reflete automaticamente"

```
1. VISUALIZAR navio com embarques em Logística
   ✅ Implementado: GET /api/logistica/controle-navios
   ⚠️ MAS: Frontend não exibe embarques
   
2. ATUALIZAR ETA de uma perna
   ✅ Implementado: PUT /api/navios/{navioId}/trajetos/{id}
   ⚠️ MAS: SyncEtaEmbarquesAsync() é vazia → embarques NÃO sincronizam
   
3. EMBARQUE REFLETE automaticamente
   ❌ NÃO IMPLEMENTADO: campo ETA no embarque não sincroniza
```

**Status**: ❌ **NÃO FUNCIONA COMPLETAMENTE**

---

## 4. Checklist de Ações Necessárias

### 🔴 BLOQUEADORES (Crítico — impedem fluxo)

- [ ] **A1**: Implementar `SyncEtaEmbarquesAsync()`
  - **Localização**: `comex133_api/Features/Navios/NaviosService.cs:401`
  - **O que fazer**: Buscar embarques vinculados à perna e atualizar seu ETA (quando campo for criado)
  - **Afeta**: Fluxo 2 — sincronização automática ETA

- [ ] **A2**: Sincronizar `controleNavioId` ao criar/atualizar vínculo
  - **Localização**: `comex133_api/Controllers/EmbarqueNavioVinculoController.cs` ou `NaviosService.CreateVinculoAsync()`
  - **O que fazer**: Após criar vínculo, atualizar `SolicitacaoOrcamento.controleNavioId = request.NavioId`
  - **Afeta**: Compatibilidade com UI existente (embarque-aduana)

- [ ] **A3**: Atualizar interfaces de TypeScript no frontend
  - **Localização**: `import-costs/src/app/v2/features/logistica/controle-navios/services/controle-navio.service.ts`
  - **O que fazer**: 
    - Adicionar `embarques: EmbarqueResumDto[]` a `NavioTrajetoApiDto`
    - Adicionar `portoAtualNome?: string` e `embarquesAtivos: number` à interface de Navio
    - Atualizar `ControleNavioTrajeto` para incluir embarques
  - **Afeta**: FE-03 — exibição de embarques por trajeto

### 🟡 COMPLEMENTOS (Necessário para UI funcionar)

- [ ] **B1**: Criar/completar componente FE-02 (embarque-aduana vínculo)
  - Integrar seletor de navio no embarque
  - Chamadas para vincular/desvincular

- [ ] **B2**: Criar componente FE-03 (logística operacional)
  - Exibir navios com embarques por trajeto
  - Exibir porto atual do navio
  - Permitir atualizar status/ETA de perna

---

## 5. Resumo de Gaps

| Regra | Status | Gap |
|-------|--------|-----|
| **Navio mestre** | ✅ OK | Nenhum |
| **NavioTrajeto operacional** | ⚠️ Parcial | Sincronização ETA vazia |
| **EmbarqueNavioVinculo** | ⚠️ Parcial | Campo legado não sincronizado |
| **Sincronização bidirecional** | ❌ Não | ETA não sincroniza em embarques |
| **Visão Logística operacional** | ✅ OK | Backend retorna corretamente |
| **Frontend mapeia resposta** | ❌ Não | Interfaces desatualizadas, embarques não mapeados |

---

## 6. Recomendação

**Ação Imediata**: Resolver bloqueadores A1, A2, A3 antes de continuar com FE-02 e FE-03.  
**Prioridade**: A2 > A1 > A3 (garante compatibilidade legada antes de novas features)  
**Validação**: Após cada ação, testar end-to-end:
1. Criar embarque
2. Vincular navio (conferir se `controleNavioId` atualiza)
3. Ver em Logística
4. Atualizar ETA de perna (conferir se embarque reflete)

---

