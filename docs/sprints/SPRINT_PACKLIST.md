# Sprint — Packlist: Upload, Mapeamento de Colunas e Visualização

**Criado em:** 2026-05-13  
**Branch sugerida:** `feat/packlist-upload-mapeamento`  
**Status Geral:** 🟡 Em planejamento

---

## Objetivo da Sprint

Permitir que o usuário faça upload de um arquivo de packlist (`.csv` ou `.xlsx`) durante o cadastro de uma Solicitação de Orçamento e, por meio de um assistente visual simples, mapeie as colunas relevantes para a aplicação (NCM, Descrição e Preço). A aplicação persiste os dados mapeados em uma tabela interna, preserva o arquivo original e exibe apenas as colunas mapeadas na aba de packlist da tela de Despachante.

---

## Contexto e Regras de Negócio

- O arquivo de packlist **não tem formato padronizado** — cada cliente pode enviar com cabeçalhos diferentes.
- O **assistente de mapeamento** apresenta as colunas detectadas no arquivo e permite ao usuário indicar qual coluna representa NCM, Descrição e Preço.
- O mapeamento é **opcional** por campo: o usuário pode mapear apenas os campos que existirem no arquivo.
- Após o mapeamento, a aplicação importa **todas as linhas** do arquivo para a tabela `PacklistItem`, marcando quais colunas correspondem aos campos mapeados.
- O **arquivo original** (`.csv` / `.xlsx`) é preservado para download.
- Se o arquivo contiver **colunas mescladas** (merge de células detectado no Excel), a aplicação **bloqueia o import** e orienta o usuário a corrigir antes de tentar novamente.
- Na tela de Despachante (aba **Packlist**), somente as colunas mapeadas são exibidas na listagem; o arquivo original fica disponível para download.

### Campos mapeáveis nesta sprint (v1)

| Campo | Descrição |
|-------|-----------|
| `ncm` | Código NCM do produto |
| `descricao` | Descrição do produto |
| `preco` | Preço unitário ou total do item |

---

## Visão Geral das Fases

```
Fase 1 — Protótipo (frontend, sem API)
    └─ Aprovação visual e UX do assistente de mapeamento

Fase 2 — Modelagem de Dados e Backend
    └─ Tabelas, endpoints, upload de arquivo real

Fase 3 — Integração Frontend ↔ API
    └─ Substituir mock por chamadas reais

Fase 4 — Validações, Polimento e Testes
    └─ Células mescladas, erros, download, cobertura
```

---

## Fase 1 — Protótipo Frontend (Aprovação de UX)

> **Meta:** construir toda a experiência visual do upload + assistente usando dados em memória (sem API). Ao final desta fase, o fluxo completo deve ser aprovado antes de qualquer trabalho de backend.

### Atividades

| # | Atividade | Estimativa | Status |
|---|-----------|------------|--------|
| 1.1 | Criar componente `PacklistUploadComponent` na feature `solicitacao-orcamento` | 30 min | ✅ |
| 1.2 | Implementar leitura de arquivo `.csv` e `.xlsx` em memória (biblioteca `xlsx` já presente) | 45 min | ✅ |
| 1.3 | Detectar cabeçalho e colunas do arquivo (primeira linha não vazia) | 20 min | ✅ |
| 1.4 | Detectar células mescladas (atributo `!merges` do SheetJS) e exibir alerta bloqueante | 30 min | ✅ |
| 1.5 | Criar `PacklistAssistenteComponent` — modal/wizard step-by-step de mapeamento | 60 min | ✅ |
| 1.6 | Passo 1 do assistente: exibir prévia das primeiras 5 linhas do arquivo | 20 min | ✅ |
| 1.7 | Passo 2 do assistente: selects para mapear NCM / Descrição / Preço por coluna detectada | 30 min | ✅ |
| 1.8 | Passo 3 do assistente: confirmação com prévia dos dados mapeados | 20 min | ✅ |
| 1.9 | Armazenar resultado do mapeamento em memória (mock `PacklistUploadResult`) | 15 min | ✅ |
| 1.10 | Integrar `PacklistUploadComponent` no formulário de `SolicitacaoOrcamento` (seção documentos) | 20 min | ✅ |
| 1.11 | Criar aba **Packlist** no componente de Despachante, listando mock das colunas mapeadas | 45 min | ✅ |
| 1.12 | Botão de download do arquivo original (mock: reexibe arquivo lido) | 15 min | ✅ |

