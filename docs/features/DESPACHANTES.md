# Feature: Cadastro de Despachantes

**Versão:** 1.0  
**Data de Criação:** 27 de Fevereiro de 2026  
**Status:** Ativo  
**Última Atualização:** 27 de Fevereiro de 2026

---

## 📋 Visão Geral

O módulo de **Cadastro de Despachantes** gerencia os dados dos despachantes (agentes de desembaraço aduaneiro) que trabalham com a plataforma de custos de importação. Permite criar, visualizar, atualizar e deletar informações de despachantes que são utilizados nos processos de orçamento e desembaraço.

---

## 🎯 Objetivos de Negócio

- Manter um banco de dados centralizado de despachantes
- Facilitar a seleção de despachante nos orçamentos
- Rastrear informações de contato dos despachantes
- Agilizar o processo de gerenciamento de despachantes
- Relacionar despachantes aos processos de desembaraço

---

## 📊 Modelo de Dados

### Entidade: Despachante

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Identificador único do despachante (gerado automaticamente) |
| `nome` | String (200 caracteres) | Sim | Nome do despachante ou empresa de desembaraço |
| `contato` | String (150 caracteres) | Sim | Telefone ou email para contato |
| `createdAt` | DateTime | Sim | Data e hora de criação (UTC) |
| `updatedAt` | DateTime | Sim | Data e hora da última atualização (UTC) |
| `deletedAt` | DateTime | Não | Data e hora de exclusão (soft delete) |
| `isDeleted` | Boolean | Sim | Flag de exclusão lógica |

---

## 🔄 Fluxos Principais

### 1. Criar Despachante
```
[Usuário] → [Modal Frontend] → [API Create] → [Validação] → [Banco de Dados]
```
- Usuário preenche Nome e Contato
- Sistema valida campos obrigatórios
- Despachante é salvo no banco com timestamp
- Resposta com ID do novo despachante

### 2. Listar Despachantes
```
[Usuário] → [Tabela de Listagem] → [API Get All] → [Banco de Dados]
```
- Exibe paginação (padrão: 10 itens por página)
- Permite busca por nome
- Ordena alfabeticamente

### 3. Atualizar Despachante
```
[Usuário] → [Edição Modal] → [API Update] → [Validação] → [Banco de Dados]
```
- Permite alterar Nome e Contato
- Valida dados antes de atualizar
- Registra timestamp de atualização

### 4. Deletar Despachante
```
[Usuário] → [Ação Delete] → [API Delete] → [Soft Delete] → [Banco de Dados]
```
- Implementa soft delete (não remove dados)
- Registra data de exclusão
- Despachante permanece em registros históricos

---

## 🌐 API REST

### Base URL
```
http://localhost:5000/api/despachantes
```

### Endpoints

#### **POST** `/api/despachantes`
**Criar novo despachante**

**Request:**
```json
{
  "nome": "Desembaraço Brasil Ltda",
  "contato": "(11) 98765-4321"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Despachante criado com sucesso",
  "data": {
    "id": "12345-abcde",
    "nome": "Desembaraço Brasil Ltda",
    "contato": "(11) 98765-4321",
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 201
}
```

**Erros Possíveis:**
- `400`: Validação falhou (Campo obrigatório ausente)
- `500`: Erro interno do servidor

---

#### **GET** `/api/despachantes`
**Listar despachantes com paginação**

