# Feature: Cadastro e Gerenciamento de Orçamentos

**Versão:** 1.6  
**Data de Criação:** 27 de Fevereiro de 2026  
**Status:** Ativo  
**Última Atualização:** 05 de Março de 2026

---

## 📋 Visão Geral

O módulo de **Cadastro e Gerenciamento de Orçamentos** é o núcleo da plataforma de custos de importação. Gerencia todo o ciclo de vida de um orçamento, desde a criação até a finalização da aduana, integrando dados de cliente, packlist, custos, vendas e processos aduaneiros.

---

## 🎯 Objetivos de Negócio

- Gerenciar ciclo completo de orçamentos de importação
- Suportar dois tipos de transporte: Marítimo e Aéreo
- Automatizar cálculo de custos a partir de packlist
- Rastrear aprovações e mudanças de status
- Permitir fluxos manual e com packlist (importação guiada)
- Garantir integridade de dados através de relacionamentos

---

## 📊 Modelo de Dados

### Entidade: Orçamento (OrcamentoMeta)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Identificador único do orçamento |
| `title` | String | Não | Título exibição: "Cliente • Código" |
| `faseAtual` | Enum | Sim | Fase atual: `Orcamento` \| `Aduana` |
| `tipoOrcamento` | Enum | Sim | Tipo: `Maritimo` \| `Aereo` |
| `aprovado` | Boolean | Não | Flag de aprovação do orçamento |
| `aprovadoCliente` | Boolean | Não | Flag de aprovação do cliente |
| `oficializado` | Boolean | Não | Flag de formalização |
| `createdAt` | DateTime | Sim | Data/hora de criação (UTC) |
| `clienteId` | UUID | Sim | Referência ao cliente |
| `despachanteId` | UUID | Não | Referência ao despachante (opcional) |
| `portoDestinoId` | UUID | Não | Referência ao porto de destino (opcional) |
| `funcionarioId` | UUID | Não | Referência ao funcionário responsável (opcional) |
| `templatePacklistId` | UUID | Não | Referência ao template (opcional) |
| `dataSaida` | DateTime | Não | Data prevista de saída da mercadoria (opcional) |
| `dataChegada` | DateTime | Não | Data prevista de chegada da mercadoria (opcional) |
| `descricao` | String | Não | Descrição livre do orçamento (opcional) |
| `tipoImportacao` | String | Não | Tipo de importação: `Direta` \| `ContaAOrdem` (opcional) |

### Entidade: Orçamento (OrcamentoListItem)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | ID único |
| `cliente` | String | Não | Nome do cliente para exibição |
| `despachante` | String | Não | Nome do despachante para exibição |
| `portoDestino` | String | Não | Nome do porto de destino para exibição |
| `funcionario` | String | Não | Nome do funcionário responsável para exibição |
| `clienteId` | UUID | Sim | Referência ao cliente |
| `despachanteId` | UUID | Não | Referência ao despachante |
| `portoDestinoId` | UUID | Não | Referência ao porto de destino |
| `funcionarioId` | UUID | Não | Referência ao funcionário responsável |
| `dataSaida` | DateTime | Não | Data prevista de saída (opcional) |
| `dataChegada` | DateTime | Não | Data prevista de chegada (opcional) |
| `descricao` | String | Não | Descrição livre do orçamento (opcional) |
| `tipoImportacao` | String | Não | Tipo de importação: `Direta` \| `ContaAOrdem` (opcional) |
| `tipoOrcamento` | Enum | Sim | Tipo: `Maritimo` \| `Aereo` |
| `codigo` | String | Sim | Código gerado (ORC-DDMMYY-XXXX) |
| `data` | DateTime | Sim | Data do orçamento |
| `status` | Enum | Sim | `CRIADO` \| `Orçamento` \| `Em aprovação` \| `Aprovado` \| `Reprovado` \| `Aduana` |
| `templatePacklistId` | UUID | Não | Template associado |

### Entidades Relacionadas

**Custo:** Despesas associadas ao orçamento  
**Venda:** Preço de venda do orçamento  
**Aduana:** Dados do processo aduaneiro  
**Packlist:** Itens importados do arquivo  

---

## 🔄 Fluxos Principais

### 1. Criar Orçamento
```
[Usuário] → [Modal Novo Orçamento] → [Preenche: Tipo, Cliente, Despachante?, Porto?] 
  → [API Create] → [Orçamento Criado]
```
- Modal exibe as seguintes seções/campos:
  1. **Tipo de Orçamento / Tipo de Importação** - Dois dropdowns lado a lado (Marítimo padrão; Importação: Direta / Conta a Ordem)
  2. **👤 Cliente** - Dropdown com busca em tempo real (obrigatório)
  3. **🧭 Despachante** - Dropdown com busca em tempo real (opcional)
  4. **🛳️ Porto Destino** - Dropdown com busca em tempo real (opcional)
  5. **👤 Funcionário** - Dropdown com busca em tempo real (opcional)
  6. **Saída / Chegada** - Campos de data (opcional)
  7. **Descrição** - Textarea de texto livre (opcional)
