using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Portos.GetPortos;

/// <summary>
/// Handler para listar portos
/// </summary>
public class GetPortosHandler
{
    private readonly PortoRepository _repository;
    private readonly ILogger<GetPortosHandler> _logger;

    public GetPortosHandler(PortoRepository repository, ILogger<GetPortosHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Executa a listagem de portos com paginação
    /// </summary>
    public async Task<PagedResult<Porto>> Handle(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1)
            pageNumber = 1;

        if (pageSize < 1 || pageSize > 100)
            pageSize = 10;

        var result = await _repository.GetAll(pageNumber, pageSize);
        _logger.LogInformation("Listagem de portos executada. Página: {PageNumber}, Tamanho: {PageSize}, Total: {TotalCount}",
            pageNumber, pageSize, result.TotalCount);

        return result;
    }
}
