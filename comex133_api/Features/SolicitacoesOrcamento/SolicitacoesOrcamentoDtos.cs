namespace Comex133Api.Features.SolicitacoesOrcamento;

public record SolicitacaoOrcamentoDto(
    int Id,
    string CodigoInterno,
    int? ClienteId,
    int? ImportadorId,
    int PortoOrigemId,
    int PortoDestinoId,
    string Responsavel,
    string TamContainer,
    decimal Peso,
    string? Observacao,
    string Status,
    DateTime Data,
    DateTime CriadoEm,
    DateTime AtualizadoEm,
    int TotalDespachantes,
    int TotalDocumentos
);

public record SolicitacaoOrcamentoDespachanteDto(
    int Id,
    int SolicitacaoOrcamentoId,
    int DespachanteId,
    string Status,
    DateTime DataEnvio,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record SolicitacaoOrcamentoDocumentoDto(
    int Id,
    int SolicitacaoOrcamentoId,
    string NomeArquivo,
    string LinkDocumento,
    DateTime DataUpload,
    string? Observacao,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateSolicitacaoOrcamentoRequest(
    int? ClienteId,
    int? ImportadorId,
    int PortoOrigemId,
    int PortoDestinoId,
    string Responsavel,
    string TamContainer,
    decimal Peso,
    string? Observacao,
    string Status,
    DateTime Data
);

public record UpdateSolicitacaoOrcamentoRequest(
    int? ClienteId,
    int? ImportadorId,
    int PortoOrigemId,
    int PortoDestinoId,
    string Responsavel,
    string TamContainer,
    decimal Peso,
    string? Observacao,
    string Status,
    DateTime Data
);

public record UpdateSolicitacaoOrcamentoStatusRequest(string Status);

public record AddSolicitacaoDespachanteRequest(
    int DespachanteId,
    string Status,
    DateTime DataEnvio
);

public record AddSolicitacaoDocumentoRequest(
    string NomeArquivo,
    string LinkDocumento,
    DateTime DataUpload,
    string? Observacao
);
