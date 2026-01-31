using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace ImportCostsApi.Features.Portos.GetPorto;

/// <summary>
/// Handler para obter porto por ID
/// </summary>
public class GetPortoHandler
{
    private readonly PortoRepository _repository;
    private readonly ILogger<GetPortoHandler> _logger;

    public GetPortoHandler(PortoRepository repository, ILogger<GetPortoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Executa a busca de um porto por ID
    /// </summary>
    public async Task<Porto> Handle(string portoId)
    {
        var porto = await _repository.GetById(portoId);
        if (porto == null)
        {
            _logger.LogWarning("Porto com ID {PortoId} não encontrado", portoId);
            throw new NotFoundException("Porto", portoId);
        }

        return porto;
    }
}
