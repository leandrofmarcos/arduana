# Plano de Migração - Fase 4: Serviços de Operações e Documentos

**Branch:** `feat/phase4-operacoes-api`  
**Data Início:** 16 de abril de 2026  
**Status:** 🟡 Em Planejamento

---

## 1. Visão Geral

A Fase 4 envolve a migração de 8 serviços complexos envolvendo operações, documentos e controle logístico. Diferentemente da Fase 3 (cadastros simples), estes serviços apresentam:

- Múltiplas entidades relacionadas (1:N e M:N)
- Cascata de deleções complexas
- Geração de códigos internos (`generateCode()`)
- Sub-recursos em endpoints (`/solicitacoes-orcamento/{id}/despachantes`)
- Entidades com SEED data (StatusEmbarque, TipoDocumento)

**Prioridade de Execução:**
1. **StatusEmbarqueService** + **TipoDocumentoService** (entrada de dados)
2. **SolicitacaoOrcamentoService** (complexo, dependência para OrcamentoVenda)
3. **OrcamentoVendaService** (depende de SolicitacaoOrcamento)
4. **CustoDespachanteService** (wizard complexo com 4 níveis)
5. **EmbarqueAduanaService** (depende de StatusEmbarque)
6. **ControleNavioService** (independente)
7. **DocumentoService** (depende de TipoDocumento)

---

## 2. Serviços por Migração

### 2.1 StatusEmbarqueService
**Complexidade:** ⭐ Baixa
**Status:** 📋 Não iniciado

**Características:**
- 7 status hardcoded (Previsto, Aguardando, Atracado, etc.)
- SEED data em `initSeed()`
- Nenhuma criação de novos status em runtime
- Métodos: `getAll()`, `getById()`, `getPrevisto()`

**Decisão:** Converter para hardcoded em memória (como CargoService)
- Não existirá API `/status-embarque` de escrita
- Dados carregam automaticamente na inicialização
- Somente leitura

**Mudanças Necessárias:**
1. Remover `readV2`/`addV2` calls
2. Criar array hardcoded com 7 itens
3. Remover `initSeed()` method
4. Preservar `getAll()`, `getById()`, `getPrevisto()`

---

### 2.2 TipoDocumentoService
**Complexidade:** ⭐ Baixa/Média
**Status:** 📋 Não iniciado

**Características:**
- 9 tipos documentos hardcoded (BL, Invoice, DI, LI, etc.)
- SEED data em `initSeed()`
- Suporta CRUD (create, update, remove) em runtime
- Métodos: `getAll()`, `getAtivos()`, `getById()`, `create()`, `update()`, `remove()`

**Decisão:** Híbrida - API Backend + Memory Cache
- API Endpoint: `GET /tipo-documento` (retorna 9 tipos default)
- Suporta `POST /tipo-documento` (criar novos tipos)
- `PUT /tipo-documento/{id}` (atualizar)
- `DELETE /tipo-documento/{id}` (remover)
- Cache em memória com padrão Fase 3

**Mudanças Necessárias:**
1. Remover SEED constant
2. Implementar `ApiClientService.getList<TipoDocumentoDto>()`
3. Criar método `refresh()` como Fase 3
4. Implementar cache pattern
5. Converter métodos para observables onde necessário

---

### 2.3 SolicitacaoOrcamentoService
**Complexidade:** ⭐⭐⭐ Alta
**Status:** 📋 Não iniciado

**Estrutura de Dados:**
```
SolicitacaoOrcamento (1)
  ├─ SolicitacaoOrcamentoDespachante (N)
  └─ SolicitacaoOrcamentoDocumento (N)
```

**Características:**
- Geração de código interno (`generateCode('SOL', ...)`)
- Cascata de deleções (remove despachantes e documentos ao deletar solicitação)
- 3 sub-recursos (solicitacoes, despachantes, documentos)
- Métodos para cada entidade

**API Endpoints Esperados:**
```
GET    /solicitacoes-orcamento                           → getAll()
GET    /solicitacoes-orcamento/{id}                      → getById()
POST   /solicitacoes-orcamento                           → create()
PUT    /solicitacoes-orcamento/{id}                      → update()
DELETE /solicitacoes-orcamento/{id}                      → remove() + cascata

GET    /solicitacoes-orcamento/{id}/despachantes        → getDespachantes()
POST   /solicitacoes-orcamento/{id}/despachantes        → addDespachante()
PUT    /solicitacoes-orcamento/{id}/despachantes/{id}   → updateDespachante()
DELETE /solicitacoes-orcamento/{id}/despachantes/{id}   → removeDespachante()

GET    /solicitacoes-orcamento/{id}/documentos          → getDocumentos()
POST   /solicitacoes-orcamento/{id}/documentos          → addDocumento()
DELETE /solicitacoes-orcamento/{id}/documentos/{id}     → removeDocumento()
```

**Cache Strategy:**
- `items: SolicitacaoOrcamento[]` (main list)
- `despachantes: SolicitacaoOrcamentoDespachante[]` (cached)
- `documentos: SolicitacaoOrcamentoDocumento[]` (cached)
- Refresh all 3 on create/update/delete/cascata

