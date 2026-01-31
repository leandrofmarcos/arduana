using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Packlists.UpdatePacklist;

/// <summary>
/// Handler para atualização de packlist
/// </summary>
public class UpdatePacklistHandler
{
    private readonly PacklistRepository _repository;
    private readonly IValidator<UpdatePacklistDto> _validator;
    private readonly ILogger<UpdatePacklistHandler> _logger;

    public UpdatePacklistHandler(
        PacklistRepository repository,
        IValidator<UpdatePacklistDto> validator,
        ILogger<UpdatePacklistHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<Packlist> Handle(string orcamentoId, UpdatePacklistDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao atualizar packlist: {@Errors}",
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

        if (!string.IsNullOrWhiteSpace(dto.Codigo))
            packlist.Codigo = dto.Codigo.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Cliente))
            packlist.Cliente = dto.Cliente.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Despachante))
            packlist.Despachante = dto.Despachante.Trim();

        if (dto.MappingConfig != null)
            packlist.MappingConfig = dto.MappingConfig;

        if (dto.Status.HasValue)
            packlist.Status = dto.Status.Value;

        if (dto.TotalItems.HasValue)
            packlist.TotalItems = dto.TotalItems.Value;

        await _repository.Update(packlist);

        _logger.LogInformation("Packlist atualizado com sucesso. ID: {PacklistId}", packlist.Id);

        return packlist;
    }
}
