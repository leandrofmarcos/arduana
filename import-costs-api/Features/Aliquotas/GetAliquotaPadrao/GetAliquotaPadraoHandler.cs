using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Aliquotas.GetAliquotaPadrao;

/// <summary>
/// Handler para obter o perfil de alíquotas padrão
/// </summary>
public class GetAliquotaPadraoHandler
{
    private readonly AliquotaRepository _repository;
    private readonly ILogger<GetAliquotaPadraoHandler> _logger;

    public GetAliquotaPadraoHandler(AliquotaRepository repository, ILogger<GetAliquotaPadraoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<AliquotaPerfil> Handle()
    {
        var perfil = await _repository.GetPadrao();
        if (perfil == null)
        {
            _logger.LogWarning("Perfil de alíquotas padrão não encontrado");
            throw new NotFoundException("AliquotaPerfil", "padrao");
        }

        return perfil;
    }
}
