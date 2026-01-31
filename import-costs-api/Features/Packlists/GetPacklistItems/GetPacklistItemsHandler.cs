using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Packlists.GetPacklistItems;

/// <summary>
/// Handler para listar itens do packlist
/// </summary>
public class GetPacklistItemsHandler
{
    private readonly PacklistRepository _repository;
    private readonly ILogger<GetPacklistItemsHandler> _logger;

    public GetPacklistItemsHandler(PacklistRepository repository, ILogger<GetPacklistItemsHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<PagedResult<PacklistItem>> Handle(string orcamentoId, int pageNumber, int pageSize)
    {
        var packlist = await _repository.GetByOrcamentoId(orcamentoId);
        if (packlist == null)
        {
            _logger.LogWarning("Packlist para orçamento {OrcamentoId} não encontrado", orcamentoId);
            throw new NotFoundException("Packlist", orcamentoId);
        }

        var result = await _repository.GetItems(packlist.Id, pageNumber, pageSize);
        return result;
    }
}
