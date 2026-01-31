namespace ImportCostsApi.Features.Vendas.Delete;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for deleting a Venda
/// </summary>
public class DeleteVendaHandler
{
    private readonly VendaRepository _repository;
    private readonly ILogger<DeleteVendaHandler> _logger;

    public DeleteVendaHandler(VendaRepository repository, ILogger<DeleteVendaHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task HandleAsync(string orcamentoId)
    {
        _logger.LogInformation("Deleting Venda for Orcamento: {OrcamentoId}", orcamentoId);

        var venda = await _repository.GetByOrcamentoIdAsync(orcamentoId);
        if (venda == null)
            throw new NotFoundException("Venda para Orcamento", orcamentoId);

        await _repository.DeleteAsync(venda.Id);

        _logger.LogInformation("Venda deleted successfully: {Id}", venda.Id);
    }
}
