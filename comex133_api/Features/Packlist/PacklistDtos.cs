namespace Comex133Api.Features.Packlist;

// ── Passo 1: resposta após upload ────────────────────────────────────────────

public record UploadPacklistResponse(
    int PacklistId,
    string NomeArquivo,
    bool TemCelulasMescladas,
    IReadOnlyList<string> Colunas,
    int TotalLinhas
);

// ── Passo 2: requisição de mapeamento ────────────────────────────────────────

public record SaveMapeamentoRequest(
    string? ColunaNCM,
    string? ColunaDescricao,
    string? ColunaPreco
);

// ── Metadados do packlist ────────────────────────────────────────────────────

public record PacklistDto(
    int Id,
    int SolicitacaoOrcamentoId,
    string NomeArquivo,
    string ExtensaoArquivo,
    int TotalLinhas,
    string? ColunaNCM,
    string? ColunaDescricao,
    string? ColunaPreco,
    bool TemCelulasMescladas,
    DateTime DataUpload,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

// ── Item individual ──────────────────────────────────────────────────────────

public record PacklistItemDto(
    int Id,
    int NumeroLinha,
    string DadosJson,
    string? NCM,
    string? Descricao,
    decimal? Preco
);
