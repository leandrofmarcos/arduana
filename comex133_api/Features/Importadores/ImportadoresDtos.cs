namespace Comex133Api.Features.Importadores;

public record ImportadorDto(
    int Id,
    string RazaoSocial,
    string? Cnpj,
    string? Email,
    string? Telefone,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateImportadorRequest(
    string RazaoSocial,
    string? Cnpj,
    string? Email,
    string? Telefone
);

public record UpdateImportadorRequest(
    string RazaoSocial,
    string? Cnpj,
    string? Email,
    string? Telefone
);

public record AtivoRequest(bool Ativo);