- Nome do cliente traz lista de clientes cadastrados; contato auto-preenchido
- Despachante e Porto Destino são opcionais; associados por ID e nome
- Funcionário opcional; ao selecionar, exibe username e cargo em campos readonly
- Datas de saída e chegada são opcionais e independentes
- Descrição permite anotações livres sobre o orçamento
- Sistema gera código automaticamente (ORC-DDMMYY-XXXX)
- Entidades relacionadas (Custo, Venda, Aduana) são garantidas
- Usuário é redirecionado para página de detalhes

### 2. Fluxo Com Packlist
```
[Orçamento Criado] → [Cliente tem Template?] 
  → [SIM] → [Importar Packlist] → [Calcular Custos] → [Sugerir Venda]
  → [NÃO] → [Fluxo Manual - Lançar Custos Manualmente]
```
- Se cliente tem template associado: packlist é importado automaticamente
- Custos são pré-calculados com alíquota padrão
- Venda é sugerida baseada em custos
- Se sem template: usuário lança custos manualmente

### 3. Ciclo de Aprovação
```
[Orçamento] → [Em Preparação] → [Enviado para Aprovação] 
  → [Cliente Aprova/Reprova] → [Orçamento Aprovado/Reprovado]
```
- Orçamento pode ser editado até aprovação final
- Cliente aprova via sistema ou email
- Uma vez aprovado, passa para fase de Aduana

### 4. Fluxo Aduaneiro
```
[Aprovado] → [Aduana] → [Lançar Dados Aduana] 
  → [Gerar Documentação] → [Finalizado]
```
- Após aprovação, orçamento entra em fase Aduana
- Dados aduaneiros são lançados
- Documentação é gerada
- Orçamento finalizado

---

## 🌐 API REST

### Base URL
```
http://localhost:5000/api/orcamentos
```

### Endpoints

#### **POST** `/api/orcamentos`
**Criar novo orçamento**

**Request:**
```json
{
  "clienteId": "uuid-cliente",
  "cliente": "Empresa XYZ Ltda",
  "codigo": "ORC-050326-A1B2",
  "data": "2026-03-05T10:30:00Z",
  "templatePacklistId": "uuid-template (opcional)",
  "tipoOrcamento": "Maritimo",
  "despachanteId": "uuid-despachante (opcional)",
  "portoDestinoId": "uuid-porto (opcional)",
  "funcionarioId": "uuid-funcionario (opcional)",
  "dataSaida": "2026-04-10T00:00:00Z",
  "dataChegada": "2026-05-20T00:00:00Z",
  "descricao": "Importação de equipamentos eletrônicos - Fornecedor ABC",
  "tipoImportacao": "Direta"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Orçamento criado com sucesso",
  "data": {
    "id": "orcamento-uuid",
    "titulo": "Empresa XYZ Ltda • ORC-050326-A1B2",
    "faseAtual": "Orcamento",
    "tipoOrcamento": "Maritimo",
    "clienteId": "uuid-cliente",
    "despachanteId": "uuid-despachante",
    "portoDestinoId": "uuid-porto",
    "funcionarioId": "uuid-funcionario",
    "dataSaida": "2026-04-10T00:00:00Z",
    "dataChegada": "2026-05-20T00:00:00Z",
    "descricao": "Importação de equipamentos eletrônicos - Fornecedor ABC",
    "tipoImportacao": "Direta",
    "moedaPadrao": "BRL",
    "dataCriacao": "2026-03-05T10:30:00Z",
    "dataAtualizacao": "2026-03-05T10:30:00Z"
  },
  "statusCode": 201
}
```

**Erros Possíveis:**
- `400`: Validação falhou (clienteId obrigatório)
- `500`: Erro interno do servidor

---

#### **GET** `/api/orcamentos`
**Listar orçamentos com paginação**

**Query Parameters:**
- `pageNumber` (int, padrão: 1)
- `pageSize` (int, padrão: 10)
- `status` (string, opcional)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orçamentos listados com sucesso",
  "data": {
    "items": [
      {
        "id": "orcamento-uuid",
        "cliente": "Empresa XYZ Ltda",
        "despachante": "Despacho ABC",
        "tipoOrcamento": "Maritimo",
        "codigo": "ORC-270226-A1B2",
        "data": "2026-02-27T10:30:00Z",
        "status": "Orçamento"
      }
    ],
    "totalCount": 42,
    "pageNumber": 1,
    "pageSize": 10
  },
  "statusCode": 200
}
```

---

#### **GET** `/api/orcamentos/{id}`
**Obter orçamento completo por ID**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orçamento encontrado",
  "data": {
    "id": "orcamento-uuid",
    "title": "Empresa XYZ Ltda • ORC-270226-A1B2",
    "faseAtual": "Orcamento",
    "tipoOrcamento": "Maritimo",
    "cliente": "Empresa XYZ Ltda",
    "despachante": "Despacho ABC",
    "approved": false,
    "createdAt": "2026-02-27T10:30:00Z"
  },
  "statusCode": 200
}
```

