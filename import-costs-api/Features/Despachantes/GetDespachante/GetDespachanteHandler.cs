using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Despachantes.GetDespachante;

/// <summary>
/// Handler para obter despachante por ID
/// </summary>
public class GetDespachanteHandler
{
    private readonly DespachanteRepository _repository;
    private readonly ILogger<GetDespachanteHandler> _logger;

    public GetDespachanteHandler(DespachanteRepository repository, ILogger<GetDespachanteHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Executa a busca de um despachante por ID
    /// </summary>
    public async Task<Despachante> Handle(string despachanteId)
    {
        var despachante = await _repository.GetById(despachanteId);
        if (despachante == null)
        {
            _logger.LogWarning("Despachante com ID {DespachanteId} não encontrado", despachanteId);
            throw new NotFoundException("Despachante", despachanteId);
        }

        return despachante;
    }
}
