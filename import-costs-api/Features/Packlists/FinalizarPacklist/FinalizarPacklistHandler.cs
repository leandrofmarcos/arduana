using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Packlists.FinalizarPacklist;

/// <summary>
/// Handler para finalizar packlist
/// </summary>
public class FinalizarPacklistHandler
{
    private readonly PacklistRepository _repository;
    private readonly ILogger<FinalizarPacklistHandler> _logger;

    public FinalizarPacklistHandler(PacklistRepository repository, ILogger<FinalizarPacklistHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task Handle(string orcamentoId)
    {
        var packlist = await _repository.GetByOrcamentoId(orcamentoId);
        if (packlist == null)
        {
            _logger.LogWarning("Packlist para orçamento {OrcamentoId} não encontrado", orcamentoId);
            throw new NotFoundException("Packlist", orcamentoId);
        }

        packlist.Status = PacklistStatus.Concluido;
        await _repository.Update(packlist);

        _logger.LogInformation("Packlist finalizado com sucesso. ID: {PacklistId}", packlist.Id);
    }
}
