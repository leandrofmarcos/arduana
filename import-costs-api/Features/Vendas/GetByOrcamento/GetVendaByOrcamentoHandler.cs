namespace ImportCostsApi.Features.Vendas.GetByOrcamento;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for retrieving Venda by Orcamento ID
/// </summary>
public class GetVendaByOrcamentoHandler
{
    private readonly VendaRepository _repository;
    private readonly ILogger<GetVendaByOrcamentoHandler> _logger;

    public GetVendaByOrcamentoHandler(VendaRepository repository, ILogger<GetVendaByOrcamentoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<VendaResponseDto> HandleAsync(string orcamentoId)
    {
        _logger.LogInformation("Getting Venda for Orcamento: {OrcamentoId}", orcamentoId);

        if (!await _repository.OrcamentoExistsAsync(orcamentoId))
            throw new NotFoundException("Orcamento", orcamentoId);

        var venda = await _repository.GetByOrcamentoIdAsync(orcamentoId);
        if (venda == null)
            throw new NotFoundException("Venda para Orcamento", orcamentoId);

        return MapToVendaResponseDto(venda);
    }

    private VendaResponseDto MapToVendaResponseDto(Venda venda)
    {
        return new VendaResponseDto
        {
            Id = venda.Id,
            OrcamentoId = venda.OrcamentoId,
            Codigo = venda.Codigo,
            Cliente = venda.Cliente,
            Despachante = venda.Despachante,
            CriadoEm = venda.CriadoEm,
            Premissas = venda.Premissas,
            CustoReferencia = venda.CustoReferencia,
            Taxas = venda.Taxas,
            Premissasdelha = venda.Premissasdelha,
            Resumo = venda.Resumo,
            Status = venda.Status
        };
    }
}
