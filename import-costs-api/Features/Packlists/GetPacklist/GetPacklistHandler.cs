using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Packlists.GetPacklist;

/// <summary>
/// Handler para obter packlist por orçamento
/// </summary>
public class GetPacklistHandler
{
    private readonly PacklistRepository _repository;
    private readonly ILogger<GetPacklistHandler> _logger;

    public GetPacklistHandler(PacklistRepository repository, ILogger<GetPacklistHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Packlist> Handle(string orcamentoId)
    {
        var packlist = await _repository.GetByOrcamentoId(orcamentoId);
        if (packlist == null)
        {
            _logger.LogWarning("Packlist para orçamento {OrcamentoId} não encontrado", orcamentoId);
            throw new NotFoundException("Packlist", orcamentoId);
        }

        return packlist;
    }
}
