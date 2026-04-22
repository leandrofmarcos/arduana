# Roadmap de Ações — Phase 5: Fechar Gaps

**Objetivo**: Implementar os 3 gaps críticos identificados e validar que a regra de negócio funciona end-to-end.

---

## 🔴 Ação 1: Implementar `SyncEtaEmbarquesAsync()`

### Localização
`comex133_api/Features/Navios/NaviosService.cs` (linha 401-407)

### Problema
Quando um trajeto tem sua ETA atualizada, os embarques vinculados não sincronizam.

**Código atual (vazio)**:
```csharp
private async Task SyncEtaEmbarquesAsync(int trajetoId, DateTime novaEta)
{
    // Futura extensão: atualizar campo de ETA esperado nos embarques vinculados
    // Atualmente apenas registra — implementar conforme o campo for adicionado ao SolicitacaoOrcamento
    await Task.CompletedTask;
}
```

### O que fazer
1. **Checar se `SolicitacaoOrcamento` tem campo `EtaEsperada`** (ou similar)
   - Se sim: usar para sincronizar
   - Se não: criar campo `EtaEsperada` (nullable DateTime) na entity `SolicitacaoOrcamento`

2. **Implementar sincronização**:
```csharp
private async Task SyncEtaEmbarquesAsync(int trajetoId, DateTime novaEta)
{
    // Buscar todos os embarques vinculados a este trajeto
    var linksVinculados = await _db.EmbarqueNavioVinculos
        .Where(v => v.NavioTrajetoId == trajetoId && v.Ativo)
        .Include(v => v.EmbarqueAduana)
        .ToListAsync();
    
    // Atualizar ETA esperada em cada embarque
    foreach (var link in linksVinculados)
    {
        if (link.EmbarqueAduana != null)
        {
            link.EmbarqueAduana.EtaEsperada = novaEta;
        }
    }
    
    if (linksVinculados.Any())
    {
        await _db.SaveChangesAsync();
    }
}
```

3. **Validar**: 
   - [ ] Verificar em quais linhas `SyncEtaEmbarquesAsync()` é chamada (linha 163, UpdateTrajetoAsync)
   - [ ] Testar: Criar trajeto com embarque vinculado → Atualizar ETA → Embarque tem nova ETA

---

## 🔴 Ação 2: Sincronizar `controleNavioId` no vínculo

### Localização
`comex133_api/Features/Navios/NaviosService.cs` (linha 218-253 CreateVinculoAsync)

### Problema
Quando um embarque é vinculado a um navio, o campo legado `controleNavioId` não é atualizado. Isso quebra a UI existente de embarque-aduana que depende desse campo.

### O que fazer
1. **Em `CreateVinculoAsync()`, após criar vínculo**: 
```csharp
public async Task<EmbarqueNavioVinculoDto> CreateVinculoAsync(int embarqueId, CreateEmbarqueNavioVinculoRequest request)
{
    // ... validações e criação do vínculo (linhas 223-252)
    
    var vinculo = new EmbarqueNavioVinculo
    {
        EmbarqueAduanaId = embarqueId,
        NavioId = request.NavioId,
        NavioTrajetoId = request.NavioTrajetoId,
        NumeroViagem = request.NumeroViagem?.Trim(),
        Ativo = true,
        VinculadoEm = DateTime.UtcNow,
        Observacao = request.Observacao?.Trim()
    };
    _db.EmbarqueNavioVinculos.Add(vinculo);
    
    // ← ADICIONAR AQUI: Sincronizar campo legado
    var embarque = await _db.SolicitacoesOrcamento.FindAsync(embarqueId);
    if (embarque != null)
    {
        embarque.controleNavioId = request.NavioId;
    }
    
    await _db.SaveChangesAsync();
    // ... resto do método
}
```

2. **Em `UpdateVinculoAsync()`, se NavioId é alterado**:
```csharp
public async Task<EmbarqueNavioVinculoDto> UpdateVinculoAsync(int embarqueId, UpdateEmbarqueNavioVinculoRequest request)
{
    var vinculo = await _db.EmbarqueNavioVinculos
        .Include(v => v.Navio)
        .FirstOrDefaultAsync(v => v.EmbarqueAduanaId == embarqueId && v.Ativo)
        ?? throw new NotFoundException(...);
    
    // ... atualizações do vínculo (linhas 263-271)
    vinculo.NavioTrajetoId = request.NavioTrajetoId;
    vinculo.NumeroViagem = request.NumeroViagem?.Trim();
    vinculo.Observacao = request.Observacao?.Trim();
    
    await _db.SaveChangesAsync();
    // ← Campo legado já está sincronizado porque NavioId não muda no update
    
    return ToVinculoDto(vinculo);
}
```

3. **Em `DeleteVinculoAsync()` (soft delete)**:
```csharp
public async Task DeleteVinculoAsync(int embarqueId)
{
    var vinculo = await _db.EmbarqueNavioVinculos
        .FirstOrDefaultAsync(v => v.EmbarqueAduanaId == embarqueId && v.Ativo)
        ?? throw new NotFoundException(...);
    
    vinculo.Ativo = false;
    vinculo.DesvinculadoEm = DateTime.UtcNow;
    
    // ← ADICIONAR AQUI: Desvinacular do campo legado
    var embarque = await _db.SolicitacoesOrcamento.FindAsync(embarqueId);
    if (embarque != null)
    {
        embarque.controleNavioId = null;
    }
    
    await _db.SaveChangesAsync();
}
```

