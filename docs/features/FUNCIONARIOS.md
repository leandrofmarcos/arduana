# Feature: Cadastro de Funcionários

**Versão:** 1.0  
**Data de Criação:** 27 de Fevereiro de 2026  
**Status:** Ativo  
**Última Atualização:** 27 de Fevereiro de 2026

---

## 📋 Visão Geral

O módulo de **Cadastro de Funcionários** gerencia os dados dos colaboradores internos da empresa na plataforma de custos de importação. Permite criar, visualizar, atualizar e deletar informações de funcionários, além de associá-los como responsáveis em orçamentos.

---

## 🎯 Objetivos de Negócio

- Manter um cadastro centralizado de colaboradores da empresa
- Identificar funcionários responsáveis por orçamentos de importação
- Facilitar a seleção de funcionário no processo de criação de orçamentos
- Rastrear informações de contato e cargo para comunicação interna

---

## 📊 Modelo de Dados

### Entidade: Funcionário

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Identificador único (gerado automaticamente) |
| `nomeCompleto` | String (200 caracteres) | Sim | Nome completo do funcionário |
| `username` | String (50 caracteres) | Sim | Nome de usuário único (letras, números, `.`, `-`, `_`) |
| `email` | String (150 caracteres) | Não | Endereço de e-mail |
| `contatoWhatsApp` | String (50 caracteres) | Não | Número de WhatsApp |
| `contatoWeChat` | String (50 caracteres) | Não | ID do WeChat |
| `setor` | String (100 caracteres) | Não | Setor/departamento do funcionário |
| `cargo` | String (100 caracteres) | Não | Cargo ou função |
| `createdAt` | DateTime | Sim | Data e hora de criação (UTC) |
| `updatedAt` | DateTime | Sim | Data e hora da última atualização (UTC) |
| `deletedAt` | DateTime | Não | Data e hora de exclusão (soft delete) |
| `isDeleted` | Boolean | Sim | Flag de exclusão lógica |

---

## 🔄 Fluxos Principais

### 1. Criar Funcionário
```
[Usuário] → [Formulário Popup] → [API Create] → [Validação] → [Banco de Dados]
```
- Campos obrigatórios: Nome Completo e Username
- Username deve ser único no sistema
- Demais campos são opcionais
- Sistema valida formato e tamanho dos campos

### 2. Listar Funcionários
```
[Usuário] → [Tabela de Listagem] → [API Get All] → [Banco de Dados]
```
- Exibe todos os campos cadastrados
- Busca em tempo real por nome, username, email, setor ou cargo
- Paginação no backend (padrão: 10 por página)

### 3. Atualizar Funcionário
```
[Usuário] → [Edição Modal] → [API Update] → [Validação] → [Banco de Dados]
```
- Permite alterar qualquer campo
- Username único validado (permite manter o mesmo)
- Email único validado apenas se fornecido (permite manter o mesmo)
- Registra timestamp de atualização

### 4. Deletar Funcionário
```
[Usuário] → [Confirmar Exclusão] → [API Delete] → [Soft Delete] → [Banco de Dados]
```
- Implementa soft delete (dados não são removidos)
- Confirmação obrigatória via dialog
- Funcionário permanece em registros históricos

---

## 🌐 API REST

### Base URL
```
http://localhost:5000/api/funcionarios
```

### Endpoints

#### **POST** `/api/funcionarios`
**Criar novo funcionário**

**Request:**
```json
{
  "nomeCompleto": "João da Silva",
  "username": "joao.silva",
  "email": "joao@empresa.com",
  "contatoWhatsApp": "+55 11 90000-0000",
  "contatoWeChat": "joaosilva123",
  "setor": "Logística",
  "cargo": "Analista"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Funcionário criado com sucesso",
  "data": {
    "id": "uuid-funcionario",
    "nomeCompleto": "João da Silva",
    "username": "joao.silva",
    "email": "joao@empresa.com",
    "contatoWhatsApp": "+55 11 90000-0000",
    "contatoWeChat": "joaosilva123",
    "setor": "Logística",
    "cargo": "Analista",
    "createdAt": "2026-02-27T10:30:00Z",
    "updatedAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 201
}
```

**Erros Possíveis:**
- `400`: Validação falhou (campos obrigatórios ausentes ou username duplicado)
- `500`: Erro interno do servidor

---

#### **GET** `/api/funcionarios`
**Listar funcionários com paginação**

