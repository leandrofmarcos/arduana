# Feature: Cadastro de Clientes

**Versão:** 1.0  
**Data de Criação:** 27 de Fevereiro de 2026  
**Status:** Ativo  
**Última Atualização:** 27 de Fevereiro de 2026

---

## 📋 Visão Geral

O módulo de **Cadastro de Clientes** gerencia os dados dos clientes que utilizam a plataforma de custos de importação. Permite criar, visualizar, atualizar e deletar informações de clientes, além de associá-los a templates de packlist.

---

## 🎯 Objetivos de Negócio

- Manter um banco de dados centralizado de clientes
- Facilitar a associação de templates de packlist aos clientes
- Agilizar o processo de seleção de cliente nos orçamentos
- Rastrear informações de contato para comunicação

---

## 📊 Modelo de Dados

### Entidade: Cliente

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Identificador único do cliente (gerado automaticamente) |
| `nome` | String (200 caracteres) | Sim | Nome da empresa ou razão social |
| `contato` | String (150 caracteres) | Sim | Telefone ou email para contato |
| `templatePacklistId` | UUID | Não | ID do template de packlist associado ao cliente |
| `createdAt` | DateTime | Sim | Data e hora de criação (UTC) |
| `updatedAt` | DateTime | Sim | Data e hora da última atualização (UTC) |
| `deletedAt` | DateTime | Não | Data e hora de exclusão (soft delete) |
| `isDeleted` | Boolean | Sim | Flag de exclusão lógica |

---

## 🔄 Fluxos Principais

### 1. Criar Cliente
```
[Usuário] → [Formulário Frontend] → [API Create] → [Validação] → [Banco de Dados]
```
- Usuário preenche Nome e Contato
- Sistema valida campos obrigatórios
- Cliente é salvo no banco com timestamp
- Resposta com ID do novo cliente

### 2. Listar Clientes
```
[Usuário] → [Tabela de Listagem] → [API Get All] → [Banco de Dados]
```
- Exibe paginação (padrão: 10 itens por página)
- Permite busca por nome
- Mostra template associado (se houver)

### 3. Atualizar Cliente
```
[Usuário] → [Edição Modal] → [API Update] → [Validação] → [Banco de Dados]
```
- Permite alterar Nome, Contato e Template
- Valida dados antes de atualizar
- Registra timestamp de atualização

### 4. Deletar Cliente
```
[Usuário] → [Ação Delete] → [API Delete] → [Soft Delete] → [Banco de Dados]
```
- Implementa soft delete (não remove dados)
- Registra data de exclusão
- Cliente permanece em registros históricos

---

## 🌐 API REST

### Base URL
```
http://localhost:5000/api/clientes
```

### Endpoints

#### **POST** `/api/clientes`
**Criar novo cliente**

**Request:**
```json
{
  "nome": "Empresa XYZ Ltda",
  "contato": "(11) 90000-0000",
  "templatePacklistId": "uuid-opcional"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "data": {
    "id": "12345-abcde",
    "nome": "Empresa XYZ Ltda",
    "contato": "(11) 90000-0000",
    "templatePacklistId": "uuid-opcional",
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 201
}
```

**Erros Possíveis:**
- `400`: Validação falhou (Campo obrigatório ausente ou inválido)
- `500`: Erro interno do servidor

---

#### **GET** `/api/clientes`
**Listar clientes com paginação**

