using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Aliquotas.UpdateAliquota;

/// <summary>
/// Handler para atualização de perfil de alíquotas
/// </summary>
public class UpdateAliquotaHandler
{
    private readonly AliquotaRepository _repository;
    private readonly IValidator<UpdateAliquotaDto> _validator;
    private readonly ILogger<UpdateAliquotaHandler> _logger;

    public UpdateAliquotaHandler(
        AliquotaRepository repository,
        IValidator<UpdateAliquotaDto> validator,
        ILogger<UpdateAliquotaHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    public async Task<AliquotaPerfil> Handle(string aliquotaId, UpdateAliquotaDto dto)
    {
        _logger.LogInformation("Atualizando alíquota {Id}. DTO: Nome={Nome}, II={II}, IPI={IPI}, ICMS={ICMS}, PIS={PIS}, COFINS={COFINS}, Padrao={Padrao}",
            aliquotaId, dto.Nome, dto.II, dto.IPI, dto.ICMS, dto.PIS, dto.COFINS, dto.Padrao);
        
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao atualizar perfil de alíquotas: {@Errors}",
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

        var perfil = await _repository.GetById(aliquotaId);
        if (perfil == null)
        {
            _logger.LogWarning("Perfil de alíquotas com ID {AliquotaId} não encontrado", aliquotaId);
            throw new NotFoundException("AliquotaPerfil", aliquotaId);
        }

        if (!string.IsNullOrWhiteSpace(dto.Nome))
            perfil.Nome = dto.Nome.Trim();

        if (dto.Descricao != null)
            perfil.Descricao = dto.Descricao?.Trim();

        if (dto.II.HasValue) perfil.II = dto.II.Value;
        if (dto.IPI.HasValue) perfil.IPI = dto.IPI.Value;
        if (dto.ICMS.HasValue) perfil.ICMS = dto.ICMS.Value;
        if (dto.PIS.HasValue) perfil.PIS = dto.PIS.Value;
        if (dto.COFINS.HasValue) perfil.COFINS = dto.COFINS.Value;

        if (dto.Padrao.HasValue)
        {
            if (dto.Padrao.Value)
            {
                await _repository.ClearPadrao();
                perfil.Padrao = true;
            }
            else
            {
                perfil.Padrao = false;
            }
        }

        perfil.UpdatedAt = DateTime.UtcNow;

        await _repository.Update(perfil);

        _logger.LogInformation("Perfil de alíquotas atualizado com sucesso. ID: {AliquotaId}", aliquotaId);

        return perfil;
    }
}
