# 🔍 Revisão Concluída — Phase 5: Navios

**Data**: 2026-04-17  
**Confrontação**: Plano vs Implementação Real  
**Resultado**: ⚠️ **3 GAPS CRÍTICOS** identificados

---

## 📋 Resumo Executivo

A arquitetura descrita no plano está **80% implementada no backend**, mas há **3 gaps que impedem o fluxo de negócio funcionar completamente**:

| # | Gap | Status | Impacto | Ação |
|---|-----|--------|--------|------|
| **1** | `SyncEtaEmbarquesAsync()` vazia | 🔴 Crítico | ETA de embarques não sincroniza quando trajeto muda | A1 |
| **2** | `controleNavioId` não sincronizado | 🔴 Crítico | UI legada de embarque quebra (campo não preenchido) | A2 |
| **3** | Frontend não mapeia embarques | 🔴 Crítico | Logística não exibe embarques por trajeto | A3 |

---

## ✅ O que Está Conforme

```
✅ Navio é cadastro mestre (CRUD em Cadastros)
✅ NavioTrajeto é perna com status Previsto→EmTransito→Atracado→Concluído
✅ EmbarqueNavioVinculo liga embarque a navio + perna específica
✅ Visão de Logística retorna apenas navios com embarques ATIVOS
✅ Cálculo de "Porto Atual" correto (Atracado mais recente ou origem do EmTransito)
✅ Bloqueio de exclusão quando há vínculo ativo
✅ 1 vínculo ativo por embarque (desativa anterior quando cria novo)
✅ Build backend: 0 erros
```

---

## 🔴 Gaps Encontrados

### Gap 1: Sincronização de ETA Vazia

**Arquivo**: `comex133_api/Features/Navios/NaviosService.cs` (linha 401-407)

**Código atual**:
```csharp
private async Task SyncEtaEmbarquesAsync(int trajetoId, DateTime novaEta)
{
    // Futura extensão: atualizar campo de ETA esperado nos embarques vinculados
    // Atualmente apenas registra — implementar conforme o campo for adicionado ao SolicitacaoOrcamento
    await Task.CompletedTask;  // ← VAZIO!
}
```

**Problema**: 
- Quando atualiza ETA de trajeto via `PUT /api/navios/{id}/trajetos/{id}`, embarques vinculados **não sincronizam**
- Viola a regra: "_Trajeto → Embarque: quando ETA/status de uma perna é atualizado, todos os embarques vinculados a essa perna devem ter seu ETA esperado atualizado_"

**Impacto**: Operacional não sabe ETA real dos embarques se muda durante transporte

---

### Gap 2: Campo Legado Não Sincronizado

**Arquivo**: `comex133_api/Features/Navios/NaviosService.cs` (linha 218-253 CreateVinculoAsync)

**Problema**:
- Plano diz: "_Sincronização: ao criar/atualizar EmbarqueNavioVinculo, atualizar também controleNavioId do embarque_"
- Implementação: **não faz isso**
- Quando cria vínculo, `SolicitacaoOrcamento.controleNavioId` fica `null`

**Código faltando**:
```csharp
public async Task<EmbarqueNavioVinculoDto> CreateVinculoAsync(int embarqueId, CreateEmbarqueNavioVinculoRequest request)
{
    // ... linhas 223-252 ...
    
    // ← FALTA ISTO:
    var embarque = await _db.SolicitacoesOrcamento.FindAsync(embarqueId);
    if (embarque != null)
    {
        embarque.controleNavioId = request.NavioId;  // Sincronizar!
    }
    
    await _db.SaveChangesAsync();
}
```

**Impacto**: 
- UI legada de EmbarqueAduanaComponent que lê `controleNavioId` quebra ou fica vazio
- Não há compatibilidade durante transição entre velha e nova arquitetura

---

### Gap 3: Frontend Não Mapeia Estrutura Operacional

**Arquivo**: `import-costs/src/app/v2/features/logistica/controle-navios/services/controle-navio.service.ts`

**Problema**:

