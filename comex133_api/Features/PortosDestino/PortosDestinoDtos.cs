namespace Comex133Api.Features.PortosDestino;

public record PortoDestinoDto(
    int Id,
    string Nome,
    string Codigo,
    string? Estado,
    string Pais,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreatePortoDestinoRequest(
    string Nome,
    string Codigo,
    string? Estado,
    string Pais
);

public record UpdatePortoDestinoRequest(
    string Nome,
    string Codigo,
    string? Estado,
    string Pais
);

public record AtivoRequest(bool Ativo);
