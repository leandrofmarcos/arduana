using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Portos.UpdatePorto;

/// <summary>
/// Handler para atualização de porto
/// </summary>
public class UpdatePortoHandler
{
    private readonly PortoRepository _repository;
    private readonly IValidator<UpdatePortoDto> _validator;
    private readonly ILogger<UpdatePortoHandler> _logger;

    public UpdatePortoHandler(
        PortoRepository repository,
        IValidator<UpdatePortoDto> validator,
        ILogger<UpdatePortoHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Executa a atualização de um porto
    /// </summary>
    public async Task<Porto> Handle(string portoId, UpdatePortoDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao atualizar porto: {@Errors}",
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

        var porto = await _repository.GetById(portoId);
        if (porto == null)
        {
            _logger.LogWarning("Porto com ID {PortoId} não encontrado", portoId);
            throw new NotFoundException("Porto", portoId);
        }

        if (!string.IsNullOrWhiteSpace(dto.Nome))
            porto.Nome = dto.Nome.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Codigo))
        {
            var codigo = dto.Codigo.Trim().ToUpperInvariant();
            if (!string.Equals(porto.Codigo, codigo, StringComparison.OrdinalIgnoreCase))
            {
                if (await _repository.ExistsByCodigo(codigo, porto.Id))
                    throw new BusinessException("Porto com este código já existe");

                porto.Codigo = codigo;
            }
        }

        if (!string.IsNullOrWhiteSpace(dto.Pais))
            porto.Pais = dto.Pais.Trim();

        porto.UpdatedAt = DateTime.UtcNow;

        await _repository.Update(porto);

        _logger.LogInformation("Porto atualizado com sucesso. ID: {PortoId}", portoId);

        return porto;
    }
}
