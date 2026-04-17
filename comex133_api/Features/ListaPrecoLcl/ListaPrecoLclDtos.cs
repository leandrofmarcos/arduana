namespace Comex133Api.Features.ListaPrecoLcl;

public record ListaPrecoLclDto(
    int Id,
    string Categoria,
    string Descricao,
    string? NomeChines,
    decimal PrecoUsdPorCbm,
    decimal PrecoUsdPorKg,
    DateTime DataVigencia,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateListaPrecoLclRequest(
    string Categoria,
    string Descricao,
    string? NomeChines,
    decimal PrecoUsdPorCbm,
    decimal PrecoUsdPorKg,
    DateTime DataVigencia
);

public record UpdateListaPrecoLclRequest(
    string Categoria,
    string Descricao,
    string? NomeChines,
    decimal PrecoUsdPorCbm,
    decimal PrecoUsdPorKg,
    DateTime DataVigencia
);

public record AtivoRequest(bool Ativo);
