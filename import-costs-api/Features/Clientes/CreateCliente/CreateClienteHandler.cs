using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Clientes.CreateCliente;

/// <summary>
/// Handler para criação de cliente
/// </summary>
public class CreateClienteHandler
{
    private readonly ClienteRepository _repository;
    private readonly IValidator<CreateClienteDto> _validator;
    private readonly ILogger<CreateClienteHandler> _logger;

    public CreateClienteHandler(
        ClienteRepository repository,
        IValidator<CreateClienteDto> validator,
        ILogger<CreateClienteHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Executa a criação de um novo cliente
    /// </summary>
    public async Task<Cliente> Handle(CreateClienteDto dto)
    {
        // Validar DTO
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
                .ToList();
            _logger.LogWarning("Erro de validação ao criar cliente: {@Errors}", errors);
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

        // Criar entidade
        var cliente = new Cliente
        {
            Nome = dto.Nome.Trim(),
            Contato = dto.Contato.Trim(),
            TemplatePacklistId = dto.TemplatePacklistId
        };

        // Persistir
        await _repository.Add(cliente);

        _logger.LogInformation("Cliente criado com sucesso. ID: {ClienteId}, Nome: {Nome}", cliente.Id, cliente.Nome);

        return cliente;
    }
}