**Query Parameters:**
- `pageNumber` (int, padrão: 1)
- `pageSize` (int, padrão: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Funcionários listados com sucesso",
  "data": {
    "items": [
      {
        "id": "uuid-funcionario",
        "nomeCompleto": "João da Silva",
        "username": "joao.silva",
        "email": "joao@empresa.com",
        "setor": "Logística",
        "cargo": "Analista",
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

---

#### **GET** `/api/funcionarios/{id}`
**Obter funcionário por ID**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Funcionário encontrado",
  "data": {
    "id": "uuid-funcionario",
    "nomeCompleto": "João da Silva",
    "username": "joao.silva",
    "email": "joao@empresa.com",
    "contatoWhatsApp": "+55 11 90000-0000",
    "contatoWeChat": "joaosilva123",
    "setor": "Logística",
    "cargo": "Analista",
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `404`: Funcionário não encontrado

---

#### **PUT** `/api/funcionarios/{id}`
**Atualizar funcionário**

**Request:**
```json
{
  "nomeCompleto": "João da Silva Santos",
  "username": "joao.silva",
  "cargo": "Analista Sênior"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Funcionário atualizado com sucesso",
  "data": {
    "id": "uuid-funcionario",
    "nomeCompleto": "João da Silva Santos",
    "username": "joao.silva",
    "cargo": "Analista Sênior",
    "createdAt": "2026-02-27T10:30:00Z",
    "updatedAt": "2026-02-27T11:00:00Z"
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `400`: Validação falhou ou username já em uso
- `404`: Funcionário não encontrado

---

#### **DELETE** `/api/funcionarios/{id}`
**Deletar funcionário (soft delete)**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Funcionário deletado com sucesso",
  "statusCode": 200
}
```

**Erros Possíveis:**
- `404`: Funcionário não encontrado

---

## 💻 Frontend

### Estrutura de Arquivos
```
import-costs/src/app/features/funcionarios/
├── pages/
│   └── funcionarios.component.ts   # Página principal com modal e listagem
├── services/
│   └── funcionarios.service.ts     # Serviço de acesso a dados
└── (estilos inline no componente)

import-costs/src/app/data/
├── localstorage/
│   └── funcionario.repository.local.ts  # Repositório local (dev/offline)
└── http/
    └── funcionario.repository.http.ts   # Repositório HTTP (produção)

import-costs/src/app/domain/
└── funcionario.models.ts           # Interface de domínio
```

### Componentes Principais

#### FuncionariosComponent
- **Responsabilidade:** Listagem de funcionários e modal CRUD
- **Campos obrigatórios:** Nome Completo e Username
- **Campos opcionais:** Email, WhatsApp, WeChat, Setor, Cargo
- **Busca:** Filtro em tempo real por nome, username, email, setor ou cargo
- **Ações:** Criar, editar, excluir (com confirmação)

### Serviço: FuncionariosService
```typescript
// Métodos disponíveis
list$(): Observable<Funcionario[]>
create(data: Omit<Funcionario, 'id'>): string
update(id: string, data: Partial<Omit<Funcionario, 'id'>>): void
remove(id: string): void
```

### Validações Frontend
- ✅ Nome Completo: Obrigatório
- ✅ Username: Obrigatório
- ✅ Email: Opcional
- ✅ WhatsApp: Opcional
- ✅ WeChat: Opcional
- ✅ Setor: Opcional
- ✅ Cargo: Opcional

---

## 🔧 Backend

### Estrutura de Arquivos
```
import-costs-api/
├── Domain/Entities/
│   └── Funcionario.cs                    # Entidade principal
├── Features/Funcionarios/
│   ├── FuncionarioRepository.cs          # Acesso a dados
│   ├── FuncionarioResponseDto.cs         # DTO resposta
│   ├── CreateFuncionario/
│   │   ├── CreateFuncionarioDto.cs
│   │   ├── CreateFuncionarioValidator.cs
│   │   ├── CreateFuncionarioHandler.cs
│   │   └── CreateFuncionarioController.cs
│   ├── GetFuncionarios/
│   │   ├── GetFuncionariosHandler.cs
│   │   └── GetFuncionariosController.cs
│   ├── GetFuncionario/
│   │   ├── GetFuncionarioHandler.cs
│   │   └── GetFuncionarioController.cs
│   ├── UpdateFuncionario/
│   │   ├── UpdateFuncionarioDto.cs
│   │   ├── UpdateFuncionarioValidator.cs
│   │   ├── UpdateFuncionarioHandler.cs
│   │   └── UpdateFuncionarioController.cs
│   └── DeleteFuncionario/
│       ├── DeleteFuncionarioHandler.cs
│       └── DeleteFuncionarioController.cs
```

### Validações Backend
- ✅ NomeCompleto: 1–200 caracteres, obrigatório
- ✅ Username: 3–50 caracteres, obrigatório, único, formato `[a-zA-Z0-9._-]`
- ✅ Email: Formato válido, máx. 150 caracteres — **opcional**
- ✅ ContatoWhatsApp: Máx. 50 caracteres — opcional
- ✅ ContatoWeChat: Máx. 50 caracteres — opcional
- ✅ Setor: Máx. 100 caracteres — **opcional**
- ✅ Cargo: Máx. 100 caracteres — **opcional**
- ✅ Soft delete: Respeita flag `isDeleted`
- ✅ Unicidade de username verificada em create e update
- ✅ Unicidade de email verificada apenas quando fornecido

### Padrões Implementados
- **Repository Pattern:** Acesso centralizado ao banco
- **DTO Pattern:** Separação entre entidade e API
- **Fluent Validation:** Validações declarativas com `.When()`
- **Handler Pattern:** Lógica de negócio isolada
- **Soft Delete:** Exclusão lógica com rastreamento

---

## 📈 Status Atual

### ✅ Implementado
- [x] Criar funcionário (com validações)
- [x] Listar funcionários (paginado)
- [x] Obter funcionário por ID
- [x] Atualizar funcionário
- [x] Deletar funcionário (soft delete)
- [x] Validação de unicidade de username
- [x] Validação de unicidade de email (quando fornecido)
- [x] Interface em tabela com busca
- [x] Modal de cadastro/edição
- [x] Somente Nome Completo e Username obrigatórios

### ⚙️ Em Desenvolvimento
- [ ] Autenticação/Autorização vinculada ao username

### 📅 Próximas Melhorias
- [ ] Perfis de acesso por funcionário
- [ ] Foto de perfil
- [ ] Histórico de orçamentos por funcionário
- [ ] Exportação para CSV/Excel
- [ ] Integração com sistema de autenticação

---

## 🔗 Relacionamentos

```
Funcionario
└── Orcamento (1:N opcional)
    └── Funcionário responsável pelo orçamento
```

---

## 📝 Notas Importantes

1. **Unicidade de Username:** Username deve ser único no sistema. Tentativa de duplicata retorna erro `400` com mensagem explicativa.

2. **Email Único:** Quando fornecido, o email também é validado para unicidade. Funcionários sem email não ativam essa verificação.

3. **Soft Delete:** Funcionários deletados não são removidos do banco, apenas marcados com `isDeleted = true`.

4. **Campos Opcionais:** Email, WhatsApp, WeChat, Setor e Cargo são todos opcionais tanto no frontend quanto no backend.

5. **Uso em Orçamentos:** Funcionários são selecionáveis no modal de criação de orçamento. A referência é feita por `funcionarioId` (UUID) e o nome completo é armazenado para exibição.

6. **Busca Frontend:** Realizada em tempo real (client-side) filtrando por nome, username, email, setor ou cargo.

---

## 🚀 Como Usar

### Criar Funcionário
1. Clique em "+ Novo Funcionário"
2. Preencha **Nome Completo** e **Username** (obrigatórios)
3. (Opcional) Preencha Email, WhatsApp, WeChat, Setor e Cargo
4. Clique "Salvar"

### Editar Funcionário
1. Clique no ícone ✏️ na linha do funcionário
2. Altere os dados desejados
3. Clique "Atualizar"

### Deletar Funcionário
1. Clique no ícone 🗑️ na linha do funcionário
2. Confirme a exclusão no dialog
3. Funcionário é marcado como deletado (soft delete)

### Buscar Funcionário
1. Digite na caixa de busca (nome, username, email, setor ou cargo)
2. Resultados filtram em tempo real

### Associar a Orçamento
1. No modal de criação de orçamento, acesse a seção **👤 Funcionário (opcional)**
2. Digite o nome ou username para buscar
3. Selecione o funcionário — username e cargo são exibidos automaticamente
4. O `funcionarioId` é associado ao orçamento

---

## 📞 Suporte e Contato

Para dúvidas sobre a feature de Funcionários, consulte:
- **Frontend:** `import-costs/src/app/features/funcionarios/`
- **Backend:** `import-costs-api/Features/Funcionarios/`
- **Documentação API:** `http://localhost:5000/swagger`
- **Storage Local:** Browser DevTools → Application → LocalStorage

---

**Mantido por:** Equipe de Desenvolvimento  
**Próxima Revisão:** 31 de Março de 2026