---

### 2.4 OrcamentoVendaService
**Complexidade:** ⭐⭐⭐⭐ Muito Alta
**Status:** 📋 Não iniciado

**Estrutura de Dados:**
```
OrcamentoVenda (1)
  ├─ OrcamentoVendaDespesa (N)
  ├─ OrcamentoVendaDespesaExtra (N)
  └─ OrcamentoVendaCusto (N)
```

**Características:**
- Geração de código interno (`generateCode('OV', ...)`)
- 4 entidades relacionadas
- Cascata de deleções
- 12+ métodos (getAll, getById, getBySolicitacao, create, update, remove, for each sub-entity)
- Métodos `replace*()` para sincronizar listas completas (replaceDespesas, replaceExtras, replaceOrcCustos)

**API Endpoints:** Similar estrutura aninhada como SolicitacaoOrcamento

**Cache Strategy:** 
- Main list + 3 sub-lists cached
- `refreshAll()` sincroniza todas as 4 entidades

---

### 2.5 CustoDespachanteService
**Complexidade:** ⭐⭐⭐⭐⭐ Muito Alta
**Status:** 📋 Não iniciado

**Estrutura de Dados:**
```
CustoDespachante (1)
  ├─ CustoDespachanteLi (N)               [Licença de Importação]
  ├─ CustoDespachanteDespesa (N)
  └─ NcmVinculadoOrcamento (N)
      └─ ValorImposto (N)                 [para cada NCM]
```

**Características:**
- 4 níveis de profundidade
- Cascata de deleções complexa (remove NCMs → remove ValoresImposto)
- Métodos `replace*()` para sincronização
- Geração de código interno

**API Endpoints:**
```
/custos-despachante
/custos-despachante/{id}/lis
/custos-despachante/{id}/despesas
/custos-despachante/{id}/ncms-vinculados
/custos-despachante/{id}/ncms-vinculados/{id}/valores-imposto
```

**Observação:** Este é um wizard com múltiplas etapas. Verificar se há correspondência 1-1 com endpoints do backend.

---

### 2.6 EmbarqueAduanaService
**Complexidade:** ⭐⭐⭐ Alta
**Status:** 📋 Não iniciado

**Estrutura de Dados:**
```
EmbarqueAduana (1)
  ├─ HistoricoStatusEmbarque (N)
  ├─ FreeTimeEmbarque (N)
  └─ PagamentoProcesso (N)
```

**Características:**
- Método especial `alterarStatus()` que atualiza EmbarqueAduana + cria HistoricoStatusEmbarque
- Cascata de deleções
- Geração de código interno (`generateCode('EMB', ...)`)
- Histórico ordenado por data (descending)

**API Endpoints:**
```
GET    /embarques-aduana
GET    /embarques-aduana/{id}
POST   /embarques-aduana
PUT    /embarques-aduana/{id}
DELETE /embarques-aduana/{id}
PATCH  /embarques-aduana/{id}/status    → alterarStatus()

GET    /embarques-aduana/{id}/historico
GET    /embarques-aduana/{id}/free-times
GET    /embarques-aduana/{id}/pagamentos
```

---

### 2.7 ControleNavioService
**Complexidade:** ⭐⭐ Média
**Status:** 📋 Não iniciado

**Estrutura de Dados:**
```
ControleNavio (1)
  └─ ControleNavioTrajeto (N)
```

**Características:**
- 2 entidades simples
- Método `replaceTrajetos()` para sincronização
- Campo `ativo` (pode usar soft-delete)
- Método `getAtivos()` para filtro

**API Endpoints:**
```
GET    /controle-navios
GET    /controle-navios/{id}/ativos
POST   /controle-navios
PUT    /controle-navios/{id}
DELETE /controle-navios/{id}

GET    /controle-navios/{id}/trajetos
POST   /controle-navios/{id}/trajetos
DELETE /controle-navios/{id}/trajetos/{id}
PATCH  /controle-navios/{id}/trajetos  → replaceTrajetos()
```

---

### 2.8 DocumentoService
**Complexidade:** ⭐⭐⭐⭐ Muito Alta
**Status:** 📋 Não iniciado

**Estrutura de Dados:**
```
Documento (1)
  └─ DocumentoVinculo (N)
```
Requer **TipoDocumento** como entrada.

**Características:**
- Método `uploadEVincular()` converte File → base64 → armazena
- Método `getDocumentosByEntidade()` retorna documentos enriched com TipoDocumento
- Lida com múltiplos tipos MIME
- Armazena base64 inside Documento.caminhoArquivo

**Decisão de Implementação:**
- Base64 armazenado no banco? Ou apenas referência + upload para blob storage?
- Dependência: Verificar API backend para suporte a upload
- Pode exigir multipart/form-data POST em vez de JSON

**Storage Challenge:**
- localStorage tem limite ~5-10MB
- Base64 inflate ~33% em relação ao arquivo original
- Para Fase 4: considerar armazenar apenas referência + upload direto para Azure Blob

