namespace ImportCostsApi.Features.Custos.GetByOrcamento;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for retrieving Custo by Orcamento ID
/// </summary>
public class GetCustoByOrcamentoHandler
{
    private readonly CustoRepository _repository;
    private readonly ILogger<GetCustoByOrcamentoHandler> _logger;

    public GetCustoByOrcamentoHandler(CustoRepository repository, ILogger<GetCustoByOrcamentoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<CustoResponseDto> HandleAsync(string orcamentoId)
    {
        _logger.LogInformation("Getting Custo for Orcamento: {OrcamentoId}", orcamentoId);

        if (!await _repository.OrcamentoExistsAsync(orcamentoId))
            throw new NotFoundException("Orcamento", orcamentoId);

        var custo = await _repository.GetByOrcamentoIdAsync(orcamentoId);
        if (custo == null)
            throw new NotFoundException("Custo para Orcamento", orcamentoId);

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