**Erros Possíveis:**
- `404`: Orçamento não encontrado

---

#### **PUT** `/api/orcamentos/{id}`
**Atualizar orçamento (status, fase, aprovações)**

**Request:**
```json
{
  "aprovado": true,
  "despachanteId": "uuid-despachante",
  "dataSaida": "2026-04-10T00:00:00Z",
  "dataChegada": "2026-05-20T00:00:00Z",
  "descricao": "Descrição atualizada do orçamento",
  "tipoImportacao": "ContaAOrdem"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orçamento atualizado com sucesso",
  "data": {
    "id": "orcamento-uuid",
    "aprovado": true,
    "dataSaida": "2026-04-10T00:00:00Z",
    "dataChegada": "2026-05-20T00:00:00Z",
    "descricao": "Descrição atualizada do orçamento",
    "tipoImportacao": "ContaAOrdem",
    "dataAtualizacao": "2026-03-05T11:00:00Z"
  },
  "statusCode": 200
}
```

---

#### **DELETE** `/api/orcamentos/{id}`
**Deletar orçamento (soft delete)**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orçamento deletado com sucesso",
  "statusCode": 200
}
```

---

## 💻 Frontend

### Estrutura de Arquivos
```
import-costs/src/app/features/orcamento/
├── pages/
│   └── novo-processo.component.ts     # Listagem + Modal criação
├── components/
│   ├── orcamento-detail.component.ts  # Página de detalhes
│   └── orcamento-detail.component.html
├── services/
│   └── orcamento.service.ts           # Serviço HTTP + Storage
├── models/
│   ├── orcamento.models.ts            # Interfaces
│   └── (tipos: Fase, TipoOrcamento)
├── data/
│   └── storage.helper.ts              # Persistência local
└── styles/ (inline)
```

### Componentes Principais

#### NovoProcessoComponent
- **Responsabilidade:** Listagem de orçamentos e modal de criação
- **Dropdown Cliente:** Busca em tempo real, contato auto-preenchido — Obrigatório
- **Dropdown Despachante:** Busca em tempo real, contato auto-preenchido — Opcional
- **Dropdown Porto Destino:** Busca por nome em tempo real — Opcional
- **Dropdown Funcionário:** Busca por nome ou username; exibe username + cargo ao selecionar — Opcional
- **Tipo de Importação:** Dropdown lado a lado com Tipo de Orçamento — Opcional (Direta / Conta a Ordem)
- **Saída / Chegada:** Campos `type="date"` lado a lado — Opcional
- **Descrição:** Textarea de texto livre, `resize: vertical`, 3 linhas — Opcional
- **Tipo padrão:** Marítimo (Aéreo desabilitado)
- **Exclusão Mútua:** Abrir qualquer dropdown fecha os demais automaticamente (4 dropdowns)
- **Modal Redimensionável:** `.modal-lg` tem `resize: both` com limites min/max

#### OrcamentoDetailComponent
- **Responsabilidade:** Visualização e edição de detalhes
- **Tabs:** Informações, Custos, Venda, Aduana, Packlist
- **Fluxo visual:** Mostra fase e status atual

### Serviço: OrcamentoService
```typescript
// Métodos disponíveis
list$(): Observable<OrcamentoListItem[]>
getMeta(id: string): OrcamentoMeta | null
criar(clienteId, cliente?, codigo?, data?, templatePacklistId?,
      packlistTemplate?, aliquotaPadrao?, tipoOrcamento = 'Maritimo',
      despachanteId?, despachante?,
      portoDestinoId?, portoDestino?,
      funcionarioId?, funcionario?,
      dataSaida?, dataChegada?, descricao?,
      tipoImportacao?): string
