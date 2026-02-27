using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Funcionarios.GetFuncionarios;

/// <summary>
/// Handler para obter lista de funcionários
/// </summary>
public class GetFuncionariosHandler
{
    private readonly FuncionarioRepository _repository;
    private readonly ILogger<GetFuncionariosHandler> _logger;

    public GetFuncionariosHandler(
        FuncionarioRepository repository,
        ILogger<GetFuncionariosHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Obter lista de funcionários com paginação
    /// </summary>
    public async Task<PagedResult<Funcionario>> Handle(int pageNumber = 1, int pageSize = 10)
    {
        _logger.LogInformation("Buscando funcionários. Página: {PageNumber}, Tamanho: {PageSize}", 
            pageNumber, pageSize);

        var result = await _repository.GetAll(pageNumber, pageSize);

        _logger.LogInformation("Funcionários encontrados: {Count}", result.Items.Count);

        return result;
    }
}
