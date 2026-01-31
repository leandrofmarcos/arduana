using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Core.Storage;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.TemplatesPacklist.DeleteTemplate;

/// <summary>
/// Handler para deletar template
/// </summary>
public class DeleteTemplateHandler
{
    private readonly TemplateRepository _repository;
    private readonly IStorageService _storage;
    private readonly ILogger<DeleteTemplateHandler> _logger;

    public DeleteTemplateHandler(TemplateRepository repository, IStorageService storage, ILogger<DeleteTemplateHandler> logger)
    {
        _repository = repository;
        _storage = storage;
        _logger = logger;
    }

    public async Task Handle(string templateId, CancellationToken cancellationToken = default)
    {
        var template = await _repository.GetById(templateId);
        if (template == null)
        {
            _logger.LogWarning("Template com ID {TemplateId} não encontrado para deletar", templateId);
            throw new NotFoundException("TemplatePacklist", templateId);
        }

        var hasRelations = await _repository.HasClientesOrOrcamentos(templateId);
        if (hasRelations)
        {
            throw new BusinessException("Template possui vínculos e não pode ser deletado");
        }

        var path = BuildStoragePath(template.Id, template.NomeArquivo);
        await _storage.DeleteAsync(path, cancellationToken);

        await _repository.Delete(template);

        _logger.LogInformation("Template deletado com sucesso. ID: {TemplateId}", templateId);
    }

    private static string BuildStoragePath(string templateId, string fileName)
    {
        return $"templates-packlist/{templateId}/{fileName}";
    }
}