**Total estimado Fase 1:** ~350 min (~6h)

---

### Modelos de dados do protótipo (frontend, em memória)

```typescript
// Resultado do parse do arquivo antes do mapeamento
export interface PacklistArquivoParsed {
  nomeArquivo: string;
  extensao: 'csv' | 'xlsx';
  colunas: string[];             // nomes dos cabeçalhos detectados
  linhas: Record<string, any>[]; // todas as linhas como key-value
  temCelulasMescladas: boolean;
}

// Mapeamento de colunas definido pelo usuário
export interface PacklistMapeamento {
  colunaNCM?: string;        // nome da coluna no arquivo que representa NCM
  colunaDescricao?: string;  // nome da coluna no arquivo que representa Descrição
  colunaPreco?: string;      // nome da coluna no arquivo que representa Preço
}

// Item individual já importado com colunas mapeadas identificadas
export interface PacklistItem {
  id: string;
  solicitacaoOrcamentoId: string;
  dadosOriginais: Record<string, any>; // todas as colunas do arquivo
  ncm?: string;
  descricao?: string;
  preco?: number;
}

// Resultado final após mapeamento + import
export interface PacklistUploadResult {
  solicitacaoOrcamentoId: string;
  nomeArquivoOriginal: string;
  mapeamento: PacklistMapeamento;
  itens: PacklistItem[];
  totalLinhas: number;
  dataUpload: string; // ISO
}
```

---

### Fluxo do assistente (UX esperada)

```
[Usuário clica em "Anexar Packlist"]
        │
        ▼
[Área de drag-and-drop / seleção de arquivo .csv ou .xlsx]
        │
        ├─ Células mescladas detectadas?
        │       └─ SIM → alerta: "Arquivo contém células mescladas. Corrija e tente novamente."
        │                         [Cancelar] [Baixar arquivo para corrigir]
        │
        └─ NÃO → Prosseguir para o assistente
                        │
                        ▼
              ╔═══════════════════════════════╗
              ║  ASSISTENTE DE MAPEAMENTO     ║
              ╠═══════════════════════════════╣
              ║  Passo 1 — Prévia             ║
              ║  Exibe tabela com as 5        ║
              ║  primeiras linhas do arquivo  ║
              ║  [Voltar]   [Próximo →]       ║
              ╠═══════════════════════════════╣
              ║  Passo 2 — Mapeamento         ║
              ║  NCM:       [Selecione coluna]║
              ║  Descrição: [Selecione coluna]║
              ║  Preço:     [Selecione coluna]║
              ║  (todos opcionais)            ║
              ║  [← Voltar]  [Próximo →]      ║
              ╠═══════════════════════════════╣
              ║  Passo 3 — Confirmação        ║
              ║  Prévia com colunas mapeadas  ║
              ║  destacadas                   ║
              ║  "X linhas serão importadas"  ║
              ║  [← Voltar]  [Confirmar ✓]   ║
              ╚═══════════════════════════════╝
                        │
                        ▼
              [Packlist salvo com sucesso]
              Badge na solicitação: "📦 Packlist (42 itens)"
```

---

## Fase 2 — Modelagem de Dados e Backend

> **Pré-requisito:** aprovação da UX da Fase 1.

### Atividades