4. **Validar**:
   - [ ] Verificar se `SolicitacaoOrcamento` tem campo `controleNavioId` (tipo `int?`)
   - [ ] Rodar migration se necessário: `dotnet ef migrations add SyncControleNavioId`
   - [ ] Testar: Criar vínculo → Verificar que embarque.controleNavioId atualiza

---

## 🔴 Ação 3: Atualizar interfaces TypeScript (Frontend)

### Localização
`import-costs/src/app/v2/features/logistica/controle-navios/services/controle-navio.service.ts`

### Problema
Frontend espera um DTO simples (`NavioTrajetoApiDto`) mas backend retorna DTO operacional (`NavioTrajetoOperacionalDto`) com embarques aninhados. As interfaces não casam.

### O que fazer

**1. Atualizar interfaces de DTOs** (linhas 9-36):
```typescript
// ANTES (incompleto):
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
}

// DEPOIS (completo):
interface EmbarqueResumoApiDto {
  embarqueId: number;
  codigoInterno: string;
  status: string;
  numeroViagem?: string;
}

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
  embarques: EmbarqueResumoApiDto[];
}

interface LogisticaControleNavioApiDto {
  navioId: number;
  nomeNavio: string;
  codigoImo?: string;
  armador?: string;
  embarquesAtivos: number;
  portoAtualNome?: string;
  trajetos: NavioTrajetoOperacionalApiDto[];
}
```

**2. Atualizar interfaces de models** (linhas 61-67 e adicionar):
```typescript
// Antes:
interface UpsertNavioTrajetoRequest {
  numeroViagem: string;
  sequencia: number;
  portoOrigemId: number;
  portoDestinoId: number;
  etd: string;
  eta: string;
  statusPerna: 'Previsto' | 'EmTransito' | 'Atracado' | 'Concluido';
  observacao?: string;
}

// Adicionar também ControleNavio com porto atual:
interface ControleNavioComPorto extends ControleNavio {
  portoAtualNome?: string;
  embarquesAtivos: number;
}
```

**3. Atualizar `mapTrajetoDto()` para incluir embarques** (linha 227-236):
```typescript
// ANTES:
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
  };
}

// DEPOIS:
private mapTrajetoDto(dto: NavioTrajetoOperacionalApiDto): ControleNavioTrajeto {
  return {
    id: dto.id.toString(),
    controleNavioId: '', // Será preenchido pelo map de Navio
    portoOrigemId: dto.portoOrigemId.toString(),
    portoOrigemNome: dto.portoOrigemNome,
    portoDestinoId: dto.portoDestinoId.toString(),
    portoDestinoNome: dto.portoDestinoNome,
    etd: this.toDateOnly(dto.etd),
    eta: this.toDateOnly(dto.eta),
    trajetoDescricao: '',
    embarques: dto.embarques?.map(e => ({
      embarqueId: e.embarqueId,
      codigoInterno: e.codigoInterno,
      status: e.status,
      numeroViagem: e.numeroViagem
    })) || []
  };
}
```

**4. Validar**:
   - [ ] Compilar TypeScript: `npm run build` na pasta `import-costs`
   - [ ] Checar tipos em `ControleNavioTrajeto` para incluir array de embarques
   - [ ] Testar que resposta de `/logistica/controle-navios` mapeia corretamente

---

## 🔵 Próximos Passos (Após fechar gaps)

### Passo 1: Testar Backend End-to-End
```bash
# Terminal 1: Iniciar API
cd c:\dev\prototipos-html\comex133_api
dotnet run

# Terminal 2: Testar endpoints com Postman/Insomnia
1. POST /api/navios → Criar navio (ex: "Teste Navio")
2. POST /api/navios/{id}/trajetos → Criar trajeto (perna)
3. POST /api/embarques/{embarqueId}/navio-vinculo → Vincular embarque ao navio
4. GET /api/logistica/controle-navios → Verificar navio com embarques
5. PUT /api/navios/{id}/trajetos/{trajetoId} → Atualizar ETA
   - Verificar se embarque.EtaEsperada foi sincronizada (query direto no DB)
   - Verificar se embarque.controleNavioId foi setado
```

### Passo 2: Construir FE-02 (Embarque vínculo navio)
Adicionar form ao `EmbarqueAduanaComponent` para:
- Selecionar navio (GET `/api/navios` ativos)
- Selecionar perna do navio (GET `/api/navios/{id}/trajetos`)
- Botão "Vincular" (POST `/api/embarques/{id}/navio-vinculo`)
- Exibir vínculo ativo com porta de desvincular

### Passo 3: Construir FE-03 (Logística operacional)
Novamente componente em `/logistica` que:
- Chama GET `/api/logistica/controle-navios`
- Exibe tabela de navios com:
  - Nome navio
  - Porto atual
  - Embarques ativos (count)
  - Expandir → ver trajetos com embarques por perna
- Botão para atualizar status/ETA de perna (PATCH `/api/navios/{id}/trajetos/{id}/status`)

---

## ✅ Critério de Aceite (End-to-End)

```
Fluxo completo:
1. Criar solicitação → gerar/finalizar custos → gerar/finalizar orçamento → gerar embarque
2. Abrir embarque, selecionar navio "MSC Aurora", selecionar perna "Shanghai → Santos"
3. Salvar (criar vínculo)
4. Verificar:
   a) embarque.controleNavioId = ID do navio ✓
   b) Ir para Logística → ver "MSC Aurora" com embarques em perna "Shanghai → Santos" ✓
   c) Editar perna, mudar ETA para "2026-05-15"
   d) Recheckar Embarque → ETA esperada mudou para "2026-05-15" ✓
5. Encerrar embarque
   - MSC Aurora desaparece de Logística se não tiver mais embarques ativos ✓
```

---

