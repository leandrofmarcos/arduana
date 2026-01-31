using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Aliquotas.GetAliquotas;

/// <summary>
/// Handler para listar perfis de alíquotas
/// </summary>
public class GetAliquotasHandler
{
    private readonly AliquotaRepository _repository;
    private readonly ILogger<GetAliquotasHandler> _logger;

    public GetAliquotasHandler(AliquotaRepository repository, ILogger<GetAliquotasHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<PagedResult<AliquotaPerfil>> Handle(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1)
            pageNumber = 1;

        if (pageSize < 1 || pageSize > 100)
            pageSize = 10;

        var result = await _repository.GetAll(pageNumber, pageSize);
        _logger.LogInformation("Listagem de perfis de alíquotas executada. Página: {PageNumber}, Tamanho: {PageSize}, Total: {TotalCount}",
            pageNumber, pageSize, result.TotalCount);

        return result;
    }
}
