using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using ImportCostsApi.Domain.Enums;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Packlists.CreatePacklist;

/// <summary>
/// Handler para criação de packlist
/// </summary>
public class CreatePacklistHandler
{
    private readonly PacklistRepository _repository;
    private readonly IValidator<CreatePacklistDto> _validator;
    private readonly ILogger<CreatePacklistHandler> _logger;

    public CreatePacklistHandler(
        PacklistRepository repository,
        IValidator<CreatePacklistDto> validator,
        ILogger<CreatePacklistHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<Packlist> Handle(string orcamentoId, CreatePacklistDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao criar packlist: {@Errors}",
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

        if (!await _repository.OrcamentoExists(orcamentoId))
            throw new NotFoundException("Orcamento", orcamentoId);

        if (await _repository.HasPacklist(orcamentoId))
            throw new BusinessException("Orçamento já possui packlist");

        var packlist = new Packlist
        {
            OrcamentoId = orcamentoId,
            Codigo = dto.Codigo?.Trim(),
            Cliente = dto.Cliente?.Trim(),
            Despachante = dto.Despachante?.Trim(),
            MappingConfig = dto.MappingConfig,
            Status = PacklistStatus.Pendente,
            EnviadoEm = DateTime.UtcNow
        };

        await _repository.Add(packlist);

        _logger.LogInformation("Packlist criado com sucesso. ID: {PacklistId}", packlist.Id);

        return packlist;
    }
}
