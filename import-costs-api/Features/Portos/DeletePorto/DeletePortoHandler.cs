using ImportCostsApi.Core.Exceptions;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Portos.DeletePorto;

/// <summary>
/// Handler para deletar porto
/// </summary>
public class DeletePortoHandler
{
    private readonly PortoRepository _repository;
    private readonly ILogger<DeletePortoHandler> _logger;

    public DeletePortoHandler(PortoRepository repository, ILogger<DeletePortoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Executa a deleção de um porto
    /// </summary>
    public async Task Handle(string portoId)
    {
        var porto = await _repository.GetById(portoId);
        if (porto == null)
        {
            _logger.LogWarning("Porto com ID {PortoId} não encontrado para deletar", portoId);
            throw new NotFoundException("Porto", portoId);
        }

        await _repository.Delete(porto);

        _logger.LogInformation("Porto deletado com sucesso. ID: {PortoId}", portoId);
    }
}
