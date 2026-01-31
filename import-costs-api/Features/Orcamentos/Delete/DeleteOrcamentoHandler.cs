namespace ImportCostsApi.Features.Orcamentos.Delete;

using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Features.Orcamentos;

/// <summary>
/// Handler para deletar um orçamento
/// </summary>
public class DeleteOrcamentoHandler
{
    private readonly OrcamentoRepository _repository;
    private readonly ILogger<DeleteOrcamentoHandler> _logger;

    public DeleteOrcamentoHandler(OrcamentoRepository repository, ILogger<DeleteOrcamentoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task HandleAsync(string id)
    {
        _logger.LogInformation("Deletando orçamento {OrcamentoId}", id);

        await _repository.DeleteAsync(id);
    }
}