Backend retorna (NodeOperacionalDto):
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
      "embarques": [         // ← NOVO! Lista de embarques
        {
          "embarqueId": 9001,
          "codigoInterno": "EMB-2026-001",
          "status": "Em Transito"
        }
      ]
    }
  ]
}
```

Frontend espera (NavioTrajetoApiDto):
```typescript
interface NavioTrajetoApiDto {
  id: number;
  numeroViagem: string;
  portoOrigemNome: string;
  portoDestinoNome: string;
  etd: string;
  eta: string;
  statusPerna: string;
  // ❌ FALTAM:
  // embarques: EmbarqueResumo[];
  // portoAtualNome?: string;
}
```

E mapeia assim (line 227):
```typescript
private mapTrajetoDto(dto: NavioTrajetoApiDto): ControleNavioTrajeto {
    return {
        id: dto.id.toString(),
        // ... mapeia apenas 8 campos
        // ❌ Não mapeia: embarques, portoAtual
    };
}
```

**Impacto**: 
- Componente de Logística **não consegue exibir embarques por trajeto**
- "Navio X está em Porto Y com embarques Z" não pode ser mostrado
- Feature FE-03 fica impossível

---

## 🎯 Como "Reparar" (Ações)

### Ação 1: Implementar Sincronização ETA (15 min)

**Arquivo**: `comex133_api/Features/Navios/NaviosService.cs:401`

Substituir método vazio por:
```csharp
private async Task SyncEtaEmbarquesAsync(int trajetoId, DateTime novaEta)
{
    var vinculados = await _db.EmbarqueNavioVinculos
        .Where(v => v.NavioTrajetoId == trajetoId && v.Ativo)
        .Include(v => v.EmbarqueAduana)
        .ToListAsync();
    
    foreach (var v in vinculados)
    {
        if (v.EmbarqueAduana != null)
        {
            // Assumindo que SolicitacaoOrcamento tem campo EtaEsperada
            // Se não tiver, criar field primeiro
            v.EmbarqueAduana.EtaEsperada = novaEta;
        }
    }
    
    if (vinculados.Any())
        await _db.SaveChangesAsync();
}
```

---

### Ação 2: Sincronizar controleNavioId (10 min)

**Arquivo**: `comex133_api/Features/Navios/NaviosService.cs`

Em `CreateVinculoAsync()` (após linha 252, antes de SaveChanges):
```csharp
// Adicionar estas 4 linhas:
var embarque = await _db.SolicitacoesOrcamento.FindAsync(embarqueId);
if (embarque != null)
{
    embarque.controleNavioId = request.NavioId;
}
```

Em `DeleteVinculoAsync()` (após linha 286, antes de SaveChanges):
```csharp
// Adicionar estas 4 linhas:
var embarque = await _db.SolicitacoesOrcamento.FindAsync(embarqueId);
if (embarque != null)
{
    embarque.controleNavioId = null;
}
```

---

### Ação 3: Atualizar TypeScript Interfaces (20 min)

**Arquivo**: `import-costs/src/app/v2/features/logistica/controle-navios/services/controle-navio.service.ts`

1. Adicionar interface de embarque (antes de LogisticaControleNavioApiDto):
```typescript
interface EmbarqueResumoApiDto {
  embarqueId: number;
  codigoInterno: string;
  status: string;
  numeroViagem?: string;
}
```

2. Renomear NavioTrajetoApiDto → NavioTrajetoOperacionalApiDto e adicionar embarques:
```typescript
interface NavioTrajetoOperacionalApiDto {
  id: number;
  numeroViagem: string;
  sequencia: number;
  portoOrigemId: number;
  portoOrigemNome: string;
  portoDestinoId: number;
  portoDestinoNome: string;
  etd: string;
  eta: string;
  statusPerna: 'Previsto' | 'EmTransito' | 'Atracado' | 'Concluido';
  embarques: EmbarqueResumoApiDto[];  // ← NOVO
}
```

3. Atualizar LogisticaControleNavioApiDto:
```typescript
interface LogisticaControleNavioApiDto {
  navioId: number;
  nomeNavio: string;
  codigoImo?: string;
  armador?: string;
  embarquesAtivos: number;    // ← NOVO
  portoAtualNome?: string;    // ← NOVO
  trajetos: NavioTrajetoOperacionalApiDto[];  // Use interface nova
}
```

4. Atualizar mapeamento (linha 227-236):
```typescript
private mapTrajetoDto(dto: NavioTrajetoOperacionalApiDto): ControleNavioTrajeto {
    return {
        id: dto.id.toString(),
        controleNavioId: dto.navioId.toString(),
        portoOrigemId: dto.portoOrigemId.toString(),
        portoOrigemNome: dto.portoOrigemNome,
        portoDestinoId: dto.portoDestinoId.toString(),
        portoDestinoNome: dto.portoDestinoNome,
        etd: this.toDateOnly(dto.etd),
        eta: this.toDateOnly(dto.eta),
        trajetoDescricao: '',
        embarques: dto.embarques || []  // ← MAPEAR EMBARQUES
    };
}
```

---

## ✔️ Validação (Após aplicar ações)

### Backend
```bash
cd c:\dev\prototipos-html\comex133_api
dotnet build  # Deve passar sem erros
dotnet run    # Deve iniciar sem erros
```

### Frontend
```bash
cd c:\dev\prototipos-html\import-costs
npm run build  # Deve compilar sem erros TypeScript
```

### End-to-End
1. Criar embarque
2. Vincular navio via POST `/api/embarques/{id}/navio-vinculo`
3. Checar BD: `SELECT controleNavioId FROM Embarques WHERE id = ...` → deve ter valor
4. GET `/api/logistica/controle-navios` → navio deve aparecer com embarques na resposta
5. Atualizar ETA do trajeto
6. Verificar field `EtaEsperada` em embarque → deve ter novo valor

---

## 📊 Estado Atual vs Esperado

| Função | Estado | Falta |
|--------|--------|-------|
| Cadastrar navio | ✅ PRONTO | — |
| Criar trajeto | ✅ PRONTO | — |
| Vincular embarque a navio | ✅ ACESSO | Sincronizar `controleNavioId` |
| Atualizar ETA de trajeto | ✅ ACESSO | Sincronizar ETA em embarques |
| Ver navio em Logística | ✅ API OK | Mapear embarques em frontend |
| Ver Porto Atual | ✅ API OK | Mostrar em componente |
| Ver embarques por perna | ✅ API OK | Mapear em frontend |

---

## 📝 Documentação Criada

1. **`docs/ANALISE_CONFORMIDADE_PHASE5.md`**  
   Análise técnica detalhada com code snippets

2. **`docs/ROADMAP_ACAO_PHASE5.md`**  
   Instruções passo-a-passo para cada ação

3. **`docs/REVISAO_PHASE5_SUMMARY.md`** (este arquivo)  
   Resumo executivo visual

---

## ➡️ Próximo Passo

**Recomendação**: Aplicar as 3 ações (A1, A2, A3) **nesta ordem**:
1. **A2 primeiro** (controleNavioId) — garante compatibilidade com UI existente
2. **A1 depois** (SyncEtaEmbarques) — valida lógica de sincronização
3. **A3 por último** (Frontend) — testa integração completa

**Tempo estimado**: 45 minutos  
**Risco**: Baixo (mudanças isoladas, sem impacto em outras features)

