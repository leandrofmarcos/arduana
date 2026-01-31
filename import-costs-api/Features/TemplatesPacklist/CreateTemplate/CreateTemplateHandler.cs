using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Core.Storage;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.TemplatesPacklist.CreateTemplate;

/// <summary>
/// Handler para criação de template de packlist
/// </summary>
public class CreateTemplateHandler
{
    private readonly TemplateRepository _repository;
    private readonly IStorageService _storage;
    private readonly IValidator<CreateTemplateDto> _validator;
    private readonly ILogger<CreateTemplateHandler> _logger;

    public CreateTemplateHandler(
        TemplateRepository repository,
        IStorageService storage,
        IValidator<CreateTemplateDto> validator,
        ILogger<CreateTemplateHandler> logger)
    {
        _repository = repository;
        _storage = storage;
        _validator = validator;
        _logger = logger;
    }

    public async Task<TemplatePacklist> Handle(CreateTemplateDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao criar template: {@Errors}",
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

        var template = new TemplatePacklist
        {
            Nome = dto.Nome.Trim(),
            Descricao = dto.Descricao?.Trim(),
            NomeArquivo = dto.Arquivo.FileName,
            Config = dto.Config,
            DataCriacao = DateTime.UtcNow,
            DataAtualizacao = DateTime.UtcNow
        };

        var relativePath = BuildStoragePath(template.Id, template.NomeArquivo);
        await using var stream = dto.Arquivo.OpenReadStream();
        await _storage.SaveAsync(relativePath, stream, cancellationToken);

        await _repository.Add(template);

        _logger.LogInformation("Template de packlist criado com sucesso. ID: {TemplateId}", template.Id);

        return template;
    }

    private static string BuildStoragePath(string templateId, string fileName)
    {
        return $"templates-packlist/{templateId}/{fileName}";
    }
}