update(id: string, data: Partial<OrcamentoMeta & OrcamentoListItem>): void
remover(id: string): void
getPacklist(id: string): any[]
getCusto(id: string): Custo | null
getVenda(id: string): Venda | null
getAduana(id: string): Aduana | null
```

### Validações Frontend
- ✅ Tipo de Orçamento: Obrigatório (padrão Marítimo)
- ✅ Nome do Cliente: Obrigatório (seleção via dropdown)
- ✅ Contato do Cliente: Auto-preenchido (requisito indireto)
- ✅ Nome do Despachante: Opcional (seleção via dropdown)
- ✅ Contato do Despachante: Auto-preenchido ao selecionar (opcional)
- ✅ Porto Destino: Opcional (seleção via dropdown, busca por nome)
- ✅ Tipo Aéreo: Desabilitado (futura ativação)
- ✅ Busca de Clientes: Filtro por nome em tempo real
- ✅ Busca de Despachantes: Filtro por nome em tempo real
- ✅ Busca de Portos: Filtro por nome em tempo real
- ✅ Funcionário Responsável: Opcional, dropdown com busca por nome ou username
- ✅ Username e Cargo do Funcionário: Auto-preenchidos em campos readonly
- ✅ Data de Saída: Opcional, campo `type="date"`
- ✅ Data de Chegada: Opcional, campo `type="date"`
- ✅ Descrição: Opcional, textarea texto livre
- ✅ Tipo de Importação: Opcional, `Direta` ou `Conta a Ordem`

### Modal Criação
**Estrutura do Modal:**
```
┌─────────────────────────────────────┐
│ Novo Orçamento              [data] ✕│
├─────────────────────────────────────┤
│ Tipo de Orçamento * | Tipo Import.  │
│ [Dropdown]          | [Dropdown]    │
├─────────────────────────────────────┤
│ 👤 Cliente                          │
│ Nome do Cliente *  | Contato        │
│ [Dropdown Search]  | [Somente Leitura]│
├─────────────────────────────────────┤
│ 🧭 Despachante (opcional)           │
│ Nome Despachante   | Contato        │
│ [Dropdown Search]  | [Somente Leitura]│
├─────────────────────────────────────┤
│ 🛳️ Porto Destino (opcional)         │
│ Nome do Porto                       │
│ [Dropdown Search]                   │
├─────────────────────────────────────┤
│ 👤 Funcionário (opcional)           │
│ Nome Completo      | Username       │
│ [Dropdown Search]  | [Somente Leitura]│
│                    | Cargo          │
│                    | [Somente Leitura]│
├─────────────────────────────────────┤
│ Saída              | Chegada        │
│ [date input]       | [date input]   │
├─────────────────────────────────────┤
│ Descrição                           │
│ [textarea livre]                    │
└─────────────────────────────────────┘
│ [Cancelar]              [Criar]     │
└─────────────────────────────────────┘
```

**Campos:**
- **Tipo de Orçamento:** Select com opções Marítimo/Aéreo - Obrigatório
- **Tipo de Importação:** Select com opções Direta/Conta a Ordem - Opcional
- **Nome do Cliente:** Dropdown com busca em tempo real - Obrigatório
  - Busca por nome entre clientes cadastrados
  - Mostra nome e contato na sugestão
  - Ao clicar, seleciona cliente e preenche contato
- **Contato (Cliente):** Campo readonly preenchido automaticamente - Automático
  - Vazio até cliente ser selecionado
  - Obtém valor de `clienteSelecionado.contato`
- **Nome do Despachante:** Dropdown com busca em tempo real - Opcional
  - Busca por nome entre despachantes cadastrados
  - Mostra nome e contato na sugestão
  - Ao clicar, seleciona despachante e preenche contato
- **Contato (Despachante):** Campo readonly preenchido automaticamente - Automático
  - Vazio até despachante ser selecionado
  - Obtém valor de `despachanteSelecionado.contato`
- **Porto Destino:** Dropdown com busca em tempo real - Opcional
  - Busca por nome entre portos cadastrados
  - Mostra apenas o nome (porto não possui contato)
  - Ao clicar, seleciona porto e armazena `portoDestinoId`
- **Funcionário:** Dropdown com busca em tempo real - Opcional
  - Busca por nome completo ou username
  - Mostra `nomeCompleto` com `username • cargo` na linha inferior
  - Ao clicar, preenche Username e Cargo em campos readonly
  - Armazena `funcionarioId` e `nomeCompleto`
- **Saída:** Campo `type="date"` — Opcional
  - Data prevista de saída da mercadoria
  - Exibido lado a lado com Chegada
- **Chegada:** Campo `type="date"` — Opcional
  - Data prevista de chegada da mercadoria
- **Descrição:** Textarea de texto livre — Opcional
  - Área para anotações e informações adicionais sobre o orçamento
  - `resize: vertical`, 3 linhas iniciais

**Comportamento:**
- Quando cliente é selecionado, `clienteId` fica armazenado
- Quando despachante é selecionado, `despachanteId` fica armazenado
- Quando porto é selecionado, `portoDestinoId` fica armazenado
- Quando funcionário é selecionado, `funcionarioId` fica armazenado; username e cargo exibidos
- Contatos são atualizados automaticamente ao selecionar (cliente e despachante)
- Abrir qualquer dropdown fecha os demais (exclusão mútua entre os 4)
- Botão "Criar" validado apenas se Cliente preenchido (demais opcionais)
- Modal é redimensionável pelo usuário (`resize: both`, min 480×400, max 95vw×92vh)
- `dataSaida` e `dataChegada` armazenados como string ISO no `OrcamentoMeta` e `OrcamentoListItem`
- `descricao` armazenada em `OrcamentoMeta` e `OrcamentoListItem`
- `tipoImportacao` armazenado em `OrcamentoMeta` e `OrcamentoListItem`

---

## 🔧 Backend

### Estrutura de Arquivos
```
import-costs-api/
├── Domain/Entities/
│   ├── Orcamento.cs                 # Entidade meta
│   ├── Custo.cs                     # Despesas
│   ├── Venda.cs                     # Preço venda
│   ├── Aduana.cs                    # Dados aduaneiros
│   └── Packlist.cs                  # Itens importados
├── Features/Orcamentos/
│   ├── OrcamentoRepository.cs       # Acesso dados
│   ├── OrcamentoResponseDto.cs      # DTO resposta
│   ├── CreateOrcamento/
│   │   ├── CreateOrcamentoDto.cs
│   │   ├── CreateOrcamentoValidator.cs
│   │   ├── CreateOrcamentoHandler.cs
│   │   └── CreateOrcamentoController.cs
│   ├── GetOrcamentos/
│   ├── GetOrcamento/
│   ├── UpdateOrcamento/
│   └── DeleteOrcamento/
```

### Validações Backend
- ✅ ClienteId: UUID válido, obrigatório
- ✅ Tipo: `Maritimo` ou `Aereo` (apenas Maritimo ativo)
- ✅ Data: DateTime válido
- ✅ TemplateId: UUID válido (opcional)
- ✅ DataSaida: DateTime opcional
- ✅ DataChegada: DateTime opcional
- ✅ Descricao: String opcional (sem limite no modelo)
- ✅ TipoImportacao: String opcional (`Direta` ou `ContaAOrdem`)
- ✅ Soft delete: Respeita flag `isDeleted`

### Padrões Implementados
- **Repository Pattern:** Acesso centralizado ao banco
- **DTO Pattern:** Separação entidade/API
- **Handler Pattern:** Lógica de negócio isolada
- **Soft Delete:** Exclusão lógica com rastreamento
- **Entidades Garantidas:** Custo, Venda, Aduana criados automaticamente

### Geração de Código
```csharp
// Formato: ORC-DDMMYY-XXXX
// Exemplo: ORC-270226-A1B2
private string GerarCodigoOrcamento()
{
    var hoje = new DateTime();
    var data = hoje.ToString("ddMMyy");
    var aleatorio = RandomAlphanumeric(4);
    return $"ORC-{data}-{aleatorio}";
}
```

---

## 📈 Status Atual

### ✅ Implementado
- [x] Criar orçamento com seleção de cliente
- [x] Tipo de orçamento (Marítimo padrão, Aéreo desabilitado)
- [x] Listar orçamentos com busca
- [x] Obter detalhes do orçamento
- [x] Atualizar status e fase
- [x] Deletar orçamento (soft delete)
- [x] Geração automática de código
- [x] Fluxo manual vs. com packlist
- [x] Entidades relacionadas garantidas
- [x] Cálculo automático de custos (com template)
- [x] Seleção de funcionário responsável (opcional)
- [x] Modal redimensionável pelo usuário
- [x] Campos de data de saída e chegada (frontend + backend)
- [x] Campo de descrição livre (frontend + backend)
- [x] Campo de tipo de importação: Direta / Conta a Ordem (frontend + backend)

### ⚙️ Em Desenvolvimento
- [ ] Reaprovaçoes de orçamento
- [ ] Histórico completo de mudanças

### 📅 Próximas Melhorias
- [ ] Ativar tipo Aéreo com validações específicas
- [ ] Relatórios de margem por tipo
- [ ] Comparação orçamentária
- [ ] Versionamento de orçamentos
- [ ] Notificações de aprovação
- [ ] Integração com sistema de faturamento
- [ ] Histórico de cotações

---

## 🔗 Relacionamentos

```
Orcamento (OrcamentoMeta)
├── Cliente (1:N)
│   └── Cada cliente pode ter múltiplos orçamentos
├── Despachante (1:N opcional)
│   └── Despachante responsável (opcional)
├── Porto (1:N opcional)
│   └── Porto de destino da importação (opcional)
├── Funcionario (1:N opcional)
│   └── Funcionário responsável pelo orçamento (opcional)
├── TemplatePacklist (1:1 opcional)
│   └── Importação guiada de packlist
├── Custo (1:1)
│   └── Despesas do orçamento
├── Venda (1:1)
│   └── Preço de venda
├── Aduana (1:1)
│   └── Dados do processo aduaneiro
└── Packlist (1:N)
    └── Itens importados
