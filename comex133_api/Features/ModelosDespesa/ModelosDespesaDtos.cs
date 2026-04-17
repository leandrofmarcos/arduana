namespace Comex133Api.Features.ModelosDespesa;

public record ModeloDespesaDto(
    int Id,
    string Nome,
    string? Descricao,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record ModeloDespesaDetalheDto(
    int Id,
    string Nome,
    string? Descricao,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm,
    IEnumerable<ModeloDespesaItemDto> Itens
);

public record ModeloDespesaItemDto(
    int DespesaCatalogoId,
    string Descricao,
    decimal Valor,
    string Categoria,
    DateTime AdicionadoEm
);

public record CreateModeloDespesaRequest(
    string Nome,
    string? Descricao
);

public record UpdateModeloDespesaRequest(
    string Nome,
    string? Descricao
);

public record AddItemRequest(int DespesaCatalogoId);

public record AtivoRequest(bool Ativo);
