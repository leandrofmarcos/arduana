using ImportCostsApi.Core.Exceptions;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Aliquotas.DeleteAliquota;

/// <summary>
/// Handler para deletar perfil de alíquotas
/// </summary>
public class DeleteAliquotaHandler
{
    private readonly AliquotaRepository _repository;
    private readonly ILogger<DeleteAliquotaHandler> _logger;

    public DeleteAliquotaHandler(AliquotaRepository repository, ILogger<DeleteAliquotaHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task Handle(string aliquotaId)
    {
        var perfil = await _repository.GetById(aliquotaId);
        if (perfil == null)
        {
            _logger.LogWarning("Perfil de alíquotas com ID {AliquotaId} não encontrado para deletar", aliquotaId);
            throw new NotFoundException("AliquotaPerfil", aliquotaId);
        }

        await _repository.Delete(perfil);

        _logger.LogInformation("Perfil de alíquotas deletado com sucesso. ID: {AliquotaId}", aliquotaId);
    }
}
