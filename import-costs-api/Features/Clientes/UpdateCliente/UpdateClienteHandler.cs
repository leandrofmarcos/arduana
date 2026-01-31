using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Clientes.UpdateCliente;

/// <summary>
/// Handler para atualização de cliente
/// </summary>
public class UpdateClienteHandler
{
    private readonly ClienteRepository _repository;
    private readonly IValidator<UpdateClienteDto> _validator;
    private readonly ILogger<UpdateClienteHandler> _logger;

    public UpdateClienteHandler(
        ClienteRepository repository,
        IValidator<UpdateClienteDto> validator,
        ILogger<UpdateClienteHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Executa a atualização de um cliente
    /// </summary>
    public async Task<Cliente> Handle(string clienteId, UpdateClienteDto dto)
    {
        // Validar DTO
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
                .ToList();
            _logger.LogWarning("Erro de validação ao atualizar cliente: {@Errors}", errors);
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

        // Buscar cliente
        var cliente = await _repository.GetById(clienteId);
        if (cliente == null)
        {
            _logger.LogWarning("Cliente com ID {ClienteId} não encontrado", clienteId);
            throw new NotFoundException("Cliente", clienteId);
        }

        // Atualizar dados
        if (!string.IsNullOrWhiteSpace(dto.Nome))
            cliente.Nome = dto.Nome.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Contato))
            cliente.Contato = dto.Contato.Trim();

        if (dto.TemplatePacklistId != null)
            cliente.TemplatePacklistId = dto.TemplatePacklistId;

        cliente.UpdatedAt = DateTime.UtcNow;

        // Persistir
        await _repository.Update(cliente);

        _logger.LogInformation("Cliente atualizado com sucesso. ID: {ClienteId}", clienteId);

        return cliente;
    }
}
