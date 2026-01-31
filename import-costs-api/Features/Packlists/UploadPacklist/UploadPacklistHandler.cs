using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Core.Storage;
using ImportCostsApi.Domain.Enums;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Packlists.UploadPacklist;

/// <summary>
/// Handler para upload de arquivo do packlist
/// </summary>
public class UploadPacklistHandler
{
    private readonly PacklistRepository _repository;
    private readonly IStorageService _storage;
    private readonly IValidator<UploadPacklistDto> _validator;
    private readonly ILogger<UploadPacklistHandler> _logger;

    public UploadPacklistHandler(
        PacklistRepository repository,
        IStorageService storage,
        IValidator<UploadPacklistDto> validator,
        ILogger<UploadPacklistHandler> logger)
    {
        _repository = repository;
        _storage = storage;
        _validator = validator;
        _logger = logger;
    }

    public async Task Handle(string orcamentoId, UploadPacklistDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação no upload do packlist: {@Errors}",
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

        var packlist = await _repository.GetByOrcamentoId(orcamentoId);
        if (packlist == null)
        {
            _logger.LogWarning("Packlist para orçamento {OrcamentoId} não encontrado", orcamentoId);
            throw new NotFoundException("Packlist", orcamentoId);
        }

        var relativePath = BuildStoragePath(orcamentoId, dto.Arquivo.FileName);
        await using var stream = dto.Arquivo.OpenReadStream();
        await _storage.SaveAsync(relativePath, stream, cancellationToken);

        packlist.ArquivoNome = dto.Arquivo.FileName;
        packlist.ArquivoCaminho = relativePath;
        packlist.EnviadoEm = DateTime.UtcNow;
        packlist.EnviadoPor = dto.EnviadoPor;
        packlist.TotalItems = dto.TotalItems ?? packlist.TotalItems;
        packlist.MappingConfig = dto.MappingConfig ?? packlist.MappingConfig;

        if (packlist.Status == PacklistStatus.Pendente)
            packlist.Status = PacklistStatus.EmAndamento;

        await _repository.Update(packlist);

        _logger.LogInformation("Arquivo de packlist enviado com sucesso. ID: {PacklistId}", packlist.Id);
    }

    private static string BuildStoragePath(string orcamentoId, string fileName)
    {
        return $"packlists/{orcamentoId}/{fileName}";
    }
}
