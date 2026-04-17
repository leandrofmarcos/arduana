# Revisão de Escopo — Associação Navio + Acompanhamento Trajetória

**Data**: 17 de abril de 2026  
**Status**: EM TESTE  
**Escopo Definido**: Associar navio ao embarque + acompanhar trajetória

---

## 1. Checklist de Atendimento ao Escopo Original

### ✅ **Escopo Coberto**

#### **API-01: Navios (Cadastro)**
- ✅ GET/POST/PUT/DELETE `/api/navios`
- ✅ PATCH `/api/navios/{id}/ativo`
- ✅ Bloqueio de exclusão se houver vínculo ativo
- **Status**: Implementado e funcionando

#### **API-02: NavioTrajeto (Pernas)**
- ✅ GET/POST/PUT/DELETE `/api/navios/{id}/trajetos`
- ✅ PATCH `/api/navios/{id}/trajetos/{id}/status`
- ⚠️ SyncEtaEmbarquesAsync() — **VAZIO** (placeholder apenas)
  - **Gap**: Ao atualizar ETA, embarques NÃO sincronizam
  - **Prioridade**: CRÍTICA para A1
- **Status**: Estrutura OK, sincronização pendentedef

#### **API-03: EmbarqueNavioVinculo**
- ✅ GET/POST/PATCH/DELETE `/api/embarques/{id}/navio-vinculo`
- ⚠️ `embarque.controleNavioId` NÃO sincronizado
  - **Gap**: Ao criar vínculo, campo legado fica nulo
  - **Prioridade**: CRÍTICA para A2, afeta UI legada
- **Status**: Endpoints OK, sincronização legada pendente

#### **API-04: Logística Operacional**
- ✅ GET `/api/logistica/controle-navios`
- ✅ Filtra APENAS navios com embarques ativos
- ✅ Retorna `NavioTrajetoOperacionalDto` com embarques por perna
- **Status**: Implementado e correto

---

#### **FE-01: Cadastro Navios**
- ✅ Listagem, criação, edição, ativação/inativação
- ✅ Padrão dos outros cadastros
- **Status**: Implementado

#### **FE-02: Embarque Aduana — Associar Navio**
- ✅ Select de navio (GET `/api/navios` — ativos)
- ✅ Ao selecionar navio, carregar pernas (GET `/api/navios/{id}/trajetos`)
- ✅ Opção de vincular a perna específica
- ✅ Criar/atualizar EmbarqueNavioVinculo ao salvar
- ✅ Nova seção "🚢 Vínculo Navio / Perna" na tela
- **Status**: Implementado (novo componente `EmbarqueNavioVinculoFormComponent`)

#### **FE-03: Controle de Navios — Acompanhar Trajetória**
- ✅ Consumir GET `/api/logistica/controle-navios`
- ✅ Mostrar APENAS navios com embarques ativos
- ✅ Expandir trajetos + ver embarques por perna
- ⚠️ Permitir atualizar ETA/status diretamente — **NÃO IMPLEMENTADO**
  - **Gap**: UI é read-only para trajetos; edição desabilitada
  - **Motivo**: Escopo foi "operacional view", não "gerenciar trajetos"
  - **Prioridade**: BAIXA — não estava no escopo inicial
- ✅ Porto atual calculado (Atracado ou EmTransito)
- ✅ Click em embarque navega para detalhe
- **Status**: Acompanhamento visual OK, gerenciamento de trajetos parcial

---

### ⚠️ **Gaps Críticos Identificados**

| Gap | Localização | Impacto | Prioridade | Task |
|-----|-------------|--------|-----------|------|
| `SyncEtaEmbarquesAsync()` vazio | `NaviosService.cs:401` | ETA trajeto NÃO atualiza embarques | 🔴 Crítica | A1 |
| `controleNavioId` não sincronizado | `NaviosService.CreateVinculoAsync()` | UI legada de embarque-aduana quebra | 🔴 Crítica | A2 |
| Interfaces TS desatualizadas | `controle-navio.service.ts` | Embarques não visíveis no frontend | 🟢 **RESOLVIDO** | A3 ✅ |

---

### ❌ **Fora do Escopo (não implementado)**

1. **Editar ETA/status de trajeto diretamente em Controle de Navios**
   - Escopo era "acompanhar", não "gerenciar"
   - Se necessário: criar modal/formulário à parte

2. **Indicador visual de "Atrasos"**
   - Comparar ETA prevista vs. atual
   - Não estava no escopo original

3. **Webhooks ou notificações em tempo real**
   - Escopo não mencionava isso
   - Futura extensão

---

## 2. Status dos Testes

**Pronto para testar:**

1. **Criar navio** (Cadastros → Navios)
   - ✅ UI funcionando
   - ⚠️ Verificar se integra com seed data

2. **Vincular embarque a navio** (Embarque → Seção "Vínculo Navio/Perna")
   - ✅ UI funcionando
   - ⚠️ Verificar se POST `/api/embarques/{id}/navio-vinculo` retorna dados corretos
   - ⚠️ Verificar se `controleNavioId` é sincronizado (A2 gap)

3. **Visualizar em Controle de Navios** (Logística → Controle de Navios)
   - ✅ UI mostra APENAS navios com embarques ativos
   - ✅ Trajetos expandem com embarques listados
   - ⚠️ Verificar se embarques aparecem na tabela corretamente
   - ⚠️ Verificar se click navega para embarque

4. **Acompanhar trajetória**
   - ✅ Ver pernas do navio e status
   - ✅ Ver porto atual calculado
   - ⚠️ Verificar se ETA sincroniza quando já houver vínculo ativo (depende de A1)

---

## 3. Próximos Passos Após Testes

### A1 — Implementar SyncEtaEmbarquesAsync (BLOCKER para trajetória real)
**Localidade**: `NaviosService.cs:401`  
**O quê**: Quando ETA de um trajeto é atualizado, sincronizar nos embarques vinculados  
**Esforço**: ~30 min (simple query + update)

### A2 — Sincronizar controleNavioId (BLOCKER para UI legada)
**Localidade**: `NaviosService.CreateVinculoAsync()` + `DeleteVinculoAsync()`  
**O quê**: Ao criar/desvincular, atualizar `embarque.controleNavioId`  
**Esforço**: ~10 min (2 linhas por método)

### A3 ✅ — RESOLVIDO
TypeScript interfaces agora refletem `embarques` em `NavioTrajetoOperacionalDto`

---

## 4. Builds

### Frontend ✅
- `npm run build` → **SUCCESS** (exit code 0)
- Tamanho do chunk `embarque-aduana-component`: 94.94 → 106.62 kB (+11.68 kB)
- Causa: adição de `EmbarqueNavioVinculoFormComponent`

### Backend  
- `dotnet build --no-restore` → **SUCCESS** (0 errors, 0 warnings)
- Nenhuma migration necessária para FE-02 (API-03 já estava pronto)

---

## 5. Resumo Executivo

| Escopo | Status | Pronto? | Notas |
|--------|--------|--------|----|
| **Associar navio ao embarque** | ✅ 100% | SIM | FE-02 + APIs funcionando |
| **Acompanhar trajetória** | ⚠️ 70% | PARCIAL | Leitura OK, sincronização pendente |
| **Builds** | ✅ | SIM | Ambos passando |
| **Testes** | ⏳ | READY | Aguardando aprovação |

---

**Próxima ação**: Executar testes (criar navio, vincular embarque, visualizar em Controle de Navios) e reportar falhas para orientar A1/A2.
