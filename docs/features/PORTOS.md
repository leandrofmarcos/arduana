# Feature: Cadastro de Portos

**Versão:** 1.1  
**Data de Criação:** 27 de Fevereiro de 2026  
**Status:** Ativo  
**Última Atualização:** 27 de Fevereiro de 2026

---

## 📋 Visão Geral

O módulo de **Cadastro de Portos** gerencia os portos utilizados nos processos de importação. Permite criar, visualizar, atualizar e deletar portos, que são referenciados nas operações aduaneiras (porto de origem e porto de destino).

---

## 🎯 Objetivos de Negócio

- Manter uma lista centralizada de portos disponíveis para seleção
- Facilitar o preenchimento de porto de origem e destino nos processos aduaneiros
- Garantir consistência no cadastro de portos utilizados nas importações

---

## 📊 Modelo de Dados

### Entidade: Porto

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Identificador único do porto (gerado automaticamente) |
| `nome` | String (200 caracteres) | Sim | Nome do porto |
| `createdAt` | DateTime | Sim | Data e hora de criação (UTC) |
| `updatedAt` | DateTime | Sim | Data e hora da última atualização (UTC) |
| `deletedAt` | DateTime | Não | Data e hora de exclusão (soft delete) |
| `isDeleted` | Boolean | Sim | Flag de exclusão lógica |

---

## 🔄 Fluxos Principais

### 1. Criar Porto
```
[Usuário] → [Modal Frontend] → [API Create] → [Validação] → [Banco de Dados]
```
- Usuário preenche o Nome do porto
- Sistema valida campo obrigatório
- Porto é salvo no banco com timestamp
- Resposta com ID do novo porto

### 2. Listar Portos
```
[Usuário] → [Tabela de Listagem] → [API Get All] → [Banco de Dados]
```
- Exibe paginação (padrão: 10 itens por página)
- Permite busca por nome em tempo real

### 3. Atualizar Porto
```
[Usuário] → [Edição Modal] → [API Update] → [Validação] → [Banco de Dados]
```
- Permite alterar o Nome
- Valida dado antes de atualizar
- Registra timestamp de atualização

### 4. Deletar Porto
```
[Usuário] → [Ação Delete] → [API Delete] → [Soft Delete] → [Banco de Dados]
```
- Implementa soft delete (não remove dados do banco)
- Registra data de exclusão
- Porto permanece em registros históricos

---

## 🌐 API REST

### Base URL
```
http://localhost:5000/api/portos
```

### Endpoints

#### **POST** `/api/portos`
**Criar novo porto**

**Request:**
```json
{
  "nome": "Porto de Santos"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Porto criado com sucesso",
  "data": {
    "id": "uuid-porto",
    "nome": "Porto de Santos",
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 201
}
```

**Erros Possíveis:**
- `400`: Validação falhou (nome ausente ou excede 200 caracteres)
- `500`: Erro interno do servidor

---

#### **GET** `/api/portos`
**Listar portos com paginação**

