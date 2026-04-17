namespace Comex133Api.Features.Clientes;

public record ClienteDto(
    int Id,
    string RazaoSocial,
    string? Cnpj,
    string? Email,
    string? Telefone,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateClienteRequest(
    string RazaoSocial,
    string? Cnpj,
    string? Email,
    string? Telefone
);

public record UpdateClienteRequest(
    string RazaoSocial,
    string? Cnpj,
    string? Email,
    string? Telefone
);

public record AtivoRequest(bool Ativo);
