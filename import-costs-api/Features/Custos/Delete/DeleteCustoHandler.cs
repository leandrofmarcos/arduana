namespace ImportCostsApi.Features.Custos.Delete;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for deleting a Custo
/// </summary>
public class DeleteCustoHandler
{
    private readonly CustoRepository _repository;
    private readonly ILogger<DeleteCustoHandler> _logger;

    public DeleteCustoHandler(CustoRepository repository, ILogger<DeleteCustoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task HandleAsync(string orcamentoId)
    {
        _logger.LogInformation("Deleting Custo for Orcamento: {OrcamentoId}", orcamentoId);

        var custo = await _repository.GetByOrcamentoIdAsync(orcamentoId);
        if (custo == null)
            throw new NotFoundException("Custo para Orcamento", orcamentoId);

        await _repository.DeleteAsync(custo.Id);

        _logger.LogInformation("Custo deleted successfully: {Id}", custo.Id);
    }
}
