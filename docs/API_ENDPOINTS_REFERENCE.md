# API Endpoints Reference - Import Costs API

**Versão:** 2.0.0  
**Status:** ✅ Funcional  
**Base URL:** http://localhost:8080/api

---

## 📋 Índice de Endpoints (67 Total)

### Cadastros Base (25 endpoints)

#### Clientes (5)
```
GET    /clientes                    → Lista paginada
GET    /clientes/{id}               → Detalhes
POST   /clientes                    → Criar
PUT    /clientes/{id}               → Atualizar
DELETE /clientes/{id}               → Deletar
```

#### Despachantes (5)
```
GET    /despachantes                → Lista paginada
GET    /despachantes/{id}           → Detalhes
POST   /despachantes                → Criar
PUT    /despachantes/{id}           → Atualizar
DELETE /despachantes/{id}           → Deletar
```

#### Portos (5)
```
GET    /portos                      → Lista paginada
GET    /portos/{id}                 → Detalhes
POST   /portos                      → Criar
PUT    /portos/{id}                 → Atualizar
DELETE /portos/{id}                 → Deletar
```

#### AliquotasPerfis (6)
```
GET    /aliquotas                   → Lista paginada
GET    /aliquotas/{id}              → Detalhes
GET    /aliquotas/padrao             → Perfil padrão
POST   /aliquotas                   → Criar
PUT    /aliquotas/{id}              → Atualizar
DELETE /aliquotas/{id}              → Deletar
```

#### TemplatesPacklist (5)
```
GET    /templates-packlist          → Lista paginada
GET    /templates-packlist/{id}     → Detalhes
POST   /templates-packlist          → Criar
PUT    /templates-packlist/{id}     → Atualizar
DELETE /templates-packlist/{id}     → Deletar
```

---

### Entidade Orquestradora (7 endpoints)

#### Orcamentos
```
GET    /orcamentos                  → Lista paginada (com Resumo)
GET    /orcamentos/{id}             → Detalhes com Resumo
GET    /orcamentos/{id}/resumo      → Apenas agregação
POST   /orcamentos                  → Criar novo
PUT    /orcamentos/{id}             → Atualizar
POST   /orcamentos/{id}/transicao-fase → Avançar fase
DELETE /orcamentos/{id}             → Deletar (se não Oficializado)
```

---

### Fases Operacionais (20 endpoints)

#### Packlists (5)
```
GET    /packlists                   → Lista por Orcamento
GET    /packlists/{id}              → Detalhes
POST   /packlists                   → Criar
PUT    /packlists/{id}              → Atualizar
DELETE /packlists/{id}              → Deletar
```

#### Custos (5)
```
GET    /custos                      → Lista por Orcamento
GET    /custos/{id}                 → Detalhes
POST   /custos                      → Criar
PUT    /custos/{id}                 → Atualizar
DELETE /custos/{id}                 → Deletar
```

#### Vendas (5)
```
GET    /vendas                      → Lista por Orcamento
GET    /vendas/{id}                 → Detalhes
POST   /vendas                      → Criar
PUT    /vendas/{id}                 → Atualizar
DELETE /vendas/{id}                 → Deletar
```

#### Aduanas (8)
```
GET    /aduanas                     → Lista por Orcamento
GET    /aduanas/{id}                → Detalhes
GET    /aduanas/{id}/eventos        → Timeline de eventos
POST   /aduanas                     → Criar
POST   /aduanas/{id}/eventos        → Adicionar evento
PUT    /aduanas/{id}                → Atualizar
PUT    /aduanas/{id}/finalizar      → Finalizar fase
DELETE /aduanas/{id}                → Deletar
```

---

### Financeiro (5 endpoints)

#### Numerarios
```
GET    /numerarios                  → Lista paginada
GET    /numerarios/{id}             → Detalhes
GET    /numerarios?orcamentoId=X    → Por Orcamento
POST   /numerarios                  → Criar lançamento
PUT    /numerarios/{id}             → Atualizar
```

---

## 🔄 Fluxos de Transição de Fase

### Transição de Fase Obrigatória

```
POST /orcamentos/{id}/transicao-fase
Content-Type: application/json

{
  "novaFase": "Packlist"  // enum value 1
}
```