**Query Parameters:**
- `pageNumber` (int, padrão: 1)
- `pageSize` (int, padrão: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Portos listados com sucesso",
  "data": {
    "items": [
      {
        "id": "uuid-porto",
        "nome": "Porto de Santos",
        "createdAt": "2026-02-27T10:30:00Z"
      }
    ],
    "totalCount": 10,
    "pageNumber": 1,
    "pageSize": 10
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `500`: Erro ao acessar banco de dados

---

#### **GET** `/api/portos/{id}`
**Obter porto por ID**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Porto encontrado",
  "data": {
    "id": "uuid-porto",
    "nome": "Porto de Santos",
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `404`: Porto não encontrado
- `500`: Erro interno

---

#### **PUT** `/api/portos/{id}`
**Atualizar porto**

**Request:**
```json
{
  "nome": "Porto de Itajaí"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Porto atualizado com sucesso",
  "data": {
    "id": "uuid-porto",
    "nome": "Porto de Itajaí",
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `400`: Validação falhou
- `404`: Porto não encontrado
- `500`: Erro interno

---

#### **DELETE** `/api/portos/{id}`
**Deletar porto (soft delete)**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Porto deletado com sucesso",
  "statusCode": 200
}
```

**Erros Possíveis:**
- `404`: Porto não encontrado
- `500`: Erro interno

---

## 💻 Frontend

### Estrutura de Arquivos
```
import-costs/src/app/features/portos/
├── pages/
│   └── portos.component.ts         # Página principal com modal e listagem
├── services/
│   └── portos.service.ts           # Serviço de acesso a dados
├── models/
│   └── porto.models.ts             # Interface TypeScript
└── (estilos inline no componente)

import-costs/src/app/data/
├── localstorage/
│   └── porto.repository.local.ts   # Repositório local (dev/offline)
└── http/
    └── porto.repository.http.ts    # Repositório HTTP (produção)

import-costs/src/app/domain/
└── porto.models.ts                 # Interface de domínio
```

### Componentes Principais

#### PortosComponent
- **Responsabilidade:** Listagem e CRUD completo de portos em tela única
- **Estado:** `nome`, `id`, `modoEdicao`, `showModalCadastro`, `q` (busca)
- **Modal:** Campo Nome para criação e edição
- **Ações:** Criar, editar, excluir, buscar

### Serviço: PortosService
```typescript
// Métodos disponíveis
list$(): Observable<Porto[]>
create(nome: string): string
update(id: string, data: Partial<Pick<Porto,'nome'>>): void
remove(id: string): void
```

### Validações Frontend
- ✅ Nome: Obrigatório
- ✅ Busca: Filtro por nome em tempo real (client-side)

### Modal de Cadastro
```
┌─────────────────────────────────────┐
│ Novo Porto / Editar Porto        ✕  │
├─────────────────────────────────────┤
│ Nome *                               │
│ [Porto de Santos          ]         │
├─────────────────────────────────────┤
│ [Cancelar]              [Criar]     │
└─────────────────────────────────────┘
```

---

## 🔧 Backend

### Estrutura de Arquivos
```
import-costs-api/
├── Domain/Entities/
│   └── Porto.cs                     # Entidade principal
├── Features/Portos/
│   ├── PortoRepository.cs           # Acesso a dados
│   ├── PortoResponseDto.cs          # DTO resposta
│   ├── CreatePorto/
│   │   ├── CreatePortoDto.cs
│   │   ├── CreatePortoValidator.cs
│   │   ├── CreatePortoHandler.cs
│   │   └── CreatePortoController.cs
│   ├── GetPortos/
│   │   ├── GetPortosHandler.cs
│   │   └── GetPortosController.cs
│   ├── GetPorto/
│   │   ├── GetPortoHandler.cs
│   │   └── GetPortoController.cs
│   ├── UpdatePorto/
│   │   ├── UpdatePortoDto.cs
│   │   ├── UpdatePortoValidator.cs
│   │   ├── UpdatePortoHandler.cs
│   │   └── UpdatePortoController.cs
│   └── DeletePorto/
│       ├── DeletePortoHandler.cs
│       └── DeletePortoController.cs
```

### Validações Backend
- ✅ Nome: 1–200 caracteres, obrigatório
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
- [x] Criar porto (com validação de nome)
- [x] Listar portos (paginado)
- [x] Obter porto por ID
- [x] Atualizar porto
- [x] Deletar porto (soft delete)
- [x] Interface em tabela com busca por nome
- [x] Modal de cadastro/edição
- [x] Remoção de campos Código UN/LOCODE e País (v1.1)

### 📅 Próximas Melhorias
- [ ] Associar porto a processos aduaneiros via dropdown
- [ ] Importação em lote de portos (CSV)
- [ ] Exportação da lista

---

## 🔗 Relacionamentos

```
Porto
└── Aduana (1:N)
    ├── Porto de Origem
    └── Porto de Destino
```

O campo `portoOrigem` e `portoDestino` no módulo de Aduana referenciam portos por nome (texto livre), permitindo uso de portos cadastrados ou valores avulsos.

---

## 📝 Notas Importantes

1. **Campos Removidos (v1.1):** Código UN/LOCODE e País foram removidos em 27/02/2026. O porto é identificado apenas pelo nome.

2. **Soft Delete:** Portos deletados não são removidos do banco, apenas marcados como deletados.

3. **Seed de Dados:** Repositório local inclui 3 portos iniciais: Porto de Santos, Porto de Itapoá e Shanghai Port.

4. **Busca:** Feita em tempo real no frontend, filtrando por nome.

5. **Uso em Aduana:** Os campos Porto de Origem e Porto de Destino na aba Aduana são inputs de texto livre — não são vinculados ao cadastro de portos por FK, mas a lista de portos serve como referência ao usuário.

---

## 🚀 Como Usar

### Criar Porto
1. Clique em "+ Novo Porto"
2. Preencha o Nome do porto
3. Clique "Criar"

### Editar Porto
1. Clique no ícone ✏️ na linha do porto
2. Altere o nome
3. Clique "Salvar"

### Deletar Porto
1. Clique no ícone 🗑️ na linha do porto
2. Porto é removido da listagem (soft delete)

### Buscar Porto
1. Digite o nome na caixa de busca
2. Resultados filtram em tempo real

---

## 📞 Suporte e Contato

Para dúvidas sobre a feature de Portos, consulte:
- **Frontend:** `import-costs/src/app/features/portos/`
- **Backend:** `import-costs-api/Features/Portos/`
- **Documentação API:** `http://localhost:5000/swagger`

---

**Mantido por:** Equipe de Desenvolvimento  
**Próxima Revisão:** 31 de Março de 2026
