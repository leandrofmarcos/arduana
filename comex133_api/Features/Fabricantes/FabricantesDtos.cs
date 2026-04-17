namespace Comex133Api.Features.Fabricantes;

public record FabricanteDto(
    int Id,
    string Nome,
    string Pais,
    string? Cidade,
    string? Contato,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateFabricanteRequest(
    string Nome,
    string Pais,
    string? Cidade,
    string? Contato
);

public record UpdateFabricanteRequest(
    string Nome,
    string Pais,
    string? Cidade,
    string? Contato
);

public record AtivoRequest(bool Ativo);
