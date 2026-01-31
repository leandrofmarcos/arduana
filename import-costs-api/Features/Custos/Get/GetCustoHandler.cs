namespace ImportCostsApi.Features.Custos.Get;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for retrieving a single Custo by ID
/// </summary>
public class GetCustoHandler
{
    private readonly CustoRepository _repository;
    private readonly ILogger<GetCustoHandler> _logger;

    public GetCustoHandler(CustoRepository repository, ILogger<GetCustoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<CustoResponseDto> HandleAsync(string id)
    {
        _logger.LogInformation("Getting Custo with ID: {Id}", id);

        var custo = await _repository.GetByIdAsync(id);
        if (custo == null)
            throw new NotFoundException("Custo", id);

        return MapToCustoResponseDto(custo);
    }

    private CustoResponseDto MapToCustoResponseDto(Custo custo)
    {
        return new CustoResponseDto
        {
            Id = custo.Id,
            OrcamentoId = custo.OrcamentoId,
            Codigo = custo.Codigo,
            Cliente = custo.Cliente,
            Despachante = custo.Despachante,
            CriadoEm = custo.CriadoEm,
            Premissas = custo.Premissas,
            Taxas = custo.Taxas,
            Resumo = custo.Resumo,
            Despesas = custo.Despesas.Select(d => new DespesaDto
            {
                Id = d.Id,
                Categoria = d.Categoria,
                Item = d.Item,
                Fornecedor = d.Fornecedor,
                Valor = d.Valor,
                Observacao = d.Observacao
            }).ToList(),
            Status = custo.Status
        };
    }
}
