using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Clientes.GetClientes;

/// <summary>
/// Handler para listar clientes
/// </summary>
public class GetClientesHandler
{
    private readonly ClienteRepository _repository;
    private readonly ILogger<GetClientesHandler> _logger;

    public GetClientesHandler(ClienteRepository repository, ILogger<GetClientesHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Executa a listagem de clientes com paginação
    /// </summary>
    public async Task<PagedResult<Cliente>> Handle(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1)
            pageNumber = 1;

        if (pageSize < 1 || pageSize > 100)
            pageSize = 10;

        var result = await _repository.GetAll(pageNumber, pageSize);
        _logger.LogInformation("Listagem de clientes executada. Página: {PageNumber}, Tamanho: {PageSize}, Total: {TotalCount}", 
            pageNumber, pageSize, result.TotalCount);

        return result;
    }
}