| # | Atividade | Estimativa | Status |
|---|-----------|------------|--------|
| 2.1 | Criar entidade `Packlist` (metadados do arquivo + mapeamento) | 20 min | ⬜ |
| 2.2 | Criar entidade `PacklistItem` (linhas importadas) | 20 min | ⬜ |
| 2.3 | Criar entidade `PacklistColunaMapeada` (referência coluna → campo esperado) | 20 min | ⬜ |
| 2.4 | Adicionar migrations e atualizar `AppDbContext` | 20 min | ⬜ |
| 2.5 | Criar `PacklistService` com métodos: upload, salvar mapeamento, listar itens | 45 min | ⬜ |
| 2.6 | Criar `PacklistController` com endpoints (ver tabela abaixo) | 30 min | ⬜ |
| 2.7 | Implementar parser CSV/XLSX no backend (detecção de merge, leitura de linhas) | 60 min | ⬜ |
| 2.8 | Integrar com sistema de storage de arquivos existente (salvar arquivo original) | 30 min | ⬜ |
| 2.9 | DTOs + Validators com FluentValidation | 20 min | ⬜ |

**Total estimado Fase 2:** ~265 min (~4h30)

---

### Modelagem de banco de dados

```sql
-- Registro de upload + mapeamento de colunas
CREATE TABLE Packlist (
    Id               UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SolicitacaoId    UNIQUEIDENTIFIER NOT NULL REFERENCES SolicitacaoOrcamento(Id),
    NomeArquivo      NVARCHAR(255) NOT NULL,
    ExtensaoArquivo  NVARCHAR(10)  NOT NULL,  -- 'csv' | 'xlsx'
    CaminhoArquivo   NVARCHAR(500) NOT NULL,  -- path no storage
    TotalLinhas      INT           NOT NULL,
    ColunaNCM        NVARCHAR(100),           -- nome da coluna no arquivo original
    ColunaDescricao  NVARCHAR(100),
    ColunaPreco      NVARCHAR(100),
    DataUpload       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    UploadPorUsuarioId UNIQUEIDENTIFIER REFERENCES Usuarios(Id)
);

-- Itens individuais do packlist
CREATE TABLE PacklistItem (
    Id           UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PacklistId   UNIQUEIDENTIFIER NOT NULL REFERENCES Packlist(Id) ON DELETE CASCADE,
    NumeroLinha  INT NOT NULL,
    DadosJson    NVARCHAR(MAX) NOT NULL,  -- todas as colunas da linha em JSON
    NCM          NVARCHAR(20),
    Descricao    NVARCHAR(500),
    Preco        DECIMAL(18,4),
    INDEX IX_PacklistItem_PacklistId (PacklistId)
);
```

> **Nota:** `DadosJson` preserva **todas** as colunas originais da linha, garantindo fidelidade ao arquivo original sem perda de dados não mapeados.

---

### Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/packlist/upload` | Recebe multipart: arquivo + `solicitacaoId`. Valida merges. Retorna colunas detectadas. |
| `POST` | `/api/packlist/{id}/mapeamento` | Salva o mapeamento de colunas e dispara o import das linhas. |
| `GET` | `/api/packlist/{solicitacaoId}` | Retorna metadados + mapeamento do packlist da solicitação. |
| `GET` | `/api/packlist/{id}/itens` | Lista `PacklistItem` (paginado). Suporte a filtro por NCM. |
| `GET` | `/api/packlist/{id}/arquivo` | Faz download do arquivo original. |
| `DELETE` | `/api/packlist/{id}` | Remove packlist e todos os itens (admin). |

---

## Fase 3 — Integração Frontend ↔ API

> **Pré-requisito:** endpoints da Fase 2 funcionando.

### Atividades

