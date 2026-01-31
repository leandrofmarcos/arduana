using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Core.Storage;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.TemplatesPacklist.UpdateTemplate;

/// <summary>
/// Handler para atualização de template de packlist
/// </summary>
public class UpdateTemplateHandler
{
    private readonly TemplateRepository _repository;
    private readonly IStorageService _storage;
    private readonly IValidator<UpdateTemplateDto> _validator;
    private readonly ILogger<UpdateTemplateHandler> _logger;

    public UpdateTemplateHandler(
        TemplateRepository repository,
        IStorageService storage,
        IValidator<UpdateTemplateDto> validator,
        ILogger<UpdateTemplateHandler> logger)
    {
        _repository = repository;
        _storage = storage;
        _validator = validator;
        _logger = logger;
    }

    public async Task<TemplatePacklist> Handle(string templateId, UpdateTemplateDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao atualizar template: {@Errors}",
                validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage }).ToList());

            throw new ValidationException(
                validationResult.Errors
                    .Select(e => new ImportCostsApi.Core.Models.ValidationError
                    {
                        Field = e.PropertyName,
                        Message = e.ErrorMessage
                    })
                    .ToList()
            );
        }

        var template = await _repository.GetById(templateId);
        if (template == null)
        {
            _logger.LogWarning("Template com ID {TemplateId} não encontrado", templateId);
            throw new NotFoundException("TemplatePacklist", templateId);
        }

        if (!string.IsNullOrWhiteSpace(dto.Nome))
            template.Nome = dto.Nome.Trim();

        if (dto.Descricao != null)
            template.Descricao = dto.Descricao?.Trim();

        if (dto.Config != null)
            template.Config = dto.Config;

        if (dto.Arquivo != null)
        {
            var oldPath = BuildStoragePath(template.Id, template.NomeArquivo);
            await _storage.DeleteAsync(oldPath, cancellationToken);

            template.NomeArquivo = dto.Arquivo.FileName;
            var newPath = BuildStoragePath(template.Id, template.NomeArquivo);
            await using var stream = dto.Arquivo.OpenReadStream();
            await _storage.SaveAsync(newPath, stream, cancellationToken);
        }

        template.DataAtualizacao = DateTime.UtcNow;
        template.UpdatedAt = DateTime.UtcNow;

        await _repository.Update(template);

        _logger.LogInformation("Template de packlist atualizado com sucesso. ID: {TemplateId}", templateId);

        return template;
    }

    private static string BuildStoragePath(string templateId, string fileName)
    {
        return $"templates-packlist/{templateId}/{fileName}";
    }
}
