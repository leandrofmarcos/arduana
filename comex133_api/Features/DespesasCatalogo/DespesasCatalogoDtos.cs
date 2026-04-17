namespace Comex133Api.Features.DespesasCatalogo;

public static class CategoriaDespesa
{
    public const string AgenciaMaritima = "Agência Marítima";
    public const string Despachante     = "Despachante";
    public const string Tributos        = "Tributos";
    public const string Portos          = "Portos";
    public const string OutrasDespesas  = "Outras Despesas";

    public static readonly string[] Todos =
    [
        AgenciaMaritima, Despachante, Tributos, Portos, OutrasDespesas
    ];
}

public record DespesaCatalogoDto(
    int Id,
    string Descricao,
    decimal Valor,
    string Categoria,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateDespesaCatalogoRequest(
    string Descricao,
    decimal Valor,
    string Categoria
);

public record UpdateDespesaCatalogoRequest(
    string Descricao,
    decimal Valor,
    string Categoria
);

public record AtivoRequest(bool Ativo);
