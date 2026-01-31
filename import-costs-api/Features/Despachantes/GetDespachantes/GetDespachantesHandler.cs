using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Despachantes.GetDespachantes;

/// <summary>
/// Handler para listar despachantes
/// </summary>
public class GetDespachantesHandler
{
    private readonly DespachanteRepository _repository;
    private readonly ILogger<GetDespachantesHandler> _logger;

    public GetDespachantesHandler(DespachanteRepository repository, ILogger<GetDespachantesHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Executa a listagem de despachantes com paginação
    /// </summary>
    public async Task<PagedResult<Despachante>> Handle(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1)
            pageNumber = 1;

        if (pageSize < 1 || pageSize > 100)
            pageSize = 10;

        var result = await _repository.GetAll(pageNumber, pageSize);
        _logger.LogInformation("Listagem de despachantes executada. Página: {PageNumber}, Tamanho: {PageSize}, Total: {TotalCount}",
            pageNumber, pageSize, result.TotalCount);

        return result;
    }
}