**Query Parameters:**
- `pageNumber` (int, padrão: 1)
- `pageSize` (int, padrão: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Clientes listados com sucesso",
  "data": {
    "items": [
      {
        "id": "12345-abcde",
        "nome": "Empresa XYZ Ltda",
        "contato": "(11) 90000-0000",
        "templatePacklistId": "uuid",
        "createdAt": "2026-02-27T10:30:00Z"
      }
    ],
    "totalCount": 25,
    "pageNumber": 1,
    "pageSize": 10
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `500`: Erro ao acessar banco de dados

---

#### **GET** `/api/clientes/{id}`
**Obter cliente por ID**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cliente encontrado",
  "data": {
    "id": "12345-abcde",
    "nome": "Empresa XYZ Ltda",
    "contato": "(11) 90000-0000",
    "templatePacklistId": "uuid",
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `404`: Cliente não encontrado
- `500`: Erro interno

---

#### **PUT** `/api/clientes/{id}`
**Atualizar cliente**

**Request:**
```json
{
  "nome": "Novo Nome",
  "contato": "(11) 99999-9999",
  "templatePacklistId": "novo-uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cliente atualizado com sucesso",
  "data": {
    "id": "12345-abcde",
    "nome": "Novo Nome",
    "contato": "(11) 99999-9999",
    "templatePacklistId": "novo-uuid",
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `400`: Validação falhou
- `404`: Cliente não encontrado
- `500`: Erro interno

---

#### **DELETE** `/api/clientes/{id}`
**Deletar cliente (soft delete)**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cliente deletado com sucesso",
  "statusCode": 200
}
```

**Erros Possíveis:**
- `404`: Cliente não encontrado
- `500`: Erro interno

---

## 💻 Frontend

### Estrutura de Arquivos
```
import-costs/src/app/features/clientes/
├── pages/
│   └── clientes.component.ts       # Página principal com modal
├── components/
│   ├── cliente-detail.component.ts      # Componente de edição/criação
│   ├── cliente-detail.component.html    # Template detalhes
│   ├── clientes-list.component.ts       # Componente de listagem
│   └── clientes-list.component.html     # Template listagem
├── services/
│   └── clientes.service.ts         # Serviço HTTP
├── models/
│   └── cliente.models.ts           # Interfaces TypeScript
└── styles/ (inline)
```

### Componentes Principais

#### ClientesComponent
- **Responsabilidade:** Modal de CRUD (Create/Read/Update/Delete)
- **Estado:** Nome, Contato, ID (edição), Modo edição
- **Ações:** Criar, editar, listar, deletar

#### ClienteDetailComponent
- **Responsabilidade:** Formulário com campos e validações
- **Props:** `cliente` (para edição), `templates` (carregados)
- **Events:** `saved`, `cancelled`

#### ClientesListComponent
- **Responsabilidade:** Exibição de tabela com clientes
- **Features:** Busca por nome, paginação, ações (editar/deletar)

### Serviço: ClientesService
```typescript
// Métodos disponíveis
list$(): Observable<Cliente[]>
getById(id: string): Cliente | undefined
create(nome: string, contato: string, templateId?: string): string
update(id: string, data: Partial<Cliente>): void
remove(id: string): void
```

### Validações Frontend
- ✅ Nome: Obrigatório
- ✅ Contato: Obrigatório
- ✅ Template: Opcional

---

## 🔧 Backend

### Estrutura de Arquivos
```
import-costs-api/
├── Domain/Entities/
│   └── Cliente.cs                   # Entidade principal
├── Features/Clientes/
│   ├── ClienteRepository.cs         # Acesso a dados
│   ├── ClienteResponseDto.cs        # DTO resposta
│   ├── CreateCliente/
│   │   ├── CreateClienteDto.cs
│   │   ├── CreateClienteValidator.cs
│   │   ├── CreateClienteHandler.cs
│   │   └── CreateClienteController.cs
│   ├── GetClientes/
│   │   ├── GetClientesHandler.cs
│   │   └── GetClientesController.cs
│   ├── GetCliente/
│   │   ├── GetClienteHandler.cs
│   │   └── GetClienteController.cs
│   ├── UpdateCliente/
│   │   ├── UpdateClienteDto.cs
│   │   ├── UpdateClienteValidator.cs
│   │   ├── UpdateClienteHandler.cs
│   │   └── UpdateClienteController.cs
│   └── DeleteCliente/
│       ├── DeleteClienteHandler.cs
│       └── DeleteClienteController.cs
```

### Validações Backend
- ✅ Nome: 1-200 caracteres, obrigatório
- ✅ Contato: 1-150 caracteres, obrigatório
- ✅ TemplateId: Máximo 36 caracteres (UUID)
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
- [x] Criar cliente (com validações)
- [x] Listar clientes (paginado)
- [x] Obter cliente por ID
- [x] Atualizar cliente
- [x] Deletar cliente (soft delete)
- [x] Associar template de packlist
- [x] Interface em tabela com busca
- [x] Modal de cadastro/edição
- [x] Remover campo documento

### ⚙️ Em Desenvolvimento
- [ ] Relatórios de uso por cliente

### 📅 Próximas Melhorias
- [ ] Autenticação/Autorização (apenas admin)
- [ ] Histórico de alterações completo
- [ ] Exportação para CSV/Excel
- [ ] Tags/Categorias para clientes
- [ ] Validação de email
- [ ] Integração com sistema de billing

---

## 🔗 Relacionamentos

```
Cliente
├── TemplatePacklist (1:1 opcional)
│   └── Padroniza importação de packlists
└── Orcamento (1:N)
    └── Histórico de orçamentos do cliente
```

---

## 📝 Notas Importantes

1. **Documento Removido:** Campo de documento foi removido (27/02/2026). API agora usa apenas nome e contato para identificação.

2. **Soft Delete:** Clientes deletados não são removidos do banco, apenas marcados como deletado.

3. **Template Associado:** Opcional, mas recomendado para agilizar importação de packlists.

4. **Busca:** Busca por nome no frontend é feita em tempo real (client-side).

5. **Paginação:** Backend usa paginação no endpoint GET `/api/clientes`.

---

## 🚀 Como Usar

### Criar Cliente
1. Clique em "Novo Cliente"
2. Preencha Nome e Contato
3. (Opcional) Selecione um Template
4. Clique "Criar"

### Editar Cliente
1. Clique no ícone ✏️ na linha do cliente
2. Altere os dados desejados
3. Clique "Salvar"

### Deletar Cliente
1. Clique no ícone 🗑️ na linha do cliente
2. Confirme a exclusão
3. Cliente é marcado como deletado

### Buscar Cliente
1. Digite o nome na caixa de busca
2. Resultados filtram em tempo real

---

## 📞 Suporte e Contato

Para dúvidas sobre a feature de Clientes, consulte:
- **Frontend:** `import-costs/src/app/features/clientes/`
- **Backend:** `import-costs-api/Features/Clientes/`
- **Documentação API:** `http://localhost:5000/swagger`

---

**Mantido por:** Equipe de Desenvolvimento  
**Próxima Revisão:** 31 de Março de 2026
