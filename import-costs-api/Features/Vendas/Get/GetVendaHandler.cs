namespace ImportCostsApi.Features.Vendas.Get;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for retrieving a single Venda by ID
/// </summary>
public class GetVendaHandler
{
    private readonly VendaRepository _repository;
    private readonly ILogger<GetVendaHandler> _logger;

    public GetVendaHandler(VendaRepository repository, ILogger<GetVendaHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<VendaResponseDto> HandleAsync(string id)
    {
        _logger.LogInformation("Getting Venda with ID: {Id}", id);

        var venda = await _repository.GetByIdAsync(id);
        if (venda == null)
            throw new NotFoundException("Venda", id);

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