**API Endpoints:**
```
POST   /documentos/upload-vincular      → uploadEVincular()
POST   /documentos/{id}/vincular        → vincular()
DELETE /documentos/{id}/vincular/{id}   → desvincular()
DELETE /documentos/{id}                 → removeDocumento()

GET    /documentos/entidade/{entidade}/{id}  → getDocumentosByEntidade()
```

---

## 3. Padrão de Migração (Template)

### Template Base para Serviço Simples (StatusEmbarque)
```typescript
@Injectable({ providedIn: 'root' })
export class StatusEmbarqueService {
  private readonly items: StatusEmbarque[] = [
    { id: '1', nome: 'Previsto', codigo: 'PREV', ordem: 1, ativo: true },
    { id: '2', nome: 'Aguardando', codigo: 'AGRD', ordem: 2, ativo: true },
    // ... 7 total
  ];

  getAll(): StatusEmbarque[] {
    return this.items.sort((a, b) => a.ordem - b.ordem);
  }

  getById(id: string): StatusEmbarque | undefined {
    return this.items.find(s => s.id === id);
  }

  getPrevisto(): StatusEmbarque | undefined {
    return this.items.find(s => s.codigo === 'PREV');
  }
}
```

### Template Base para Serviço com API (TipoDocumento)
```typescript
@Injectable({ providedIn: 'root' })
export class TipoDocumentoService {
  private items: TipoDocumento[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  getAll(): TipoDocumento[] {
    this.ensureLoaded();
    return this.items.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  getAtivos(): TipoDocumento[] {
    return this.getAll().filter(t => t.ativo);
  }

  create(data: Omit<TipoDocumento, 'id'>): void {
    this.apiClient.post<any>('/tipo-documento', data).subscribe({
      next: () => this.refresh()
    });
  }

  private refresh(): void {
    this.apiClient.getList<any>('/tipo-documento', { page: 1, pageSize: 100 }).subscribe({
      next: result => {
        this.items = result.items.map(item => ({
          id: item.id,
          nome: item.nome,
          codigo: item.codigo,
          categoria: item.categoria,
          ativo: item.ativo
        }));
        this.loaded = true;
      }
    });
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }
}
```

---

## 4. Cronograma de Execução

| Sprint | Serviço | Complexidade | Estimado | Status |
|--------|---------|-------------|----------|--------|
| 1      | StatusEmbarqueService | ⭐ | 30min | 📋 |
| 1      | TipoDocumentoService | ⭐⭐ | 1h | 📋 |
| 1      | ControleNavioService | ⭐⭐ | 1.5h | 📋 |
| 2      | SolicitacaoOrcamentoService | ⭐⭐⭐ | 3h | 📋 |
| 2-3    | OrcamentoVendaService | ⭐⭐⭐⭐ | 4h | 📋 |
| 3      | EmbarqueAduanaService | ⭐⭐⭐ | 3h | 📋 |
| 4      | CustoDespachanteService | ⭐⭐⭐⭐⭐ | 5h | 📋 |
| 4      | DocumentoService | ⭐⭐⭐⭐ | 3h | 📋 |
| **Total** | | | **~20.5h** | |

---

## 5. Critérios de Conclusão

- ✅ Todos os 8 serviços migrados de `readV2/writeV2` para ApiClientService
- ✅ Cache pattern consistente com Fase 3
- ✅ localStorage removido (apenas memória volátil)
- ✅ Cascata de deleções mantidas
- ✅ Geração de códigos internos funcional (aguardando verificação com API)
- ✅ Build sem erros TypeScript
- ✅ Documentação atualizada
- ✅ Git commit final

---

## 6. Bloqueadores Identificados

1. **API Backend Endpoints Não Confirmados**
   - SolicitacaoOrcamentoService requer endpoints aninhados (`/solicitacoes-orcamento/{id}/despachantes`)
   - CustoDespachanteService com 5 níveis de profundidade
   - Verificar se backend entrega todos os endpoints

2. **Geração de Códigos Internos**
   - Frontend faz `generateCode('SOL', length)` para gerar sequência
   - Precisa sincronizar com API (qual entidade é responsável?)

3. **DocumentoService + Base64**
   - Armazenar base64 em localStorage é insustentável (limite ~5-10MB)
   - Necessário verificar se API suporta upload multipart ou requer frontend apenas ref

4. **Cascata de Deleções**
   - Verificar se API trata cascata automaticamente
   - Ou frontend precisa fazer múltiplas DELETE calls em sequência?

---

## 7. Próximos Passos

1. ✅ Criar branch `feat/phase4-operacoes-api`
2. 📋 **Validar endpoints do backend** antes de iniciar migrações
3. 📋 Implementar StatusEmbarqueService (teste)
4. 📋 Implementar TipoDocumentoService (validar pattern com API)
5. 📋 Iterar outros serviços seguindo ordem de prioridade
6. 📋 Build + testes
7. 📋 Commit + PR

---

**Documentação Atualizada:** 16 de abril de 2026
