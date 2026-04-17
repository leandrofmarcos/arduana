namespace Comex133Api.Features.PortosOrigem;

public record PortoOrigemDto(
    int Id,
    string Nome,
    string Codigo,
    string Pais,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreatePortoOrigemRequest(
    string Nome,
    string Codigo,
    string Pais
);

public record UpdatePortoOrigemRequest(
    string Nome,
    string Codigo,
    string Pais
);

public record AtivoRequest(bool Ativo);
