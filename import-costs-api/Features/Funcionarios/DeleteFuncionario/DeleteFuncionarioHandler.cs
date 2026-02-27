using ImportCostsApi.Core.Exceptions;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Funcionarios.DeleteFuncionario;

/// <summary>
/// Handler para deleção de funcionário
/// </summary>
public class DeleteFuncionarioHandler
{
    private readonly FuncionarioRepository _repository;
    private readonly ILogger<DeleteFuncionarioHandler> _logger;

    public DeleteFuncionarioHandler(
        FuncionarioRepository repository,
        ILogger<DeleteFuncionarioHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Executa a deleção (soft delete) de um funcionário
    /// </summary>
    public async Task Handle(string id)
    {
        _logger.LogInformation("Deletando funcionário. ID: {FuncionarioId}", id);

        // Buscar funcionário
        var funcionario = await _repository.GetById(id);
        if (funcionario == null)
        {
            _logger.LogWarning("Funcionário não encontrado para deleção. ID: {FuncionarioId}", id);
            throw new NotFoundException($"Funcionário com ID {id} não encontrado");
        }

        // Deletar (soft delete)
        await _repository.Delete(funcionario);

        _logger.LogInformation("Funcionário deletado com sucesso. ID: {FuncionarioId}, Nome: {Nome}", 
            id, funcionario.NomeCompleto);
    }
}
