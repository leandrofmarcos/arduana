using ImportCostsApi.Core.Exceptions;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Despachantes.DeleteDespachante;

/// <summary>
/// Handler para deletar despachante
/// </summary>
public class DeleteDespachanteHandler
{
    private readonly DespachanteRepository _repository;
    private readonly ILogger<DeleteDespachanteHandler> _logger;

    public DeleteDespachanteHandler(DespachanteRepository repository, ILogger<DeleteDespachanteHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Executa a deleção de um despachante
    /// </summary>
    public async Task Handle(string despachanteId)
    {
        var despachante = await _repository.GetById(despachanteId);
        if (despachante == null)
        {
            _logger.LogWarning("Despachante com ID {DespachanteId} não encontrado para deletar", despachanteId);
            throw new NotFoundException("Despachante", despachanteId);
        }

        var hasOrcamentos = await _repository.HasOrcamentos(despachanteId);
        if (hasOrcamentos)
        {
            _logger.LogWarning("Tentativa de deletar despachante {DespachanteId} com orçamentos vinculados", despachanteId);
            throw new BusinessException("Despachante possui orçamentos vinculados e não pode ser deletado");
        }

        await _repository.Delete(despachante);

        _logger.LogInformation("Despachante deletado com sucesso. ID: {DespachanteId}", despachanteId);
    }
}