**Validações:**
- ✅ (int)novaFase == (int)faseAtual + 1
- ✅ StatusFase da fase anterior == Concluida
- ✅ Para Aduana: DespachanteId obrigatório
- ✅ Impossível pular fases

---

## 📊 Estrutura de Resposta

### Sucesso (200 OK)
```json
{
  "id": "123",
  "nome": "Exemplo",
  "status": "Ativo"
}
```

### Erro de Validação (400 Bad Request)
```json
{
  "errors": [
    {
      "field": "documento",
      "message": "Documento é obrigatório"
    }
  ]
}
```

### Recurso Não Encontrado (404)
```json
{
  "message": "Cliente com ID 123 não encontrado"
}
```

### Erro de Negócio (400/422)
```json
{
  "message": "Não pode pular de Packlist para Venda (falta Custo)"
}
```

---

## 📝 Exemplos de Uso

### 1. Criar Novo Orçamento
```bash
POST /api/orcamentos
{
  "numero": "ORC-2026-001",
  "titulo": "Importação de Eletrônicos",
  "clienteId": "cli-123",
  "templatePacklistId": "templ-456"
}
```

### 2. Transicionar para Packlist
```bash
POST /api/orcamentos/orc-001/transicao-fase
{
  "novaFase": "Packlist"
}
```

### 3. Criar Custo
```bash
POST /api/custos
{
  "orcamentoId": "orc-001",
  "premissas": { "frete": 1500, "seguro": 300 },
  "taxas": { "ii": 5, "ipi": 3, "icms": 18 }
}
```

### 4. Obter Resumo
```bash
GET /api/orcamentos/orc-001/resumo
```

Response:
```json
{
  "packlist": {
    "totalItens": 150,
    "pesoTotal": 2500,
    "volumeTotal": 50
  },
  "custo": {
    "custoTotal": 25000,
    "ii": 1000,
    "ipi": 750,
    "icms": 4500,
    "pis": 600,
    "cofins": 1200
  },
  "venda": {
    "precoTotal": 35000,
    "margemLucro": 10000,
    "percentualLucro": 40
  },
  "aduana": {
    "numeroDI": "DI-2026-123456",
    "totalEventos": 5
  },
  "numerarios": {
    "totalReceita": 35000,
    "totalDespesa": 27650,
    "saldo": 7350
  }
}
```

---

## 🔐 Validações por Entidade

### Cliente
- Documento único
- TemplatePacklistId deve existir
- Imutável após criação de Orcamento

### Despachante
- Documento único
- Obrigatório para Aduana

### Orcamento
- ClienteId obrigatório
- DespachanteId obrigatório em Aduana
- Transições sequenciais enforced
- Não pode deletar se Oficializado

### Packlist
- OrcamentoId deve existir
- Status: Pendente → EmAndamento → Concluida

### Custo
- Cálculos automáticos de impostos
- Premissas e Taxas em JSON

### Venda
- Herda premissas de Custo
- Calcula margem de lucro

### Aduana
- Despachante obrigatório
- Timeline de eventos

### Numerario
- Valor > 0
- Moeda: BRL, USD, EUR
- Status progressivo: Solicitado → Enviado → Pago → Recebido

---

## 🧪 Testes Recomendados

### Test 1: Fluxo Completo
1. Criar Cliente
2. Criar Orcamento com ClienteId
3. Transicionar: Orcamento → Packlist
4. Criar Packlist
5. Transicionar: Packlist → Custo
6. Criar Custo
7. Transicionar: Custo → Venda
8. Criar Venda
9. Transicionar: Venda → Aduana (deve falhar sem Despachante)
10. Atualizar Orcamento com DespachanteId
11. Transicionar: Venda → Aduana (deve suceder)
12. Criar Aduana com eventos
13. Obter /resumo (deve agregar tudo)

### Test 2: Validações Bloqueadas
- Tentar: Orcamento → Custo (direto) → Deve falhar
- Tentar: Packlist sem Orcamento → Deve falhar
- Tentar: Aduana sem Despachante → Deve falhar

### Test 3: Dados Calculados
- Criar Custo com taxas → Validar cálculos de impostos
- Criar Venda → Validar cálculo de margem
- Criar Numerarios → Validar agregação em Resumo

---

**Última Atualização:** Janeiro 31, 2026  
**Compatibilidade:** API v2.0.0  
**Status:** ✅ Todos os 67 endpoints funcionando