```

---

## 📝 Notas Importantes

1. **Tipo Aéreo:** Atualmente desabilitado (futura ativação). Marítimo é o padrão.

2. **Código Automático:** Sistema gera código único no formato ORC-DDMMYY-XXXX quando orçamento é criado.

3. **Dropdown Cliente:** Campo de busca integrado lista todos clientes cadastrados. Busca filtrada por nome em tempo real.

4. **Contato Automático:** Ao selecionar cliente, campo de contato é preenchido automaticamente com informação do cliente selecionado.

5. **Modal Simplificado (v1.1):** Removidas informações de Template e Cliente Info display. Modal agora mostra apenas Tipo + Nome/Contato para criação rápida.

11. **Seleção de Despachante (v1.2):** Despachante pode ser associado ao orçamento diretamente no modal de criação. Campo opcional com dropdown de busca igual ao de clientes. `despachanteId` e `despachante` são gravados no `OrcamentoMeta`.

12. **Porto Destino (v1.3):** Porto de destino pode ser associado ao orçamento diretamente no modal de criação. Campo opcional com dropdown de busca por nome. `portoDestinoId` e `portoDestino` são gravados no `OrcamentoMeta` e `OrcamentoListItem`. Porto não possui campo contato (apenas nome).

13. **Funcionário Responsável (v1.4):** Funcionário pode ser associado ao orçamento no modal de criação. Campo opcional com dropdown que busca por nome ou username. Ao selecionar, exibe username e cargo em campos readonly. `funcionarioId` e `funcionario` (nomeCompleto) são gravados no `OrcamentoMeta` e `OrcamentoListItem`.

14. **Modal Redimensionável (v1.4):** O modal de criação de orçamento pode ser redimensionado pelo usuário arrastando o canto inferior direito. Limites: mínimo 480×400px, máximo 95vw×92vh.

15. **Datas de Saída e Chegada (v1.5):** Campos opcionais para registrar data prevista de saída e chegada da mercadoria. Exibidos lado a lado no modal. Gravados em `OrcamentoMeta`, `OrcamentoListItem` (frontend) e nas entidades/DTOs do backend.

16. **Descrição Livre (v1.5):** Textarea opcional para anotações e informações adicionais sobre o orçamento. Posicionada abaixo das datas no modal. Gravada em `OrcamentoMeta`, `OrcamentoListItem` (frontend) e nas entidades/DTOs do backend.

17. **Tipo de Importação (v1.6):** Dropdown opcional exibido lado a lado com "Tipo de Orçamento" no modal. Valores possíveis: `Direta` ou `ContaAOrdem` (exibido como "Conta a Ordem"). Campo opcional tanto no frontend quanto no backend. Gravado em `OrcamentoMeta`, `OrcamentoListItem`, entidade `Orcamento`, `OrcamentoLancamento`, todos os DTOs e resposta da API.

6. **Entidades Garantidas:** Ao criar orçamento, as entidades Custo, Venda e Aduana são criadas automaticamente vazias.

7. **Fluxo Duplo:**
   - **Com Packlist:** Cliente tem template → Importação automática após criação → Custos pré-calculados
   - **Manual:** Sem template → Usuário lança custos manualmente

8. **Soft Delete:** Orçamentos deletados não são removidos, apenas marcados como deleted.

9. **Storage Local:** Dados persistem em localStorage durante sessão (frontend).

10. **Fases:** Orçamento começa em "Orcamento", pode passar para "Aduana" após aprovação.

---

## 📝 Histórico de Mudanças

### Versão 1.6 (05 de Março de 2026)
**Mudanças Principais:**
- ✅ **Tipo de Importação no Modal:** Dropdown opcional adicionado ao lado de "Tipo de Orçamento" usando `form-grid` (2 colunas)
- ✅ **Valores:** `Direta` e `ContaAOrdem` (exibido como "Conta a Ordem")
- ✅ **`OrcamentoMeta`:** Adicionado campo `tipoImportacao?`
- ✅ **`OrcamentoListItem`:** Adicionado campo `tipoImportacao?`
- ✅ **`criar()` Atualizado:** 18º parâmetro `tipoImportacao?` adicionado ao serviço
- ✅ **Backend — Entidade `Orcamento.cs`:** Propriedade `TipoImportacao?` adicionada
- ✅ **Backend — `OrcamentoLancamento`:** Mesma propriedade no modelo de domínio
- ✅ **Backend — `CreateOrcamentoDto`:** Campo opcional `TipoImportacao?`
- ✅ **Backend — `UpdateOrcamentoDto`:** Campo opcional `TipoImportacao?`
- ✅ **Backend — `OrcamentoResponseDto`:** Campo incluído na resposta
- ✅ **Backend — Handlers:** Create e Update mapeiam e retornam o novo campo
- ✅ **Backend — Repository `UpdateAsync`:** Atualiza `TipoImportacao` quando fornecido

**Compatibilidade:**
- Dados Antigos: Orçamentos sem esse campo continuam funcionando (opcional)
- API: Sem mudanças não-retrocompatíveis
- Banco de Dados: Requer migration para adicionar a coluna `TipoImportacao` na tabela de Orçamentos

---

### Versão 1.5 (05 de Março de 2026)
**Mudanças Principais:**
- ✅ **Datas de Saída e Chegada:** Campos `type="date"` adicionados ao modal, abaixo do bloco de Funcionário
- ✅ **Campo de Descrição:** Textarea de texto livre adicionada ao modal, abaixo das datas
- ✅ **`OrcamentoMeta`:** Adicionados `dataSaida?`, `dataChegada?`, `descricao?`
- ✅ **`OrcamentoListItem`:** Adicionados `dataSaida?`, `dataChegada?`, `descricao?`
- ✅ **`criar()` Atualizado:** Parâmetros 15º (`dataSaida`), 16º (`dataChegada`), 17º (`descricao`) adicionados
- ✅ **Backend — Entidade `Orcamento.cs`:** Propriedades `DataSaida?`, `DataChegada?`, `Descricao?` adicionadas
- ✅ **Backend — `OrcamentoLancamento`:** Mesmas propriedades no modelo de domínio
- ✅ **Backend — `CreateOrcamentoDto`:** Campos opcionais `DataSaida?`, `DataChegada?`, `Descricao?`
- ✅ **Backend — `UpdateOrcamentoDto`:** Campos opcionais `DataSaida?`, `DataChegada?`, `Descricao?`
- ✅ **Backend — `OrcamentoResponseDto`:** Campos incluídos na resposta
- ✅ **Backend — Handlers:** Create e Update mapeiam e retornam os novos campos
- ✅ **Backend — Repository `UpdateAsync`:** Atualiza `DataSaida`, `DataChegada` e `Descricao` quando fornecidos

**Compatibilidade:**
- Dados Antigos: Orçamentos sem esses campos continuam funcionando (todos opcionais)
- API: Sem mudanças não-retrocompatíveis
- Banco de Dados: Requer migration para adicionar as colunas (`DataSaida`, `DataChegada`, `Descricao`)

---

### Versão 1.4 (27 de Fevereiro de 2026)
**Mudanças Principais:**
- ✅ **Funcionário no Modal:** Seleção de funcionário responsável adicionada ao modal de criação
- ✅ **Dropdown de Funcionário:** Busca em tempo real por nome completo ou username
- ✅ **Auto-preenchimento:** Username e Cargo exibidos automaticamente ao selecionar funcionário
- ✅ **Exclusão Mútua de 4 Dropdowns:** Abrir cliente, despachante, porto ou funcionário fecha os demais
- ✅ **`OrcamentoMeta`:** Adicionado campo `funcionarioId`
- ✅ **`OrcamentoListItem`:** Adicionados campos `funcionario` e `funcionarioId`
- ✅ **`criar()` Atualizado:** Serviço recebe `funcionarioId` e `funcionario` como 13º e 14º parâmetros
- ✅ **`FuncionariosService` integrado:** Injetado em `NovoProcessoComponent`, lista carregada no `ngOnInit()`
- ✅ **Modal Redimensionável:** `.modal-lg` recebeu `resize: both` com min-width 480px, min-height 400px, max-width 95vw, max-height 92vh

**Compatibilidade:**
- Backend: Compatível (campo `funcionarioId` é opcional)
- Dados Antigos: Orçamentos sem funcionário continuam funcionando normalmente
- API: Sem mudanças não-retrocompatíveis

---

### Versão 1.3 (27 de Fevereiro de 2026)
**Mudanças Principais:**
- ✅ **Porto Destino no Modal:** Seleção de porto de destino adicionada ao modal de criação
- ✅ **Dropdown de Porto:** Busca em tempo real entre portos cadastrados (apenas por nome)
- ✅ **Exclusão Mútua de 3 Dropdowns:** Abrir cliente, despachante ou porto fecha os demais
- ✅ **`OrcamentoMeta`:** Adicionado campo `portoDestinoId`
- ✅ **`OrcamentoListItem`:** Adicionados campos `portoDestino` e `portoDestinoId`
- ✅ **`criar()` Atualizado:** Serviço recebe `portoDestinoId` e `portoDestino` como 11º e 12º parâmetros
- ✅ **`PortosService` integrado:** Injetado em `NovoProcessoComponent`, lista carregada no `ngOnInit()`

**Compatibilidade:**
- Backend: Compatível (campo `portoDestinoId` é opcional)
- Dados Antigos: Orçamentos sem porto continuam funcionando normalmente
- API: Sem mudanças não-retrocompatíveis

---

### Versão 1.2 (27 de Fevereiro de 2026)
**Mudanças Principais:**
- ✅ **Seleção de Despachante no Modal:** Campo opcional de despachante adicionado ao modal de criação
- ✅ **Dropdown de Despachante:** Busca em tempo real entre despachantes cadastrados
- ✅ **Contato Automático (Despachante):** Contato preenchido automaticamente ao selecionar
- ✅ **Exclusão Mútua de Dropdowns:** Abrir dropdown de cliente fecha o de despachante (e vice-versa)
- ✅ **Seções Visuais no Modal:** Labels "👤 Cliente" e "🧭 Despachante (opcional)" separam campos
- ✅ **`criar()` Atualizado:** Serviço recebe `despachanteId` e `despachante` como parâmetros opcionais

**Compatibilidade:**
- Backend: Compatível (`despachanteId` já existia no DTO)
- Dados Antigos: Orçamentos sem despachante continuam funcionando normalmente
- API: Sem mudanças não-retrocompatíveis

---
### Versão 1.1 (27 de Fevereiro de 2026)
**Mudanças Principais:**
- ✅ **Modal Simplificado:** Reduzido para 3 campos principais (Tipo, Nome, Contato)
- ✅ **Integração do Dropdown:** Campo "Nome do Cliente" agora inclui busca integrada
- ✅ **Remoção de Template Display:** Informações de Template removidas do modal
- ✅ **Remoção de Cliente Info:** Seção de "Informações do Cliente" removida
- ✅ **Auto-preenchimento de Contato:** Contato preenchido automaticamente ao selecionar cliente
- ✅ **Busca por Nome:** Filtro simplificado apenas por nome do cliente
- ✅ **UX Melhorada:** Fluxo de criação mais direto e intuitivo

**Descontinuado:**
- Campo "Selecione o Cliente" separado
- Exibição de Template no modal
- Seção de Informações do Cliente no modal
- Busca por documento de cliente

**Compatibilidade:**
- Backend: Compatível (novo parâmetro `tipoOrcamento` com padrão)
- Dados Antigos: Todos orçamentos existentes continuam funcionando
- API: Não houve mudanças não-retrocompatíveis

### Versão 1.0 (27 de Fevereiro de 2026) - Inicial
- Release inicial da feature de Orçamento
- Modal com campos separados
- Suporte a Marítimo (Aéreo desabilitado)
- Integração com Cliente, Custo, Venda, Aduana, Packlist

---

## �🚀 Como Usar

### Criar Novo Orçamento
1. Clique em "+ Criar novo orçamento"
2. Modal exibe os campos:
   - **Tipo de Orçamento:** Dropdown (Marítimo padrão, Aéreo desabilitado)
   - **Tipo de Importação:** Dropdown opcional ao lado (Direta / Conta a Ordem)
   - **👤 Cliente:** Dropdown com busca em tempo real (obrigatório)
   - **🧭 Despachante (opcional):** Dropdown com busca em tempo real
   - **🛳️ Porto Destino (opcional):** Dropdown com busca em tempo real
   - **👤 Funcionário (opcional):** Dropdown com busca por nome ou username
   - **Saída / Chegada (opcional):** Campos de data lado a lado
   - **Descrição (opcional):** Textarea livre
3. Comece digitando o nome do cliente para buscar
4. Clique no cliente desejado — contato preenche automaticamente
5. (Opcional) Comece digitando o nome do despachante para buscar
6. (Opcional) Clique no despachante desejado — contato preenche automaticamente
7. (Opcional) Comece digitando o nome do porto destino para buscar
8. (Opcional) Clique no porto desejado para selecioná-lo
9. (Opcional) Comece digitando o nome ou username do funcionário
10. (Opcional) Clique no funcionário — username e cargo preenchem automaticamente
11. (Opcional) Preencha as datas de Saída e/ou Chegada
12. (Opcional) Preencha a Descrição com informações adicionais
13. Selecione Tipo (se desejar mudar de Marítimo)
14. Clique "Criar Orçamento"
15. Redirecionado para página de detalhes para continuar preenchimento

### Visualizar Orçamento
1. Tabela exibe: Tipo (🚢 Marítimo/✈️ Aéreo), Data, Cliente, Despachante, Código, Status
2. Clique 👁️ para visualizar (somente leitura)
3. Clique ✏️ para editar detalhes
4. Clique 🗑️ para deletar (soft delete)
5. Tabs disponíveis: Informações, Custos, Venda, Aduana, Packlist

### Fluxo Com Packlist
1. Se cliente tem template → Packlist é importado automaticamente
2. Custos são pré-calculados
3. Venda é sugerida
4. Usuário pode ajustar valores

### Fluxo Manual
1. Se cliente sem template → "Manual (sem packlist)"
2. Usuário lança custos na aba "Custos"
3. Usuário define venda na aba "Venda"
4. Segue para aprovação

### Buscar/Filtrar
1. Campo de busca no topo: busca por cliente, despachante, código ou status
2. Resultados filtram em tempo real
3. Exibição completa com paginação

---

## 📊 Campos Adicionais por Tab

### Tab Informações
- Cliente
- Despachante
- Porto Destino
- Funcionário Responsável
- Tipo de Orçamento
- Código
- Data de Criação
- Data de Saída
- Data de Chegada
- Descrição
- Tipo de Importação
- Status Atual
- Fase Atual

### Tab Custos
- Lista de despesas
- Alíquota padrão
- Total com impostos
- Observações

### Tab Venda
- Preço base
- Margem percentual
- Preço final
- Moeda

### Tab Aduana
- Documentos necessários
- Número de registro
- Status aduaneiro
- Datas importantes

### Tab Packlist
- Itens importados
- Volumes
- Peso
- CBM
- Descrição comercial

---

## 📞 Suporte e Contato

Para dúvidas sobre a feature de Orçamentos, consulte:
- **Frontend:** `import-costs/src/app/features/orcamento/`
- **Backend:** `import-costs-api/Features/Orcamentos/`
- **Documentação API:** `http://localhost:5000/swagger`
- **Storage Local:** Browser DevTools → Application → LocalStorage

---

**Mantido por:** Equipe de Desenvolvimento  
**Próxima Revisão:** 31 de Março de 2026

> **Pendente:** Migration do banco de dados para adicionar colunas `DataSaida`, `DataChegada`, `Descricao` e `TipoImportacao` na tabela de Orçamentos.
