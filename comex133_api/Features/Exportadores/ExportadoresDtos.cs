namespace Comex133Api.Features.Exportadores;

public record ExportadorDto(
    int Id,
    string Nome,
    string? Documento,
    string Pais,
    string? Cidade,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateExportadorRequest(
    string Nome,
    string? Documento,
    string Pais,
    string? Cidade
);

public record UpdateExportadorRequest(
    string Nome,
    string? Documento,
    string Pais,
    string? Cidade
);

public record AtivoRequest(bool Ativo);
