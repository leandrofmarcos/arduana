using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Aliquotas.CreateAliquota;

/// <summary>
/// Handler para criação de perfil de alíquotas
/// </summary>
public class CreateAliquotaHandler
{
    private readonly AliquotaRepository _repository;
    private readonly IValidator<CreateAliquotaDto> _validator;
    private readonly ILogger<CreateAliquotaHandler> _logger;

    public CreateAliquotaHandler(
        AliquotaRepository repository,
        IValidator<CreateAliquotaDto> validator,
        ILogger<CreateAliquotaHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<AliquotaPerfil> Handle(CreateAliquotaDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao criar perfil de alíquotas: {@Errors}",
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

        var perfil = new AliquotaPerfil
        {
            Nome = dto.Nome.Trim(),
            Descricao = dto.Descricao?.Trim(),
            II = dto.II,
            IPI = dto.IPI,
            ICMS = dto.ICMS,
            PIS = dto.PIS,
            COFINS = dto.COFINS,
            Padrao = dto.Padrao
        };

        if (dto.Padrao)
        {
            await _repository.ClearPadrao();
        }

        await _repository.Add(perfil);

        _logger.LogInformation("Perfil de alíquotas criado com sucesso. ID: {AliquotaId}", perfil.Id);

        return perfil;
    }
}
