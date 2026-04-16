namespace Comex133Api.Features.Parametros;

public record ParametroDto(
    int Id,
    string Chave,
    string Valor,
    string? Descricao,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateParametroRequest(
    string Chave,
    string Valor,
    string? Descricao
);

public record UpdateParametroRequest(
    string Chave,
    string Valor,
    string? Descricao
);
