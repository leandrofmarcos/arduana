using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Funcionarios.UpdateFuncionario;

/// <summary>
/// Handler para atualização de funcionário
/// </summary>
public class UpdateFuncionarioHandler
{
    private readonly FuncionarioRepository _repository;
    private readonly IValidator<UpdateFuncionarioDto> _validator;
    private readonly ILogger<UpdateFuncionarioHandler> _logger;

    public UpdateFuncionarioHandler(
        FuncionarioRepository repository,
        IValidator<UpdateFuncionarioDto> validator,
        ILogger<UpdateFuncionarioHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Executa a atualização de um funcionário
    /// </summary>
    public async Task<Funcionario> Handle(string id, UpdateFuncionarioDto dto)
    {
        // Validar DTO
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
                .ToList();
            _logger.LogWarning("Erro de validação ao atualizar funcionário: {@Errors}", errors);
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

        // Buscar funcionário existente
        var funcionario = await _repository.GetById(id);
        if (funcionario == null)
        {
            _logger.LogWarning("Funcionário não encontrado para atualização. ID: {FuncionarioId}", id);
            throw new NotFoundException($"Funcionário com ID {id} não encontrado");
        }

        // Verificar duplicidade de username (se alterado)
        if (funcionario.Username.ToLower() != dto.Username.ToLower())
        {
            if (await _repository.ExistsByUsername(dto.Username))
            {
                _logger.LogWarning("Funcionário com username {Username} já existe", dto.Username);
                throw new BusinessException("Funcionário com este username já existe");
            }
        }

        // Verificar duplicidade de email (apenas se fornecido e alterado)
        if (!string.IsNullOrWhiteSpace(dto.Email) &&
            (funcionario.Email ?? string.Empty).ToLower() != dto.Email.ToLower() &&
            await _repository.ExistsByEmail(dto.Email))
        {
            _logger.LogWarning("Funcionário com email {Email} já existe", dto.Email);
            throw new BusinessException("Funcionário com este email já existe");
        }

        // Atualizar dados
        funcionario.NomeCompleto = dto.NomeCompleto.Trim();
        funcionario.Username = dto.Username.Trim();
        funcionario.ContatoWhatsApp = dto.ContatoWhatsApp?.Trim();
        funcionario.ContatoWeChat = dto.ContatoWeChat?.Trim();
        funcionario.Email = dto.Email?.Trim();
        funcionario.Setor = dto.Setor?.Trim();
        funcionario.Cargo = dto.Cargo?.Trim();

        // Persistir
        await _repository.Update(funcionario);

        _logger.LogInformation("Funcionário atualizado com sucesso. ID: {FuncionarioId}", id);

        return funcionario;
    }
}
