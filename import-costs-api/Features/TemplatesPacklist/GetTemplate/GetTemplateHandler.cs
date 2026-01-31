using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.TemplatesPacklist.GetTemplate;

/// <summary>
/// Handler para obter template por ID
/// </summary>
public class GetTemplateHandler
{
    private readonly TemplateRepository _repository;
    private readonly ILogger<GetTemplateHandler> _logger;

    public GetTemplateHandler(TemplateRepository repository, ILogger<GetTemplateHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<TemplatePacklist> Handle(string templateId)
    {
        var template = await _repository.GetById(templateId);
        if (template == null)
        {
            _logger.LogWarning("Template com ID {TemplateId} não encontrado", templateId);
            throw new NotFoundException("TemplatePacklist", templateId);
        }

        return template;
    }
}
