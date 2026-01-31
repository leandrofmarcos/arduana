using ImportCostsApi.Core.Exceptions;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Clientes.DeleteCliente;

/// <summary>
/// Handler para deletar cliente
/// </summary>
public class DeleteClienteHandler
{
    private readonly ClienteRepository _repository;
    private readonly ILogger<DeleteClienteHandler> _logger;

    public DeleteClienteHandler(ClienteRepository repository, ILogger<DeleteClienteHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Executa a deleção de um cliente
    /// </summary>
    public async Task Handle(string clienteId)
    {
        var cliente = await _repository.GetById(clienteId);
        if (cliente == null)
        {
            _logger.LogWarning("Cliente com ID {ClienteId} não encontrado para deletar", clienteId);
            throw new NotFoundException("Cliente", clienteId);
        }

        // Verificar se tem orçamentos vinculados
        var hasOrcamentos = await _repository.HasOrcamentos(clienteId);
        if (hasOrcamentos)
        {
            _logger.LogWarning("Tentativa de deletar cliente {ClienteId} que possui orçamentos vinculados", clienteId);
            throw new BusinessException("Cliente possui orçamentos vinculados e não pode ser deletado");
        }

        // Deletar
        await _repository.Delete(cliente);

        _logger.LogInformation("Cliente deletado com sucesso. ID: {ClienteId}", clienteId);
    }
}
