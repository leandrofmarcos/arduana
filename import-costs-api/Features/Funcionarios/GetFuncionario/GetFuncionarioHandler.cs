using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Funcionarios.GetFuncionario;

/// <summary>
/// Handler para obter funcionário por ID
/// </summary>
public class GetFuncionarioHandler
{
    private readonly FuncionarioRepository _repository;
    private readonly ILogger<GetFuncionarioHandler> _logger;

    public GetFuncionarioHandler(
        FuncionarioRepository repository,
        ILogger<GetFuncionarioHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Obter funcionário por ID
    /// </summary>
    public async Task<Funcionario> Handle(string id)
    {
        _logger.LogInformation("Buscando funcionário com ID: {FuncionarioId}", id);

        var funcionario = await _repository.GetById(id);

        if (funcionario == null)
        {
            _logger.LogWarning("Funcionário não encontrado. ID: {FuncionarioId}", id);
            throw new NotFoundException($"Funcionário com ID {id} não encontrado");
        }

        _logger.LogInformation("Funcionário encontrado: {Nome}", funcionario.NomeCompleto);

        return funcionario;
    }
}
