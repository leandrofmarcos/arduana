namespace ImportCostsApi.Features.Numerarios.Delete;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Handler for deleting a Numerario Lancamento
/// </summary>
public class DeleteNumerarioHandler
{
    private readonly NumerarioRepository _repository;
    private readonly ILogger<DeleteNumerarioHandler> _logger;

    public DeleteNumerarioHandler(NumerarioRepository repository, ILogger<DeleteNumerarioHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task HandleAsync(string id)
    {
        _logger.LogInformation("Deleting Numerario Lancamento: {Id}", id);

        var lancamento = await _repository.GetByIdAsync(id);
        if (lancamento == null)
            throw new NotFoundException("Numerario Lancamento", id);

        await _repository.DeleteAsync(id);

        _logger.LogInformation("Numerario Lancamento deleted successfully: {Id}", id);
    }
}
