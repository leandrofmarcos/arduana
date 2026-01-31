using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Clientes.GetCliente;

/// <summary>
/// Handler para obter cliente por ID
/// </summary>
public class GetClienteHandler
{
    private readonly ClienteRepository _repository;
    private readonly ILogger<GetClienteHandler> _logger;

    public GetClienteHandler(ClienteRepository repository, ILogger<GetClienteHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Executa a busca de um cliente por ID
    /// </summary>
    public async Task<Cliente> Handle(string clienteId)
    {
        var cliente = await _repository.GetById(clienteId);
        if (cliente == null)
        {
            _logger.LogWarning("Cliente com ID {ClienteId} não encontrado", clienteId);
            throw new NotFoundException("Cliente", clienteId);
        }

        return cliente;
    }
}
