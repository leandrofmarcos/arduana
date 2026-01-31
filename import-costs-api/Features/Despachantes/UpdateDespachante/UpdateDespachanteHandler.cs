using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Despachantes.UpdateDespachante;

/// <summary>
/// Handler para atualização de despachante
/// </summary>
public class UpdateDespachanteHandler
{
    private readonly DespachanteRepository _repository;
    private readonly IValidator<UpdateDespachanteDto> _validator;
    private readonly ILogger<UpdateDespachanteHandler> _logger;

    public UpdateDespachanteHandler(
        DespachanteRepository repository,
        IValidator<UpdateDespachanteDto> validator,
        ILogger<UpdateDespachanteHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Executa a atualização de um despachante
    /// </summary>
    public async Task<Despachante> Handle(string despachanteId, UpdateDespachanteDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao atualizar despachante: {@Errors}",
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

        var despachante = await _repository.GetById(despachanteId);
        if (despachante == null)
        {
            _logger.LogWarning("Despachante com ID {DespachanteId} não encontrado", despachanteId);
            throw new NotFoundException("Despachante", despachanteId);
        }

        if (!string.IsNullOrWhiteSpace(dto.Nome))
            despachante.Nome = dto.Nome.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Contato))
            despachante.Contato = dto.Contato.Trim();

        despachante.UpdatedAt = DateTime.UtcNow;

        await _repository.Update(despachante);

        _logger.LogInformation("Despachante atualizado com sucesso. ID: {DespachanteId}", despachanteId);

        return despachante;
    }
}
