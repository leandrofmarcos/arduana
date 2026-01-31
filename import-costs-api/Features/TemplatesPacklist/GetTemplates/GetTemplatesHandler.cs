using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.TemplatesPacklist.GetTemplates;

/// <summary>
/// Handler para listar templates
/// </summary>
public class GetTemplatesHandler
{
    private readonly TemplateRepository _repository;
    private readonly ILogger<GetTemplatesHandler> _logger;

    public GetTemplatesHandler(TemplateRepository repository, ILogger<GetTemplatesHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<PagedResult<TemplatePacklist>> Handle(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1)
            pageNumber = 1;

        if (pageSize < 1 || pageSize > 100)
            pageSize = 10;

        var result = await _repository.GetAll(pageNumber, pageSize);
        _logger.LogInformation("Listagem de templates executada. Página: {PageNumber}, Tamanho: {PageSize}, Total: {TotalCount}",
            pageNumber, pageSize, result.TotalCount);

        return result;
    }
}
