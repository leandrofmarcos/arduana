using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Despachantes.CreateDespachante;

/// <summary>
/// Handler para criação de despachante
/// </summary>
public class CreateDespachanteHandler
{
    private readonly DespachanteRepository _repository;
    private readonly IValidator<CreateDespachanteDto> _validator;
    private readonly ILogger<CreateDespachanteHandler> _logger;

    public CreateDespachanteHandler(
        DespachanteRepository repository,
        IValidator<CreateDespachanteDto> validator,
        ILogger<CreateDespachanteHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Executa a criação de um novo despachante
    /// </summary>
    public async Task<Despachante> Handle(CreateDespachanteDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            _logger.LogWarning("Erro de validação ao criar despachante: {@Errors}",
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

        if (await _repository.ExistsByDocumento(dto.Documento))
        {
            _logger.LogWarning("Despachante com documento {Documento} já existe", dto.Documento);
            throw new BusinessException("Despachante com este documento já existe");
        }

        var despachante = new Despachante
        {
            Nome = dto.Nome.Trim(),
            Documento = new string(dto.Documento.Where(char.IsDigit).ToArray()),
            Contato = dto.Contato.Trim()
        };

        await _repository.Add(despachante);

        _logger.LogInformation("Despachante criado com sucesso. ID: {DespachanteId}", despachante.Id);

        return despachante;
    }
}
