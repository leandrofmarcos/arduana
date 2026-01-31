using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Portos.CreatePorto;

/// <summary>
/// Handler para criação de porto
/// </summary>
public class CreatePortoHandler
{
    private readonly PortoRepository _repository;
    private readonly IValidator<CreatePortoDto> _validator;
    private readonly ILogger<CreatePortoHandler> _logger;

    public CreatePortoHandler(
        PortoRepository repository,
        IValidator<CreatePortoDto> validator,
        ILogger<CreatePortoHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Executa a criação de um novo porto
    /// </summary>
    public async Task<Porto> Handle(CreatePortoDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao criar porto: {@Errors}",
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

        if (await _repository.ExistsByCodigo(dto.Codigo))
        {
            _logger.LogWarning("Porto com código {Codigo} já existe", dto.Codigo);
            throw new BusinessException("Porto com este código já existe");
        }

        var porto = new Porto
        {
            Nome = dto.Nome.Trim(),
            Codigo = dto.Codigo.Trim().ToUpperInvariant(),
            Pais = dto.Pais.Trim()
        };

        await _repository.Add(porto);

        _logger.LogInformation("Porto criado com sucesso. ID: {PortoId}", porto.Id);

        return porto;
    }
}
