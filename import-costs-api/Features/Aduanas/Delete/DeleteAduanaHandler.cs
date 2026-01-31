namespace ImportCostsApi.Features.Aduanas.Delete;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for deleting an Aduana
/// </summary>
public class DeleteAduanaHandler
{
    private readonly AduanaRepository _repository;
    private readonly ILogger<DeleteAduanaHandler> _logger;

    public DeleteAduanaHandler(AduanaRepository repository, ILogger<DeleteAduanaHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task HandleAsync(string orcamentoId)
    {
        _logger.LogInformation("Deleting Aduana for Orcamento: {OrcamentoId}", orcamentoId);

        var aduana = await _repository.GetByOrcamentoIdAsync(orcamentoId);
        if (aduana == null)
            throw new NotFoundException("Aduana para Orcamento", orcamentoId);

        await _repository.DeleteAsync(aduana.Id);

        _logger.LogInformation("Aduana deleted successfully: {Id}", aduana.Id);
    }
}
