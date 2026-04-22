# Ajustes — Controle de Navios como Visão Operacional

**Data**: 2026-04-17  
**Objetivo**: Transformar "Controle de Navios" e uma visão operacional, não um cadastro

---

## 🔧 Alterações Implementadas

### 1. Frontend — ControleNaviosComponent

**Arquivo**: `import-costs/src/app/v2/features/logistica/controle-navios/pages/controle-navios.component.ts`

#### ✅ Alterações realizadas:

1. **Removido botão "Nova Viagem"**
   - ANTES: `<button class="btn btn-primary" (click)="openForm()">+ Nova Viagem</button>`
   - DEPOIS: Removido completamente
   - Razão: Cadastro de navio é em **Cadastros/Navios**, não em Logística

2. **Filtro agora mostra APENAS navios com embarques**
   - ANTES: `get filtered() { return this.navios; }`
   - DEPOIS: 
     ```typescript
     get filtered(): ControleNavio[] {
       // Filtrar apenas navios que têm embarques pendentes/ativos
       const comEmbarques = this.navios.filter(n => this._temPendentes(n.id));
       if (!this.q) return comEmbarques;
       // ... busca em navios com embarques
     }
     ```
   - Razão: Logística deve mostrar APENAS navios em operação (com embarques)

3. **Botões de ação: remover Editar/Deletar navio**
   - ANTES: `✏️ + ⚓ Atracado + 🗑️`
   - DEPOIS: `✏️ Trajetos + ⚓ Atracado`
   - Razão: Não pode editar/deletar navio aqui (é operacional, não cadastro)

4. **Embarques agora com link para detalhe**
   - ANTES: Apenas exibição estática
   - DEPOIS: `(click)="goToEmbarque(e.id)"` com cursor pointer e sublinhado
   - Razão: Operador deve poder ir direto ao embarque para ver/editar

5. **Formulário: de "Nova Viagem" para "Gerenciar Trajetos"**
   - ANTES: Permitia editar nome do navio, IMO, armador, etc.
   - DEPOIS:
     - Título: "Gerenciar Trajetórias — [Nome Navio]"
     - Navio é **somente leitura** (exibe apenas número viagem e nome)
     - Permite **APENAS** adicionar/remover/editar trajetos (pernas)
   - Razão: Navio já foiregistrado e vinculado a embarques, não deve ser alterado aqui

6. **Renomeado método `openForm()` → `openTrajetos()`**
   - Nova assinatura: `openTrajetos(navio: ControleNavio)`
   - Apenas carrega trajetos do navio, sem permitir editar dados do navio

7. **Novo método `saveTrajetos()`**
   - ANTES: `save()` salvava navio + trajetos
   - DEPOIS: `saveTrajetos()` salva APENAS trajetos
   - Chama: `this.service.replaceTrajetos(navioId, trajetos)`

8. **Novo método `goToEmbarque(embarqueId)`**
   - Navega para `/embarques/{id}` quando usuário clica em embarque
   - Permite que operador vá direto da logística para detalhes do embarque

9. **Removidos campos de propriedades**
   - Removido: `showErrors`, `editing`, `form` (que tinha nomeNavio, ativo, etc.)
   - Adicionado: `editingNavio` (referência ao navio sendo editado, read-only)
   - Resultado: Componente mais simples, focado em trajetos

---

## 📋 Fluxo Atualizado

### Antes (Incorreto)
```
Logística/Controle de Navios
  ├─ Lista TODOS os navios (cadastrados ou não)
  ├─ Permite criar NOVO navio
  ├─ Permite editar dados do navio
  ├─ Permite deletar navio
  └─ Gerencia trajetos
```

### Depois (Correto)
```
Logística/Controle de Navios (VISÃO OPERACIONAL)
  ├─ Lista APENAS navios com embarques ativos vinculados
  ├─ SEM opção de criar navio novo (vai em Cadastros)
  ├─ Navio é somente leitura
  ├─ SEM opção de deletar navio
  ├─ Gerencia trajetos (pernas) do navio
  └─ Clique em embarque → vai para detalhe

Cadastros/Navios (CADASTRO)
  ├─ Cadastro CRUD completo de navios
  ├─ Criar/editar/deletar navios
  ├─ Ativar/inativar navios
  └─ [Não gerencia trajetos nem vê embarques]
```

---

## ✅ Validação

### Build Frontend
```bash
cd c:\dev\prototipos-html\import-costs
npm run build
→ ✅ SUCESSO (0 erros TypeScript)
```

### Comportamento Esperado

1. **Listar**
   - ✅ Abrir `/logistica` → ver APENAS navios com embarques
   - ✅ Se navio sem embarques ou todos encerrados → some da lista
   - ✅ Botão "Nova Viagem" desapareceu

2. **Gerenciar Trajetórias**
   - ✅ Clique em "✏️ Trajetos" de um navio
   - ✅ Formulário mostra nome do navio (read-only)
   - ✅ Permite adicionar/remover/editar trajetos
   - ✅ Salvar (botão "💾 Salvar Trajetos") não altera dados do navio

3. **Ver Embarques**
   - ✅ Expandir seção de embarques de um navio
   - ✅ Clique em embarque → navega para `/embarques/{id}`
   - ✅ Volta à logística (browser back)

4. **Atualizar Status**
   - ✅ Botão "⚓ Atracado" continua disponível
   - ✅ Marca todos os embarques pendentes como Atracado

---

## 🔗 Integração com Backend

### Backend já está correto!
- `GetControleNaviosOperacionalAsync()` já retorna APENAS navios com embarques ativos
- DTOs estão corretos (`NavioOperacionalDto` com count de embarques)

### O Frontend agora:
- ✅ Chama `GET /logistica/controle-navios`
- ✅ Filtra apenas navios com embarques (double-check no frontend)
- ✅ Exibe embarques clicáveis
- ✅ Permite gerenciar trajetos APENAS

---

## 📊 Suma de Mudanças

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Botão Nova Viagem** | ✅ Presente | ❌ Removido |
| **Navios exibidos** | Todos | Apenas com embarques |
| **Editar navio** | Permitido | ❌ Bloqueado |
| **Deletar navio** | Permitido | ❌ Bloqueado |
| **Gerenciar trajetos** | Sim | Sim (único foco) |
| **Embarques clicáveis** | ❌ Não | ✅ Link para detalhe |
| **Formulário** | Navio + Trajetos | Apenas Trajetos |

---

## ➡️ Próximos Passos

1. ✅ **Frontend** — Ajustado
2. ✅ **Backend** — Já estava correto
3. ⏳ **A1**: Implementar `SyncEtaEmbarquesAsync()`
4. ⏳ **A2**: Sincronizar `controleNavioId` em vínculo
5. ⏳ **A3**: Atualizar interfaces TypeScript (embarques)
6. ⏳ **FE-02**: Embarque vínculo navio/perna
7. ⏳ **FE-03**: Confirmar que logística está ok

---

