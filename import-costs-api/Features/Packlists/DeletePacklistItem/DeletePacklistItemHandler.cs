using ImportCostsApi.Core.Exceptions;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Packlists.DeletePacklistItem;

/// <summary>
/// Handler para deletar item do packlist
/// </summary>
public class DeletePacklistItemHandler
{
    private readonly PacklistRepository _repository;
    private readonly ILogger<DeletePacklistItemHandler> _logger;

    public DeletePacklistItemHandler(PacklistRepository repository, ILogger<DeletePacklistItemHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task Handle(string orcamentoId, string itemId)
    {
        var packlist = await _repository.GetByOrcamentoId(orcamentoId);
        if (packlist == null)
        {
            _logger.LogWarning("Packlist para orçamento {OrcamentoId} não encontrado", orcamentoId);
            throw new NotFoundException("Packlist", orcamentoId);
        }

        var item = await _repository.GetItemById(itemId);
        if (item == null || item.PacklistId != packlist.Id)
        {
            _logger.LogWarning("Item {ItemId} não encontrado para packlist {PacklistId}", itemId, packlist.Id);
            throw new NotFoundException("PacklistItem", itemId);
        }

        await _repository.DeleteItem(item);

        _logger.LogInformation("Item do packlist deletado. ID: {ItemId}", item.Id);
    }
}