**Query Parameters:**
- `pageNumber` (int, padrão: 1)
- `pageSize` (int, padrão: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Despachantes listados com sucesso",
  "data": {
    "items": [
      {
        "id": "12345-abcde",
        "nome": "Desembaraço Brasil Ltda",
        "contato": "(11) 98765-4321",
        "createdAt": "2026-02-27T10:30:00Z"
      }
    ],
    "totalCount": 15,
    "pageNumber": 1,
    "pageSize": 10
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `500`: Erro ao acessar banco de dados

---

#### **GET** `/api/despachantes/{id}`
**Obter despachante por ID**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Despachante encontrado",
  "data": {
    "id": "12345-abcde",
    "nome": "Desembaraço Brasil Ltda",
    "contato": "(11) 98765-4321",
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `404`: Despachante não encontrado
- `500`: Erro interno

---

#### **PUT** `/api/despachantes/{id}`
**Atualizar despachante**

**Request:**
```json
{
  "nome": "Desembaraço Brasil Express",
  "contato": "(11) 99999-9999"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Despachante atualizado com sucesso",
  "data": {
    "id": "12345-abcde",
    "nome": "Desembaraço Brasil Express",
    "contato": "(11) 99999-9999",
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `400`: Validação falhou
- `404`: Despachante não encontrado
- `500`: Erro interno

---

#### **DELETE** `/api/despachantes/{id}`
**Deletar despachante (soft delete)**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Despachante deletado com sucesso",
  "statusCode": 200
}
```

**Erros Possíveis:**
- `404`: Despachante não encontrado
- `500`: Erro interno

---

## 💻 Frontend

### Estrutura de Arquivos
```
import-costs/src/app/features/despachantes/
├── pages/
│   └── despachantes.component.ts       # Página principal com modal
├── models/
│   └── despachante.models.ts           # Interface TypeScript
├── services/
│   └── despachantes.service.ts         # Serviço HTTP
└── styles/ (inline)
```

### Componentes Principais

#### DespachantesComponent
- **Responsabilidade:** Modal de CRUD (Create/Read/Update/Delete)
- **Estado:** Nome, Contato, ID (edição), Modo edição
- **Ações:** Criar, editar, listar, deletar
- **Filtro:** Busca por nome em tempo real

### Serviço: DespachantesService
```typescript
// Métodos disponíveis
list$(): Observable<Despachante[]>
create(nome: string, documento: string, contato: string): string
update(id: string, data: Partial<Pick<Despachante,'nome'|'contato'>>): void
remove(id: string): void
```

### Validações Frontend
- ✅ Nome: Obrigatório
- ✅ Contato: Obrigatório

---

## 🔧 Backend

### Estrutura de Arquivos
```
import-costs-api/
├── Domain/Entities/
│   └── Despachante.cs                   # Entidade principal
├── Features/Despachantes/
│   ├── DespachanteRepository.cs         # Acesso a dados
│   ├── DespachanteResponseDto.cs        # DTO resposta
│   ├── CreateDespachante/
│   │   ├── CreateDespachanteDto.cs
│   │   ├── CreateDespachanteValidator.cs
│   │   ├── CreateDespachanteHandler.cs
│   │   └── CreateDespachanteController.cs
│   ├── GetDespachantes/
│   │   ├── GetDespachantesHandler.cs
│   │   └── GetDespachantesController.cs
│   ├── GetDespachante/
│   │   ├── GetDespachanteHandler.cs
│   │   └── GetDespachanteController.cs
│   ├── UpdateDespachante/
│   │   ├── UpdateDespachanteDto.cs
│   │   ├── UpdateDespachanteValidator.cs
│   │   ├── UpdateDespachanteHandler.cs
│   │   └── UpdateDespachanteController.cs
│   └── DeleteDespachante/
│       ├── DeleteDespachanteHandler.cs
│       └── DeleteDespachanteController.cs
```

### Validações Backend
- ✅ Nome: 1-200 caracteres, obrigatório
- ✅ Contato: 1-150 caracteres, obrigatório
- ✅ Soft delete: Respeita flag `isDeleted`

### Padrões Implementados
- **Repository Pattern:** Acesso centralizado ao banco
- **DTO Pattern:** Separação entre entidade e API
- **Fluent Validation:** Validações declarativas
- **Handler Pattern:** Lógica de negócio isolada
- **Soft Delete:** Exclusão lógica com rastreamento

---

## 📈 Status Atual

### ✅ Implementado
- [x] Criar despachante (com validações)
- [x] Listar despachantes (paginado)
- [x] Obter despachante por ID
- [x] Atualizar despachante
- [x] Deletar despachante (soft delete)
- [x] Interface em tabela com busca
- [x] Modal de cadastro/edição
- [x] Remover campo documento

### ⚙️ Em Desenvolvimento
- [ ] Vincular despachante a orçamentos

### 📅 Próximas Melhorias
- [ ] Autenticação/Autorização (apenas admin)
- [ ] Histórico de alterações completo
- [ ] Exportação para CSV/Excel
- [ ] Ranque de despachantes por uso
- [ ] Avaliação/Rating de despachantes
- [ ] Validação de email

---

## 🔗 Relacionamentos

```
Despachante
└── Orcamento (1:N)
    └── Histórico de orçamentos associados ao despachante
```

---

## 📝 Notas Importantes

1. **Documento Removido:** Campo de documento foi removido (27/02/2026). API agora usa apenas nome e contato para identificação.

2. **Soft Delete:** Despachantes deletados não são removidos do banco, apenas marcados como deletado.

3. **Busca:** Busca por nome no frontend é feita em tempo real (client-side).

4. **Paginação:** Backend usa paginação no endpoint GET `/api/despachantes`.

5. **Ordenação:** Despachantes são ordenados alfabeticamente por nome.

---

## 🚀 Como Usar

### Criar Despachante
1. Clique em "Novo Despachante"
2. Preencha Nome e Contato
3. Clique "Salvar"

### Editar Despachante
1. Clique no ícone ✏️ na linha do despachante
2. Altere os dados desejados
3. Clique "Salvar"

### Deletar Despachante
1. Clique no ícone 🗑️ na linha do despachante
2. Confirme a exclusão
3. Despachante é marcado como deletado

### Buscar Despachante
1. Digite o nome na caixa de busca
2. Resultados filtram em tempo real

---

## 📞 Suporte e Contato

Para dúvidas sobre a feature de Despachantes, consulte:
- **Frontend:** `import-costs/src/app/features/despachantes/`
- **Backend:** `import-costs-api/Features/Despachantes/`
- **Documentação API:** `http://localhost:5000/swagger`

---

**Mantido por:** Equipe de Desenvolvimento  
**Próxima Revisão:** 31 de Março de 2026
