# Documentação Completa do Sistema — Aduana V2

> **Aplicação:** Import Costs (Aduana V2)  
> **Stack:** Angular 17+ (standalone components) + .NET 8 (API - em desenvolvimento)  
> **Armazenamento:** `localStorage` via camada de abstração `storage-v2.helper.ts`  
> **Data de referência:** Abril/2026  

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura da Aplicação](#2-arquitetura-da-aplicação)
3. [Navegação e Rotas](#3-navegação-e-rotas)
4. [Armazenamento de Dados (localStorage)](#4-armazenamento-de-dados-localstorage)
5. [Entidades e Tabelas](#5-entidades-e-tabelas)
6. [Features — Cadastros](#6-features--cadastros)
7. [Features — Operação](#7-features--operação)
8. [Features — Logística](#8-features--logística)
9. [Features — Administração](#9-features--administração)
10. [Fluxo Principal de Negócio](#10-fluxo-principal-de-negócio)
11. [Statuses e Ciclos de Vida](#11-statuses-e-ciclos-de-vida)
12. [Cálculo de Impostos](#12-cálculo-de-impostos)
13. [Relacionamentos entre Entidades](#13-relacionamentos-entre-entidades)
14. [Regras de Negócio](#14-regras-de-negócio)
15. [Seed de Dados Demo](#15-seed-de-dados-demo)
16. [Backend API (.NET 8)](#16-backend-api-net-8)

---

## 1. Visão Geral

O sistema **Aduana V2** é uma plataforma de gestão de importações voltada para **despachantes aduaneiros** e **trading companies**. Controla todo o ciclo de uma importação: desde a **solicitação de orçamento** por um cliente, passando pelo **cálculo de custos** e **emissão de orçamento de venda**, até o **acompanhamento do embarque** e **desembaraço aduaneiro**.

### Atores do sistema

| Ator | Responsabilidade |
|------|-----------------|
| **Operador / Usuário** | Cadastros, criação de solicitações, gestão de embarques |
| **Despachante** | Recebe solicitação, responde custo; pode ser empresa terceira |
| **Importador** | Empresa que realiza a importação da mercadoria |
| **Cliente** | Empresa/pessoa que contrata o serviço (pode coincidir com importador) |
| **Exportador** | Empresa fornecedora no exterior |
| **Agente de Carga** | Empresa de transporte internacional (armador/NVOCC) |

---

## 2. Arquitetura da Aplicação

```
import-costs/
├── src/app/
│   ├── app.routes.ts               ← Rotas principais (V1 + V2)
│   ├── features/auth/              ← Autenticação (login, profile, guards)
│   └── v2/
│       ├── core/
│       │   ├── helpers/
│       │   │   ├── storage-v2.helper.ts    ← CRUD localStorage
│       │   │   └── seed-demo.service.ts    ← Dados demo
│       │   └── layout/
│       │       └── shell-v2.component.ts   ← Layout principal (sidebar + header)
│       ├── features/
│       │   ├── administracao/      ← Cargos, Níveis de Acesso
│       │   ├── cadastros/          ← Todos os cadastros base
│       │   ├── custo-despachante/  ← Wizard de custo interno
│       │   ├── dashboard/          ← Dashboard com KPIs
│       │   ├── documentos/         ← Gestão de documentos
│       │   ├── embarque-aduana/    ← Operação de embarques
│       │   ├── logistica/          ← Controle de navios
│       │   ├── orcamento-venda/    ← Orçamento comercial
│       │   └── solicitacao-orcamento/ ← Ponto de partida do fluxo
│       └── shared/                 ← Estilos compartilhados

import-costs-api/                   ← Backend .NET 8 (em produção/desenvolvimento)
├── Controllers/                    ← Endpoints REST
├── Features/                       ← CQRS por domínio
├── Domain/                         ← Entidades, ValueObjects, Enums
└── Core/                           ← Database, Middleware, Storage
```

### Camadas do Frontend

| Camada | Responsabilidade |
|--------|-----------------|
| **Component** | Lógica de UI, formulários, exibição |
| **Service** | Acesso ao armazenamento, operações CRUD, regras simples |
| **Model** | Interfaces TypeScript e tipos |
| **Storage Helper** | Abstração do `localStorage` com tipagem |

---

## 3. Navegação e Rotas

### Rota raiz `/` → V2 (sistema novo)

Todas as rotas abaixo requerem autenticação (`authGuard`).

| Caminho | Componente | Descrição |
|---------|-----------|-----------|
| `/dashboard` | `DashboardV2Component` | KPIs e resumos |
| **Operação** | | |
| `/solicitacoes` | `SolicitacaoOrcamentoComponent` | Solicitações de orçamento |
| `/custos` | `CustoDespachanteComponent` | Custos internos (despachante) |
| `/orcamentos-venda` | `OrcamentoVendaComponent` | Orçamentos comerciais |
| `/embarques` | `EmbarqueAduanaComponent` | Lista de embarques |
| `/embarques?acompanhamento=1` | `EmbarqueAduanaComponent` | Visão de acompanhamento |
| **Logística** | | |
| `/controle-navios` | `ControleNaviosComponent` | Gestão de navios e viagens |
| **Cadastros** | | |
| `/portos-origem` | `PortosOrigemComponent` | Portos de embarque |
| `/portos-destino` | `PortosDestinoComponent` | Portos de desembarque |
| `/clientes` | `ClientesV2Component` | Clientes |
| `/importadores` | `ImportadoresComponent` | Importadores |
| `/exportadores` | `ExportadoresComponent` | Exportadores |
| `/agentes-carga` | `AgentesCargaComponent` | Agentes de carga |
| `/fabricantes` | `FabricantesComponent` | Fabricantes |
| `/ncm` | `NcmComponent` | Tabela NCM com alíquotas |
| `/lista-preco-lcl` | `ListaPrecoLclComponent` | Tabela de preços LCL |
| `/despachantes` | `DespachantesV2Component` | Despachantes |
| `/despesas-cadastro` | `DespesasCadastroComponent` | Catálogo de despesas |
| `/modelos-despesa` | `ModelosDespesaComponent` | Modelos de grupo de despesas |
| **Administração** | | |
| `/cargos` | `CargosComponent` | Cargos de funcionários |
| `/niveis-acesso` | `NiveisAcessoComponent` | Níveis de acesso |

### Rota `/legacy` → V1 (congelada, referência visual)

O sistema V1 está preservado em `/legacy` para referência. Não recebe novas funcionalidades.

---

## 4. Armazenamento de Dados (localStorage)

Toda a persistência do frontend é feita via `localStorage` com chaves prefixadas `v2_`.

### Chaves do Storage

```typescript
// Cadastros base
v2_portos_origem          // PortoOrigem[]
v2_portos_destino         // PortoDestino[]
v2_clientes               // ClienteV2[]
v2_importadores           // Importador[]
v2_exportadores           // Exportador[]
v2_agentes_carga          // AgenteCarga[]
v2_fabricantes            // Fabricante[]
v2_ncms                   // Ncm[]
v2_lista_preco_lcl        // ListaPrecoLcl[]
v2_despachantes           // DespachanteV2[]
v2_cargos                 // Cargo[]
v2_niveis_acesso          // NivelAcesso[]

// Logística
v2_controle_navios        // ControleNavio[]
v2_navio_trajetos         // ControleNavioTrajeto[]

// Custo interno (despachante)
v2_custos_despachante     // CustoDespachante[]
v2_custos_li              // CustoDespachanteLi[]
v2_custos_despesas        // CustoDespachanteDespesa[]
v2_ncms_vinculados        // NcmVinculadoOrcamento[]
v2_valores_imposto        // ValorImposto[]

// Comercial
v2_orcamentos_venda       // OrcamentoVenda[]
v2_orc_despesas           // OrcamentoVendaDespesa[]
v2_orc_extras             // OrcamentoVendaDespesaExtra[]
v2_orc_custos             // OrcamentoVendaCusto[] (junction)

// Operação — Embarques
v2_embarques              // EmbarqueAduana[]
v2_status_embarque        // StatusEmbarque[] (seed fixo)
v2_historico_status       // HistoricoStatusEmbarque[]
v2_free_times             // FreeTimeEmbarque[]
v2_pagamentos             // PagamentoProcesso[]

// Documentos
v2_tipos_documento        // TipoDocumento[]
v2_documentos             // Documento[]
v2_documento_vinculos     // DocumentoVinculo[]

// Despesas e Modelos
v2_despesas_cadastro      // DespesaCadastro[]
v2_modelos_despesa        // ModeloDespesa[]
v2_modelos_despesa_itens  // ModeloDespesaItem[]

// Solicitação de Orçamento
v2_solicitacoes_orcamento          // SolicitacaoOrcamento[]
v2_solicitacao_despachantes        // SolicitacaoOrcamentoDespachante[]
v2_solicitacao_documentos          // SolicitacaoOrcamentoDocumento[]
```

### Funções Helper

| Função | Descrição |
|--------|-----------|
| `readV2<T>(key)` | Lê array do localStorage com JSON.parse seguro |
| `writeV2<T>(key, data)` | Escreve array no localStorage |
| `addV2<T>(key, item)` | Insere item no array existente |
| `updateV2<T>(key, item)` | Atualiza item por `id` |
| `deleteV2<T>(key, id)` | Remove item por `id` |
| `generateV2Id()` | Gera UUID via `crypto.randomUUID()` |
| `generateCode(prefix, count)` | Gera código `PREFIX-AAAA-NNN` |

---

## 5. Entidades e Tabelas

### 5.1 Cadastros Base

#### `ClienteV2` — Clientes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | Identificador único |
| `razaoSocial` | string | Razão social da empresa |
| `cnpj` | string | CNPJ formatado |
| `email` | string | E-mail de contato |
| `telefone` | string | Telefone |
| `ativo` | boolean | Habilitado no sistema |

#### `Importador` — Importadores
Mesma estrutura de `ClienteV2`. Representa a entidade que faz a importação formalmente (pode ser diferente do cliente comercial).

#### `DespachanteV2` — Despachantes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (UUID) | Identificador único |
| `nome` | string | Nome ou razão social |
| `crn` | string | Registro no CRFB/SINDIEX |
| `email` | string | E-mail |
| `telefone` | string | Telefone |
| `ativo` | boolean | Habilitado no sistema |

#### `PortoOrigem` — Portos de Origem (exterior)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `nome` | string | Nome do porto |
| `codigo` | string | Código IATA/Locode (ex: SHA, NGB) |
| `pais` | string | País |
| `ativo` | boolean | — |

#### `PortoDestino` — Portos de Destino (Brasil)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `nome` | string | Nome do porto |
| `codigo` | string | Código Locode (ex: BRSSZ, BRPNG) |
| `estado` | string? | Estado (UF) |
| `pais` | string | País |
| `ativo` | boolean | — |

#### `Ncm` — Nomenclatura Comum do Mercosul
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `codigoNcm` | string | 8 dígitos (ex: 85171400) |
| `descricao` | string | Descrição da mercadoria |
| `aliqII` | number | Alíquota Imposto de Importação (%) |
| `aliqIPI` | number | Alíquota IPI (%) |
| `aliqPIS` | number | Alíquota PIS (%) |
| `aliqCOFINS` | number | Alíquota COFINS (%) |
| `aliqICMS` | number | Alíquota ICMS (%) |
| `ativo` | boolean | — |

#### `AgenteCarga` — Agentes de Carga (armadores/NVOCCs)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `nome` | string | Nome da empresa |
| `documento` | string | CNPJ ou código estrangeiro |
| `pais` | string | País de origem |
| `contato` | string | E-mail ou telefone |
| `ativo` | boolean | — |

#### `Exportador` — Exportadores (fornecedores no exterior)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `nome` | string | Nome da empresa |
| `documento` | string | Documento fiscal local |
| `pais` | string | País |
| `cidade` | string | Cidade |
| `ativo` | boolean | — |

#### `Fabricante` — Fabricantes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `nome` | string | Nome da fábrica |
| `pais` | string | País |
| `cidade` | string | Cidade |
| `contato` | string | Contato |
| `ativo` | boolean | — |

#### `ListaPrecoLcl` — Tabela de Preços LCL
Utilizada para cotação de frete LCL (Less Container Load).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `categoria` | string | Ex: Geral, Perecível, Perigosa |
| `descricao` | string | Descrição da rota/serviço |
| `nomeChines` | string? | Nome em caracteres chineses (opcional) |
| `precoUsdPorCbm` | number | Preço por metro cúbico em USD |
| `precoUsdPorKg` | number | Preço por kg em USD |
| `dataVigencia` | string | Data de vigência (YYYY-MM-DD) |
| `ativo` | boolean | — |

#### `DespesaCadastro` — Catálogo de Despesas
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `descricao` | string | Nome da despesa |
| `valor` | number | Valor padrão sugerido |
| `categoria` | `CategoriaDespesa` | Ver categorias abaixo |
| `ativo` | boolean | — |

**Categorias de despesa:**
- `Agência Marítima`
- `Despachante`
- `Tributos`
- `Portos`
- `Outras Despesas`

#### `ModeloDespesa` — Modelos de Grupo de Despesas
Permite criar templates de conjuntos de despesas para reutilização.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `nome` | string | Nome do modelo |
| `descricao` | string? | Descrição |
| `ativo` | boolean | — |

#### `ModeloDespesaItem` — Itens do Modelo de Despesa
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `modeloDespesaId` | string | FK → ModeloDespesa |
| `despesaCadastroId` | string | FK → DespesaCadastro |

---

### 5.2 Logística

#### `ControleNavio` — Navios / Viagens
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `numeroViagem` | string | Número de viagem (ex: 2026-001) |
| `nomeNavio` | string | Nome do navio |
| `observacao` | string? | Observações |
| `ativo` | boolean | — |

#### `ControleNavioTrajeto` — Trajetos do Navio
Cada viagem pode ter múltiplos trajetos (porto a porto).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `controleNavioId` | string | FK → ControleNavio |
| `portoOrigemId` | string | FK → PortoOrigem |
| `portoDestinoId` | string | FK → PortoDestino |
| `etd` | string | Data prevista de saída (YYYY-MM-DD) |
| `eta` | string | Data prevista de chegada (YYYY-MM-DD) |
| `trajetoDescricao` | string? | Ex: "Shanghai → Santos" |

---

### 5.3 Custo Despachante

#### `CustoDespachante` — Custo Interno
Representa o cálculo de custo que o despachante faz para uma importação. Código gerado automaticamente no formato `CD-AAAA-NNN`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `codigoInterno` | string | CD-2026-001 |
| `despachanteId` | string | FK → DespachanteV2 |
| `importadorId` | string | FK → Importador |
| `portoOrigemId` | string | FK → PortoOrigem |
| `portoDestinoId` | string | FK → PortoDestino |
| `responsavel` | string | Nome do responsável (livre) |
| `peso` | number | Peso em kg |
| `fobUsd` | number | Valor FOB em USD |
| `fobReais` | number | Valor FOB em R$ |
| `cifUsd` | number | Valor CIF em USD |
| `cifReais` | number | Valor CIF em R$ |
| `seguroUsd` | number | Valor do seguro em USD |
| `taxaUsd` | number | Taxa de câmbio USD/BRL |
| `taxaUsdAgente` | number? | Taxa de câmbio específica do agente |
| `tamContainer` | `'20' \| '40' \| 'LCL'` | Tipo de container |
| `data` | string | Data do custo (YYYY-MM-DD) |
| `observacao` | string? | Observações |
| `solicitacaoOrcamentoId` | string? | FK opcional → SolicitacaoOrcamento |
| `status` | `StatusCustoDespachante` | Ver statuses abaixo |

#### `CustoDespachanteLi` — Licenças de Importação (LI)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `custoDespachanteId` | string | FK → CustoDespachante |
| `ncm` | string | Número NCM (formato livre) |
| `descricao` | string | Descrição da mercadoria |
| `valor` | number | Valor em R$ |
| `data` | string | Data da LI (YYYY-MM-DD) |

#### `CustoDespachanteDespesa` — Despesas do Custo
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `custoDespachanteId` | string | FK → CustoDespachante |
| `descricao` | string | Descrição da despesa |
| `valor` | number | Valor em R$ |
| `data` | string | Data (YYYY-MM-DD) |
| `entraBaseIcms` | boolean | Se entra na base de cálculo do ICMS |

#### `NcmVinculadoOrcamento` — NCMs do Custo (para cálculo tributário)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `custoDespachanteId` | string | FK → CustoDespachante |
| `ncmId` | string | FK → Ncm |
| `numeroNcm` | string | Código NCM (8 dígitos) |
| `descricao` | string | Descrição |
| `aliIi` | number | Alíquota II (%) |
| `aliIpi` | number | Alíquota IPI (%) |
| `aliPis` | number | Alíquota PIS (%) |
| `aliCofins` | number | Alíquota COFINS (%) |
| `aliIcms` | number | Alíquota ICMS (%) |
| `baseCalculo` | number | Base de cálculo em R$ |

#### `ValorImposto` — Valores Calculados por NCM
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `ncmVinculadoOrcamentoId` | string | FK → NcmVinculadoOrcamento |
| `aliIi`/`valorIi` | number | Alíquota e valor II |
| `aliIpi`/`valorIpi` | number | Alíquota e valor IPI |
| `aliPis`/`valorPis` | number | Alíquota e valor PIS |
| `aliCofins`/`valorCofins` | number | Alíquota e valor COFINS |
| `aliIcms`/`valorIcms` | number | Alíquota e valor ICMS |
| `totalImpostos` | number | Soma de todos os impostos |

---

### 5.4 Orçamento de Venda

#### `OrcamentoVenda` — Orçamento Comercial
Documento enviado ao cliente com o preço total do serviço. Código: `OV-AAAA-NNN`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `codigoInterno` | string | OV-2026-001 |
| `clienteId` | string | FK → ClienteV2 |
| `solicitacaoOrcamentoId` | string? | FK → SolicitacaoOrcamento |
| `custoDespachanteId` | string? | FK legado |
| `data` | string | Data (YYYY-MM-DD) |
| `tamContainer` | string | Tipo de container |
| `pesoBruto` | number | Peso bruto em kg |
| `pesoLiquido` | number | Peso líquido em kg |
| `freteInternacional` | number | Valor do frete em R$ |
| `cifReais`/`cifUsd` | number | CIF em R$ e USD |
| `fobReais`/`fobUsd` | number | FOB em R$ e USD |
| `taxaUsd` | number | Taxa de câmbio |
| `honorarios` | number | Honorários em R$ |
| `totalImpostos` | number | Total de impostos calculados |
| `totalDespesas` | number | Total de despesas |
| `totalExtras` | number | Total de extras |
| `totalGeral` | number | Total geral (soma de tudo) |
| `observacao` | string? | Observações |
| `status` | string? | Ver statuses abaixo |

#### `OrcamentoVendaDespesa` — Despesas do Orçamento
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `orcamentoVendaId` | string | FK → OrcamentoVenda |
| `descricao` | string | Descrição |
| `valor` | number | Valor em R$ |

#### `OrcamentoVendaDespesaExtra` — Despesas Extras
Mesma estrutura de `OrcamentoVendaDespesa`. Separadas para controle gerencial.

#### `OrcamentoVendaCusto` — Junction OV ↔ CustoDespachante
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `orcamentoVendaId` | string | FK → OrcamentoVenda |
| `custoDespachanteId` | string | FK → CustoDespachante |

---

### 5.5 Embarques

#### `StatusEmbarque` — Status de Embarque (seed fixo)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `nome` | `StatusEmbarqueNome` | Nome amigável |
| `codigo` | string | Código curto (PREV, AGRD, etc.) |
| `ordem` | number | Ordem numérica 1–7 |
| `ativo` | boolean | — |

**Seed fixo dos status de embarque:**
| Ordem | Nome | Código |
|-------|------|--------|
| 1 | Previsto | PREV |
| 2 | Aguardando | AGRD |
| 3 | Atracado | ATRC |
| 4 | Registrado | RGTD |
| 5 | Desembaraçado | DSMB |
| 6 | Entregue | ENTG |
| 7 | Finalizado | FNLZ |

#### `EmbarqueAduana` — Embarque / Processo de Importação
Entidade central da operação. Código: `EMB-AAAA-NNN`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `codigoInterno` | string | EMB-2026-001 |
| `refOminium` | string | Referência interna (Ominium) |
| `portoOrigemId` | string | FK → PortoOrigem |
| `portoDestinoId` | string | FK → PortoDestino |
| `agenteCargaId` | string | FK → AgenteCarga |
| `clienteId` | string | FK → ClienteV2 |
| `usuarioResponsavelId` | string | FK → usuário logado |
| `controleNavioId` | string | FK → ControleNavio |
| `despachanteId` | string | FK → DespachanteV2 |
| `exportadorId` | string? | FK → Exportador |
| `statusEmbarqueId` | string | FK → StatusEmbarque (atual) |
| `custoDespachanteId` | string? | FK → CustoDespachante |
| `orcamentoVendaId` | string? | FK → OrcamentoVenda |
| `solicitacaoOrcamentoId` | string? | FK → SolicitacaoOrcamento |
| `imp` | string | Número IMP |
| `bl` | string | Bill of Lading |
| `container` | string | Número do container |
| `kg` | number | Peso em kg |
| `etd` | string | Data prevista saída (YYYY-MM-DD) |
| `eta` | string | Data prevista chegada (YYYY-MM-DD) |
| `avisoPrevisao` | string? | Data aviso de previsão |
| `avisoChegada` | string? | Data aviso de chegada |
| `dataRegistro` | string? | Data do registro da DI |
| `desemb` | string? | Data do desembaraço |
| `entrega` | string? | Data da entrega |
| `li` | string | Número da LI |
| `registro` | string? | Número do registro |
| `refAg` | string? | Referência do agente |
| `observacao` | string? | Observações |

#### `HistoricoStatusEmbarque` — Histórico de Mudanças de Status
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `embarqueAduanaId` | string | FK → EmbarqueAduana |
| `statusEmbarqueId` | string | FK → StatusEmbarque |
| `dataStatus` | string | ISO datetime da mudança |
| `observacao` | string? | Texto registrado na mudança |
| `usuarioId` | string | Quem realizou a mudança |

#### `FreeTimeEmbarque` — Free Time do Container
Controle dos dias de free time concedidos pela armadora.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `embarqueAduanaId` | string | FK → EmbarqueAduana |
| `quantidadeDias` | number | Dias de free time |
| `dataInicio` | string | Data de início (YYYY-MM-DD) |
| `dataFim` | string | Calculado: dataInicio + quantidadeDias |
| `observacao` | string? | Observações |

**Cálculo automático:** `dataFim = dataInicio + quantidadeDias dias`

#### `PagamentoProcesso` — Pagamentos do Processo
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `embarqueAduanaId` | string | FK → EmbarqueAduana |
| `tipoPagamento` | `TipoPagamento` | Ver tipos abaixo |
| `dataPrevista` | string | Data prevista (YYYY-MM-DD) |
| `dataPagamento` | string? | Data de efetivação (quando pago) |
| `valor` | number | Valor em R$ |
| `despachanteId` | string | FK → DespachanteV2 |
| `observacao` | string? | Observações |

**Tipos de Pagamento:**
| Código | Label |
|--------|-------|
| `CobrancaSinal` | Cobrança Sinal |
| `SinalPago` | Sinal Pago |
| `FechamentoPago` | Fechamento Pago |
| `Honorario` | Honorário |
| `Outro` | Outro |

---

### 5.6 Solicitação de Orçamento

#### `SolicitacaoOrcamento` — Solicitação de Orçamento
Ponto de entrada do fluxo comercial. Código: `SOL-AAAA-NNN`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `codigoInterno` | string | SOL-2026-001 |
| `clienteId` | string? | FK → ClienteV2 |
| `importadorId` | string? | FK → Importador |
| `portoOrigemId` | string | FK → PortoOrigem |
| `portoDestinoId` | string | FK → PortoDestino |
| `responsavel` | string | Nome do responsável (usuário logado) |
| `tamContainer` | `'20' \| '40' \| 'LCL'` | Tipo de container |
| `peso` | number | Peso em kg |
| `observacao` | string? | Observações |
| `status` | `StatusSolicitacao` | Status atual |
| `data` | string | Data (YYYY-MM-DD) |

#### `SolicitacaoOrcamentoDespachante` — Despachantes Consultados
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `solicitacaoOrcamentoId` | string | FK → SolicitacaoOrcamento |
| `despachanteId` | string | FK → DespachanteV2 |
| `status` | `StatusSolicitacaoDespachante` | Status da consulta |
| `dataEnvio` | string | Data de envio (YYYY-MM-DD) |

**Status de Despachante na Solicitação:**
| Status | Significado |
|--------|------------|
| `PendenteDespachante` | Aguardando resposta do despachante |
| `Respondido` | Custo submetido pelo despachante |
| `FinalizadoDespachante` | Custo aprovado/finalizado |
| `Recusado` | Despachante recusou a solicitação |

#### `SolicitacaoOrcamentoDocumento` — Documentos Anexos (Packlist)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `solicitacaoOrcamentoId` | string | FK → SolicitacaoOrcamento |
| `nomeArquivo` | string | Nome do arquivo |
| `linkDocumento` | string | URL ou referência ao storage |
| `dataUpload` | string | Data do upload (YYYY-MM-DD) |
| `observacao` | string? | Observações |

---

### 5.7 Documentos

#### `TipoDocumento` — Tipos de Documentos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `nome` | string | Nome do tipo |
| `codigo` | string | Código curto |
| `categoria` | `CategoriaDocumento` | Embarque, Fiscal, Aduana, Contrato, Outro |
| `ativo` | boolean | — |

#### `Documento` — Documento Armazenado
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `tipoDocumentoId` | string | FK → TipoDocumento |
| `usuarioUploadId` | string | Quem fez o upload |
| `nomeOriginal` | string | Nome original do arquivo |
| `nomeSalvo` | string | Nome no storage |
| `caminhoArquivo` | string | base64 data URL |
| `extensao` | string | Ex: .pdf, .xlsx |
| `contentType` | string | MIME type |
| `tamanhoBytes` | number | Tamanho do arquivo |
| `dataUpload` | string | ISO datetime |
| `observacao` | string? | — |

#### `DocumentoVinculo` — Vínculo Documento ↔ Entidade
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `documentoId` | string | FK → Documento |
| `entidade` | string | Nome da entidade (ex: 'EmbarqueAduana') |
| `entidadeId` | string | ID da entidade vinculada |
| `papel` | string? | Papel do documento no contexto |
| `dataVinculo` | string | ISO datetime |

---

### 5.8 Administração

#### `Cargo` — Cargos de Funcionários
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `nome` | string | Nome do cargo |
| `descricao` | string | Descrição |
| `ativo` | boolean | — |

#### `NivelAcesso` — Níveis de Acesso
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID |
| `nome` | string | Nome do nível |
| `ordem` | number | Hierarquia numérica |
| `descricao` | string | Descrição das permissões |
| `ativo` | boolean | — |

---

## 6. Features — Cadastros

Todas as telas de cadastro seguem o mesmo padrão CRUD:
- **Lista** com busca por texto e filtros
- **Formulário** inline/modal para criação e edição
- **Flag `ativo`** para desativação sem exclusão
- Exclusão física apenas disponível quando não há vínculos

### 6.1 Portos de Origem
Portos internacionais de embarque. Usados em: Custo Despachante, Solicitação, Embarque, Trajetos de Navio.

### 6.2 Portos de Destino
Portos brasileiros de desembarque. Mesmos pontos de uso que Portos de Origem.

### 6.3 Clientes
Empresas que contratam o serviço de importação. Distintos dos importadores — um cliente pode ter múltiplos importadores.

### 6.4 Importadores
Pessoa jurídica que faz a declaração de importação no SISCOMEX. Vinculados a processos de custo e embarque.

### 6.5 Exportadores
Fornecedores no exterior, vinculados aos embarques.

### 6.6 Agentes de Carga
Armadores ou NVOCCs responsáveis pelo transporte marítimo. Vinculados aos embarques.

### 6.7 Fabricantes
Fábricas de origem da mercadoria. Cadastro auxiliar para controle.

### 6.8 NCM
Tabela de classificação fiscal com alíquotas tributárias. Alimenta o cálculo automático de impostos no Custo Despachante.

### 6.9 Lista Preço LCL
Tabela de preços para cargas LCL (agrupadas). Categorias: Geral, Perecível, Perigosa. Preços em USD por CBM e por kg.

### 6.10 Despachantes
Empresas ou profissionais de despacho aduaneiro. Vinculados a custos, embarques e solicitações.

### 6.11 Despesas — Catálogo
Catálogo de despesas padrão com valores de referência. Organizadas por categoria. Utilizadas como base para os Modelos de Despesa.

### 6.12 Modelos de Despesas
Templates de conjuntos de despesas para reutilização em orçamentos. Cada modelo contém N itens do catálogo de despesas.

---

## 7. Features — Operação

### 7.1 Solicitação de Orçamento (`/solicitacoes`)

**Objetivo:** Registrar a demanda de um cliente por um serviço de importação.

**Campos obrigatórios na criação:**
- Porto Origem, Porto Destino, Data
- Pelo menos 1 (um) Despachante consultado

**Comportamento na criação (automático):**
1. Status inicial: `AguardandoCusto`
2. Para cada despachante adicionado: cria automaticamente um `CustoDespachante` com status `AguardandoCusto`
3. Cria automaticamente um `OrcamentoVenda` com status `AguardandoDespachante`

**Comportamento na edição:**
- Quando a solicitação transiciona de `AguardandoAprovacaoCliente → Aprovada`, o sistema cria automaticamente um `EmbarqueAduana` com status `Previsto`

**Sub-entidades gerenciadas:**
- **Despachantes consultados:** lista de despachantes com status e data de envio
- **Documentos (Packlist):** arquivos vinculados à solicitação

**Visualização dos custos gerados:** A seção de despachantes mostra o código do CustoDespachante gerado e seu status atual.

---

### 7.2 Custo Despachante (`/custos`)

**Objetivo:** Cálculo detalhado do custo de importação pelo despachante.

**Criação:** Pode ser criado:
- Manualmente pelo operador
- Automaticamente pela solicitação de orçamento

**Wizard de 4 etapas:**

| Etapa | Conteúdo |
|-------|---------|
| 1 — Dados Gerais | Despachante, importador, portos, container, pesos, valores (FOB/CIF/seguro/câmbio), data, observação |
| 2 — Licenças de Importação (LI) | Múltiplas LIs com NCM, descrição e valor |
| 3 — Despesas | Lista de despesas com flag de base ICMS |
| 4 — NCMs e Impostos | NCMs vinculados com alíquotas e base de cálculo → cálculo automático de tributos |

**Botões de ação no wizard:**
- **💾 Salvar** — salva com status `AguardandoCusto`
- **✅ Finalizar** — salva com status `Finalizado`
- **Gerar PDF** — gera relatório imprimível (HTML para impressão)

**Cálculo de impostos (etapa 4):** Realizado pelo `ImpostoCalculatorService`:
```
Valor II      = baseCalculo × (aliII / 100)
Valor IPI     = (baseCalculo + valorII) × (aliIPI / 100)
Valor PIS     = baseCalculo × (aliPIS / 100)
Valor COFINS  = baseCalculo × (aliCOFINS / 100)
Valor ICMS    = (baseCalculo + valorII + valorIPI) × (aliICMS / 100)
Total         = II + IPI + PIS + COFINS + ICMS
```

**Exclusão em cascata:** ao remover um CustoDespachante, remove também LIs, Despesas, NCMs Vinculados e Valores de Imposto.

---

### 7.3 Orçamento de Venda (`/orcamentos-venda`)

**Objetivo:** Documento comercial enviado ao cliente com o preço total da importação.

**Criação:** Pode ser criado:
- Manualmente pelo operador
- Automaticamente pela solicitação de orçamento (status inicial: `AguardandoDespachante`)

**Campos principais:**
- Cliente, data, container, pesos bruto/líquido
- Valores: frete internacional, CIF, FOB, taxa de câmbio
- Honorários, total impostos, total despesas, total extras, **total geral**

**Componentes do total geral:**
```
Total Geral = totalImpostos + totalDespesas + totalExtras + honorarios + freteInternacional
```

**Sub-entidades:**
- **Despesas:** lista de despesas normais (capatazia, THC, armazenagem, etc.)
- **Extras:** despesas extras segregadas para análise
- **Custos Vinculados (junction):** relacionamento M:N entre OV e CustosDespachante

**Status do Orçamento de Venda:**
| Status | Significado |
|--------|------------|
| `Rascunho` | Em elaboração |
| `AguardandoDespachante` | Aguardando custo do despachante (automático) |
| `AguardandoOrcamentoVenda` | Aguardando finalização do orçamento |
| `Finalizado` | Aprovado e finalizado |

---

### 7.4 Embarques Aduana (`/embarques`)

**Objetivo:** Gestão operacional dos processos de importação em andamento.

**Modos de visualização:**
- **Lista** — todos os embarques com filtros por status e cliente
- **Acompanhamento** — visão de dashboard por status
- **Detalhe** — página completa do processo

**Campos do formulário (criação):**
- Cliente*, Despachante*, Porto Origem*, Porto Destino*
- Agente de carga, Navio, Exportador
- IMP, BL, Container, Peso (kg)
- ETD, ETA
- LI, Referência Ominium, Ref. Agente
- Observação

> **Nota:** O botão "+ Novo Embarque" está **desabilitado** na interface — embarques são criados automaticamente pelo fluxo da Solicitação (ao aprovar).

**Funcionalidades no Detalhe do Embarque:**

1. **Timeline de Status** — visualização gráfica dos 7 status com marcação do atual e histórico
2. **Alteração de Status** — clicando em qualquer passo da timeline abre modal para confirmar mudança com observação
3. **Free Time** — cadastro de períodos de isenção de demurrage com cálculo de dias restantes; alerta visual quando próximo do vencimento
4. **Pagamentos do Processo** — controle de pagamentos com tipo, data prevista, data de pagamento e valor; indicadores visuais de pago/vencido/pendente
5. **Histórico de Status** — feed cronológico de todas as mudanças

**Campos editáveis inline no detalhe:**
- Ref. Ominium, BL, Container, ETA, Aviso Previsão, Aviso Chegada, Data Registro DI, Data Desembaraço, Data Entrega, LI, Registro, Ref. Agente

**Acompanhamento de Embarques:**
- Visão kanban/agrupada por status
- Filtros por cliente e status
- Acesso direto ao detalhe de cada embarque

---

### 7.5 Documentos (`/documentos`)

**Objetivo:** Repositório central de documentos vinculados a processos.

**Categorias:** Embarque, Fiscal, Aduana, Contrato, Outro

**Vinculações:** Um documento pode ser vinculado a qualquer entidade do sistema via `DocumentoVinculo` com referência de `entidade` (string) e `entidadeId`.

---

## 8. Features — Logística

### 8.1 Controle de Navios (`/controle-navios`)

**Objetivo:** Gestão de navios, viagens e acompanhamento dos embarques por navio.

**Cadastro de Navio/Viagem:**
- Número da Viagem (ex: 2026-001)
- Nome do Navio
- Trajetos: múltiplos trajetos porto a porto com ETD e ETA

**Visão Principal — Tabela de Navios com Embarques:**

A tabela mostra apenas navios que possuem embarques com status **não finalizado** (ordem < 6, ou seja, não Entregue nem Finalizado).

| Coluna | Descrição |
|--------|-----------|
| Nº Viagem | Código da viagem |
| Navio | Nome do navio |
| ETA Destino | Maior ETA entre todos os trajetos |
| Embarques | Botão para expandir tabela de embarques vinculados |
| Trajetórias | Botão para expandir lista de trajetos |
| Ações | Botão ⚓ Atracado (visível apenas quando há embarques pendentes de atracação) |

**Sub-tabela de Embarques por Navio:**
Mostra embarques não finalizados (ordem < 6) com: Código, Cliente, Container/BL, ETA, Status badge.

**Botão ⚓ Atracado:**
- Visível quando o navio tem embarques com status anterior a "Atracado" (ordem < 3)
- Ao clicar: altera todos os embarques elegíveis para o status `Atracado (ATRC)`
- Registra histórico com observação referenciando nome e viagem do navio
- Funciona **bidirecionalmente**: caso o navio já tenha embarques Atracados e novos chegaram, marca todos os pendentes

---

## 9. Features — Administração

### 9.1 Cargos (`/cargos`)

CRUD simples de cargos de funcionários. Campos: Nome, Descrição, Ativo.

### 9.2 Níveis de Acesso (`/niveis-acesso`)

CRUD de hierarquia de acessos. Campos: Nome, Ordem, Descrição, Ativo.
A `ordem` define a hierarquia (menor = mais restrito, maior = mais privilegiado).

---

## 10. Fluxo Principal de Negócio

### Fluxo Completo de uma Importação

```
1. SOLICITAÇÃO DE ORÇAMENTO
   ├── Operador cria Solicitação (SOL-XXXX-NNN)
   │     • Status inicial: AguardandoCusto
   │     • Seleciona 1+ Despachantes
   │     • Pode anexar Packlist
   │
   ├── Sistema cria automaticamente para CADA despachante:
   │     • CustoDespachante (CD-XXXX-NNN) — status: AguardandoCusto
   │
   └── Sistema cria automaticamente:
         • OrcamentoVenda (OV-XXXX-NNN) — status: AguardandoDespachante

2. CUSTO DESPACHANTE
   ├── Despachante preenche wizard (4 etapas)
   │     Etapa 1: Dados gerais (FOB, CIF, câmbio, container)
   │     Etapa 2: Licenças de Importação (LIs)
   │     Etapa 3: Despesas (honorários, AFRMM, etc.)
   │     Etapa 4: NCMs com cálculo automático de tributos
   │
   ├── Salva com status: AguardandoCusto (rascunho)
   └── Finaliza com status: Finalizado

3. ORÇAMENTO DE VENDA
   ├── Operador preenche orçamento com base no custo do despachante
   ├── Vincula CustoDespachante(s) ao orçamento
   ├── Define despesas, extras, honorários
   ├── Finaliza → status: Finalizado
   └── Solicitação progride para: AguardandoAprovacaoCliente

4. APROVAÇÃO DO CLIENTE
   ├── Operador edita solicitação
   ├── Muda status: AguardandoAprovacaoCliente → Aprovada
   └── Sistema cria automaticamente:
         • EmbarqueAduana (EMB-XXXX-NNN) — status: Previsto

5. EMBARQUE — OPERAÇÃO
   ├── Status 1 — Previsto (PREV): embarque previsto, docs ao despachante
   ├── Status 2 — Aguardando (AGRD): aguardando no porto de origem
   ├── Status 3 — Atracado (ATRC): navio atracado no porto destino
   │     → Controlador de Navios pode marcar em lote via botão ⚓
   ├── Status 4 — Registrado (RGTD): DI registrada na Receita Federal
   ├── Status 5 — Desembaraçado (DSMB): mercadoria liberada
   ├── Status 6 — Entregue (ENTG): entregue ao cliente
   └── Status 7 — Finalizado (FNLZ): processo encerrado (NF emitida, pagamentos quitados)
```

### Status da Solicitação acompanha o Embarque

Quando o embarque muda de status, o status da solicitação é espelhado:

| Status Embarque | Status Solicitação |
|-----------------|-------------------|
| Previsto | EmbarquePrevisto |
| Aguardando | EmbarqueAguardando |
| Atracado | EmbarqueAtracado |
| Registrado | EmbarqueRegistrado |
| Desembaraçado | EmbarqueDesembaraçado |
| Entregue | EmbarqueEntregue |
| Finalizado | EmbarqueFinalizado |

---

## 11. Statuses e Ciclos de Vida

### `StatusSolicitacao`
```
Rascunho
  → Aberta
  → AguardandoCusto          ← status inicial ao criar
  → AguardandoOrcamentoVenda
  → AguardandoAprovacaoCliente
  → EmAnalise
  → Aprovada                 ← dispara criação de EmbarqueAduana
  → Cancelada
  → EmbarquePrevisto
  → EmbarqueAguardando
  → EmbarqueAtracado
  → EmbarqueRegistrado
  → EmbarqueDesembaraçado
  → EmbarqueEntregue
  → EmbarqueFinalizado
```

### `StatusCustoDespachante`
| Status | Cor | Significado |
|--------|-----|------------|
| `AguardandoCusto` | Âmbar `#f59e0b` | Aguardando preenchimento |
| `Rascunho` | Cinza `#64748b` | Editado mas não finalizado |
| `Finalizado` | Verde `#22c55e` | Custo aprovado e finalizado |

### `StatusEmbarque` (imutável — seed do sistema)
| Código | Nome | Ordem | Cor indicativa |
|--------|------|-------|---------------|
| PREV | Previsto | 1 | Azul claro |
| AGRD | Aguardando | 2 | Âmbar |
| ATRC | Atracado | 3 | Azul |
| RGTD | Registrado | 4 | Laranja |
| DSMB | Desembaraçado | 5 | Verde-amarelo |
| ENTG | Entregue | 6 | Verde |
| FNLZ | Finalizado | 7 | Verde escuro |

### `StatusSolicitacaoDespachante`
| Status | Significado |
|--------|------------|
| `PendenteDespachante` | Custo ainda não preenchido |
| `Respondido` | Custo preenchido pelo despachante |
| `FinalizadoDespachante` | Custo aprovado |
| `Recusado` | Despachante recusou |

### `OrcamentoVenda Status`
| Status | Significado |
|--------|------------|
| `Rascunho` | Em elaboração |
| `AguardandoDespachante` | Aguardando o custo |
| `AguardandoOrcamentoVenda` | Em processo de composição |
| `Finalizado` | Aprovado |

---

## 12. Cálculo de Impostos

Implementado em `ImpostoCalculatorService`. Cálculo por NCM Vinculado:

### Fórmulas

| Tributo | Fórmula | Observação |
|---------|---------|-----------|
| **II** | `base × aliII%` | Base = CIF em R$ |
| **IPI** | `(base + II) × aliIPI%` | Incide sobre base + II |
| **PIS** | `base × aliPIS%` | Sobre base original |
| **COFINS** | `base × aliCOFINS%` | Sobre base original |
| **ICMS** | `(base + II + IPI) × aliICMS%` | Incide sobre base + II + IPI |
| **Total** | `II + IPI + PIS + COFINS + ICMS` | — |

### Alíquotas típicas do seed de demo
| NCM | Produto | II | IPI | PIS | COFINS | ICMS |
|-----|---------|----|----|-----|--------|------|
| 85171400 | Smartphones | 20% | 15% | 2,10% | 9,65% | 18% |
| 84713000 | Laptops | 16% | 10% | 2,10% | 9,65% | 18% |
| 61099000 | Camisetas | 35% | 0% | 2,10% | 9,65% | 12% |
| 87089900 | Autopeças | 18% | 5% | 2,10% | 9,65% | 12% |
| 61051000 | Camisas | 35% | 0% | 2,10% | 9,65% | 12% |

### Flag `entraBaseIcms`
Despesas marcadas com `entraBaseIcms: true` entram na base de cálculo do ICMS. Controlado na etapa 3 do wizard do Custo Despachante.

---

## 13. Relacionamentos entre Entidades

```
SolicitacaoOrcamento (SOL)
  ├── 1:N → SolicitacaoOrcamentoDespachante
  │           └── N:1 → DespachanteV2
  ├── 1:N → SolicitacaoOrcamentoDocumento
  ├── 1:N → CustoDespachante (criado automaticamente por despachante)
  ├── 1:1 → OrcamentoVenda (criado automaticamente)
  └── 1:1 → EmbarqueAduana (criado ao Aprovar)

CustoDespachante (CD)
  ├── N:1 → DespachanteV2
  ├── N:1 → Importador
  ├── N:1 → PortoOrigem
  ├── N:1 → PortoDestino
  ├── 1:N → CustoDespachanteLi
  ├── 1:N → CustoDespachanteDespesa
  └── 1:N → NcmVinculadoOrcamento
                └── 1:1 → ValorImposto

OrcamentoVenda (OV)
  ├── N:1 → ClienteV2
  ├── N:1 → SolicitacaoOrcamento (opcional)
  ├── 1:N → OrcamentoVendaDespesa
  ├── 1:N → OrcamentoVendaDespesaExtra
  └── N:M → CustoDespachante (via OrcamentoVendaCusto)

EmbarqueAduana (EMB)
  ├── N:1 → ClienteV2
  ├── N:1 → DespachanteV2
  ├── N:1 → PortoOrigem
  ├── N:1 → PortoDestino
  ├── N:1 → AgenteCarga
  ├── N:1 → ControleNavio
  ├── N:1 → Exportador (opcional)
  ├── N:1 → StatusEmbarque (atual)
  ├── N:1 → CustoDespachante (opcional)
  ├── N:1 → OrcamentoVenda (opcional)
  ├── N:1 → SolicitacaoOrcamento (opcional)
  ├── 1:N → HistoricoStatusEmbarque
  ├── 1:N → FreeTimeEmbarque
  └── 1:N → PagamentoProcesso

ControleNavio
  └── 1:N → ControleNavioTrajeto
               ├── N:1 → PortoOrigem
               └── N:1 → PortoDestino

ModeloDespesa
  └── 1:N → ModeloDespesaItem
               └── N:1 → DespesaCadastro

Documento
  └── 1:N → DocumentoVinculo (polymorph → qualquer entidade)
```

---

## 14. Regras de Negócio

### Criação de Solicitação
1. **Obrigatório:** Porto Origem, Porto Destino, Data
2. **Obrigatório:** Ao menos 1 Despachante adicionado
3. **Automático:** Status inicial = `AguardandoCusto`
4. **Automático:** 1 CustoDespachante por despachante (se ainda não existe)
5. **Automático:** 1 OrcamentoVenda (se ainda não existe)
6. O responsável é preenchido automaticamente com o usuário logado

### Custo Despachante
1. Status padrão ao criar: `AguardandoCusto`
2. Status de rascunho para salvar sem finalizar: `AguardandoCusto`
3. Ao finalizar: status muda para `Finalizado`
4. Exclusão remove em cascata: LIs, Despesas, NCMs Vinculados, Valores de Imposto
5. Não é possível excluir um despachante de solicitação se já há custo gerado

### Orçamento de Venda
1. Total Geral = impostos + despesas + extras + honorários + frete
2. Exclusão remove em cascata: Despesas, Extras, Vínculos com Custos

### Aprovação → Embarque
1. Quando Solicitação vai de `AguardandoAprovacaoCliente` → `Aprovada`: cria `EmbarqueAduana` automaticamente
2. O embarque herda: portoOrigem, portoDestino, importador (como cliente), container, peso, despachante, Orçamento de Venda, CustoDespachante, Solicitação
3. Status inicial do embarque: `Previsto (PREV)`

### Status de Embarque
1. A mudança de status registra automaticamente no histórico com: usuário, data/hora, observação
2. `dataFim` do FreeTime é calculada automaticamente: `dataInicio + quantidadeDias`
3. Embarques com status `Entregue (ordem 6)` ou `Finalizado (ordem 7)` **não aparecem** no Controle de Navios
4. Embarques com status anterior a `Atracado (ordem 3)` são elegíveis para a ação em lote no Controle de Navios

### Controle de Navios
1. Exibe apenas navios com embarques em andamento (ordem < 6)
2. O botão ⚓ Atracado aparece apenas quando há embarques com ordem < 3
3. Ação ⚓ marca **todos** os embarques elegíveis (ordem < 3) do navio para Atracado em lote
4. Exclusão de navio remove em cascata seus trajetos

### Códigos Internos
Todos os códigos são gerados no padrão `PREFIX-AAAA-NNN`:
- `SOL-2026-001` — Solicitação de Orçamento
- `CD-2026-001` — Custo Despachante
- `OV-2026-001` — Orçamento de Venda
- `EMB-2026-001` — Embarque Aduana

### Delete em Cascata
| Entidade Pai | Remove em Cascata |
|-------------|-----------------|
| SolicitacaoOrcamento | → Despachantes, → Documentos |
| CustoDespachante | → LIs, → Despesas, → NCMs Vinculados, → Valores Imposto |
| OrcamentoVenda | → Despesas, → Extras, → Vínculos Custos |
| EmbarqueAduana | → Histórico Status, → FreeTimes, → Pagamentos |
| ControleNavio | → Trajetos |
| NcmVinculadoOrcamento | → ValoresImposto |

---

## 15. Seed de Dados Demo

O `SeedDemoService` popula o sistema com dados realistas para apresentação.

### Dados de Referência (base: Abril/2026)

**Portos de Origem (China)**
| Nome | Código |
|------|--------|
| Porto de Shanghai | SHA |
| Porto de Ningbo | NGB |
| Porto de Hong Kong | HKG |
| Porto de Qingdao | TAO |
| Porto de Guangzhou | GZH |

**Portos de Destino (Brasil)**
| Nome | Código | Estado |
|------|--------|--------|
| Porto de Santos | BRSSZ | SP |
| Porto de Paranaguá | BRPNG | PR |
| Porto de Itajaí | BRITJ | SC |
| Porto do Rio de Janeiro | BRRJO | RJ |
| Porto do Pecém | BRPCE | CE |

**Clientes/Importadores Demo**
- TechBrasil Importações Ltda (CNPJ: 12.345.678/0001-90)
- Têxtil Sul Comércio Exterior Ltda (CNPJ: 23.456.789/0001-01)
- AutoPeças Nacional Importações Ltda (CNPJ: 34.567.890/0001-12)
- MegaMart Distribuidora Nacional Ltda

**Despachantes Demo**
- Costa & Associados Despachos Aduaneiros (CRN: 1234)
- Logística Brasil Despachos Ltda (CRN: 5678)

**Navios Demo**
| Navio | Viagem | Rota |
|-------|--------|------|
| MSC Aurora | 2026-001 | Shanghai → Santos |
| COSCO Harmony | 2026-002 | Ningbo → Paranaguá |
| CMA Brésil | 2026-003 | Shanghai → Santos |

**Cenários de Embarque**
| Código | Status | Produto | Despachante |
|--------|--------|---------|------------|
| EMB-2026-001 | Finalizado | Smartphones | Costa & Associados |
| EMB-2026-002 | Entregue | Camisetas | Costa & Associados |
| ... (mais cenários) | | | |

**Controle do Seed:**
- Flag: `v2_demo_carregado` no localStorage
- Função `carregarSeedDemo()`: idempotente (verifica flag antes de carregar)
- Função `limparSeedDemo()`: remove todas as chaves do seed
- Acessível via Dashboard (botões de carregar/limpar demo)

---

## 16. Backend API (.NET 8)

O `import-costs-api` é o backend REST em .NET 8. Atualmente em desenvolvimento/produção paralela ao frontend localStorage.

### Features implementadas na API

| Domínio | Controller | Descrição |
|---------|-----------|-----------|
| `Aduanas` | — | Gestão de aduanas |
| `Aliquotas` | — | Tabelas de alíquotas |
| `Clientes` | — | CRUD de clientes |
| `Custos` | — | Custos de importação |
| `Despachantes` | — | CRUD de despachantes |
| `Funcionarios` | — | Gestão de funcionários |
| `Numerarios` | — | Numerários de processos |
| `Orcamentos` | — | Orçamentos |
| `Packlists` | — | Gestão de packlists |
| `Portos` | — | CRUD de portos |
| `TemplatesPacklist` | — | Templates de packlist |
| `Vendas` | — | Operações de venda |

**Controllers disponíveis:**
- `HealthController` — health check do serviço
- `ProductsController` — produtos (referência)

### Configuração
- **Desenvolvimento:** `https://localhost:7xxx` (ver `appsettings.Development.json`)
- **Produção:** configurado via FTP deploy (`deploy.ps1`)

### Estrutura
```
import-costs-api/
├── Controllers/         ← Endpoints REST
├── Core/
│   ├── Database/        ← Conexão e contexto
│   ├── Exceptions/      ← Tratamento de erros
│   ├── Extensions/      ← Extension methods
│   ├── Middleware/      ← Middleware custom
│   ├── Models/          ← DTOs compartilhados
│   └── Storage/         ← Azure Blob Storage
├── Domain/
│   ├── Entities/        ← Entidades do domínio
│   ├── Enums/           ← Enumerações
│   └── ValueObjects/    ← Value Objects
└── Features/            ← CQRS por domínio (Commands/Queries)
```

---

## Apêndice A — Geração de Códigos

Todos os identificadores humanos são gerados com a função:
```typescript
generateCode(prefix: string, existingCount: number): string {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(3, '0');
  return `${prefix}-${year}-${seq}`;
}
```

Exemplos: `SOL-2026-001`, `CD-2026-042`, `EMB-2026-007`

---

## Apêndice B — Autenticação

- Implementada em `features/auth/`
- Guards: `authGuard` (requer login) e `guestGuard` (redireciona logados)
- Usuário logado: `AuthService.currentUser` com `username` e `role`
- O responsável nas entidades é preenchido automaticamente pelo `auth.currentUser?.username`

---

## Apêndice C — FreeTime — Lógica de Alertas

O serviço `EmbarqueAduanaService.diasRestantesFreeTime()` calcula:
```typescript
diasRestantes = Math.ceil((dataFim - hoje) / ms_por_dia)
```
- **Negativo** → free time vencido → badge vermelho `badge-alert`
- **Positivo** → free time ativo → badge verde `badge-ok`

---

## Apêndice D — Padrão de Componente CRUD

Todos os cadastros seguem o mesmo padrão:

```typescript
// Propriedades padrão
items: EntidadeX[] = [];
showForm = false;
editando: EntidadeX | null = null;
q = '';           // busca
showErr = false;

// Ciclo de vida
ngOnInit() → carregar()
carregar()  → service.getAll()
filtered    → items filtrado por q

// Ações
openForm(item?)  → abre formulário (novo ou editar)
salvar()         → valida, cria ou atualiza, fecha form
remover(id)      → confirm + service.remove(id)
```

---

*Documento gerado em: 16/04/2026*  
*Sistema: Aduana V2 — Import Costs*