| # | Atividade | Estimativa | Status |
|---|-----------|------------|--------|
| 3.1 | Criar `PacklistService` no Angular com todos os métodos HTTP | 30 min | ⬜ |
| 3.2 | `PacklistUploadComponent`: substituir mock por `POST /api/packlist/upload` | 20 min | ⬜ |
| 3.3 | Assistente — Passo 3: chamar `POST /api/packlist/{id}/mapeamento` ao confirmar | 20 min | ⬜ |
| 3.4 | Aba Packlist no Despachante: carregar itens via `GET /api/packlist/{id}/itens` | 30 min | ⬜ |
| 3.5 | Botão de download: chamar `GET /api/packlist/{id}/arquivo` e abrir blob | 20 min | ⬜ |
| 3.6 | Exibir badge "📦 Packlist (N itens)" no card da Solicitação | 15 min | ⬜ |
| 3.7 | Tratar retorno de erro de células mescladas (HTTP 422 → exibir mensagem orientativa) | 15 min | ⬜ |

**Total estimado Fase 3:** ~150 min (~2h30)

---

## Fase 4 — Validações, Polimento e Testes

### Atividades

| # | Atividade | Estimativa | Status |
|---|-----------|------------|--------|
| 4.1 | Validação de tamanho máximo de arquivo (ex: 10 MB) no frontend e backend | 15 min | ⬜ |
| 4.2 | Validação de extensão no upload (bloquear arquivos que não sejam `.csv`/`.xlsx`) | 10 min | ⬜ |
| 4.3 | Mensagem de orientação específica quando células mescladas detectadas (com print de exemplo) | 20 min | ⬜ |
| 4.4 | Permitir remapear colunas caso mapeamento já exista (re-executar assistente) | 30 min | ⬜ |
| 4.5 | Paginação na listagem de itens do packlist na aba do Despachante | 20 min | ⬜ |
| 4.6 | Teste de fluxo completo: upload CSV → mapeamento → visualização → download | 20 min | ⬜ |
| 4.7 | Teste de fluxo completo: upload XLSX com merge → bloqueio → orientação | 15 min | ⬜ |
| 4.8 | Revisar seed demo: adicionar exemplo de solicitação com packlist mockado | 20 min | ⬜ |

**Total estimado Fase 4:** ~150 min (~2h30)

---

## Resumo de Estimativas

| Fase | Descrição | Estimativa |
|------|-----------|------------|
| Fase 1 | Protótipo Frontend (aprovação UX) | ~6h |
| Fase 2 | Backend + Banco de Dados | ~4h30 |
| Fase 3 | Integração Frontend ↔ API | ~2h30 |
| Fase 4 | Validações, Polimento e Testes | ~2h30 |
| **Total** | | **~15h30** |

---

## Posição Atual

```
Fase 1 ──────── Fase 2 ──────── Fase 3 ──────── Fase 4
  ✅               ⬜               ⬜               ⬜
[Protótipo]    [Backend]     [Integração]    [Polimento]
   (12/12)       (0/9)          (0/7)           (0/8)
```

**12 de 36 atividades concluídas (33%)**

---

## Log de Progresso

| Data | Fase | Ação |
|------|------|------|
| 2026-05-13 | — | Sprint criado e aguardando aprovação |
| 2026-05-13 | Fase 1 | Fase 1 concluída — build limpo, 0 erros |

---

## Notas Técnicas

- Biblioteca `xlsx` (SheetJS) já está no projeto — usá-la tanto no frontend quanto avaliar uso no backend (via NuGet `DocumentFormat.OpenXml` para XLSX, `CsvHelper` para CSV).
- `DadosJson` em `PacklistItem` usa `NVARCHAR(MAX)` — avaliar se `JSONB` ou equivalente é preferível ao migrar para produção.
- O mapeamento fica em `Packlist` (colunas `ColunaNCM`, `ColunaDescricao`, `ColunaPreco`) — simples e suficiente para v1. Futuras versões podem extrair para tabela `PacklistColunaMapeada` se precisar de N campos mapeáveis.
- A Fase 1 deliberadamente não usa API para permitir iteração rápida de UX. A aprovação da Fase 1 é **gate** para iniciar a Fase 2.
- Rota angular sugerida: packlist gerenciado dentro da feature `solicitacao-orcamento` — não cria rota própria nesta sprint.
