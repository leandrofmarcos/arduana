using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ValidationException = ImportCostsApi.Core.Exceptions.ValidationException;

namespace ImportCostsApi.Features.Funcionarios.CreateFuncionario;

/// <summary>
/// Handler para criação de funcionário
/// </summary>
public class CreateFuncionarioHandler
{
    private readonly FuncionarioRepository _repository;
    private readonly IValidator<CreateFuncionarioDto> _validator;
    private readonly ILogger<CreateFuncionarioHandler> _logger;

    public CreateFuncionarioHandler(
        FuncionarioRepository repository,
        IValidator<CreateFuncionarioDto> validator,
        ILogger<CreateFuncionarioHandler> logger)
    {
        _repository = repository;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Executa a criação de um novo funcionário
    /// </summary>
    public async Task<Funcionario> Handle(CreateFuncionarioDto dto)
    {
        // Validar DTO
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
                .ToList();
            _logger.LogWarning("Erro de validação ao criar funcionário: {@Errors}", errors);
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

        // Verificar duplicidade de username
        if (await _repository.ExistsByUsername(dto.Username))
        {
            _logger.LogWarning("Funcionário com username {Username} já existe", dto.Username);
            throw new BusinessException("Funcionário com este username já existe");
        }

        // Verificar duplicidade de email (apenas se fornecido)
        if (!string.IsNullOrWhiteSpace(dto.Email) && await _repository.ExistsByEmail(dto.Email))
        {
            _logger.LogWarning("Funcionário com email {Email} já existe", dto.Email);
            throw new BusinessException("Funcionário com este email já existe");
        }

        // Criar entidade
        var funcionario = new Funcionario
        {
            NomeCompleto = dto.NomeCompleto.Trim(),
            Username = dto.Username.Trim(),
            ContatoWhatsApp = dto.ContatoWhatsApp?.Trim(),
            ContatoWeChat = dto.ContatoWeChat?.Trim(),
            Email = dto.Email?.Trim(),
            Setor = dto.Setor?.Trim(),
            Cargo = dto.Cargo?.Trim()
        };

        // Persistir
        await _repository.Add(funcionario);

        _logger.LogInformation("Funcionário criado com sucesso. ID: {FuncionarioId}, Nome: {Nome}", 
            funcionario.Id, funcionario.NomeCompleto);

        return funcionario;
    }
}
