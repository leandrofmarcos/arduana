namespace Comex133Api.Features.Despachantes;

public record DespachantDto(
    int Id,
    string Nome,
    string? Crn,
    string? Email,
    string? Telefone,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateDespachantRequest(
    string Nome,
    string? Crn,
    string? Email,
    string? Telefone
);

public record UpdateDespachantRequest(
    string Nome,
    string? Crn,
    string? Email,
    string? Telefone
);

public record AtivoRequest(bool Ativo);
