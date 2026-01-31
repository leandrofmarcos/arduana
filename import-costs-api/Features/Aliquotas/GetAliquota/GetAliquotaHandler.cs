using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Aliquotas.GetAliquota;

/// <summary>
/// Handler para obter perfil de alíquotas por ID
/// </summary>
public class GetAliquotaHandler
{
    private readonly AliquotaRepository _repository;
    private readonly ILogger<GetAliquotaHandler> _logger;

    public GetAliquotaHandler(AliquotaRepository repository, ILogger<GetAliquotaHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<AliquotaPerfil> Handle(string aliquotaId)
    {
        var perfil = await _repository.GetById(aliquotaId);
        if (perfil == null)
        {
            _logger.LogWarning("Perfil de alíquotas com ID {AliquotaId} não encontrado", aliquotaId);
            throw new NotFoundException("AliquotaPerfil", aliquotaId);
        }

        return perfil;
    }
}
