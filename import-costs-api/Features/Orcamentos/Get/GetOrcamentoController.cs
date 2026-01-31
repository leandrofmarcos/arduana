namespace ImportCostsApi.Features.Orcamentos.Get;

using Microsoft.AspNetCore.Mvc;
using ImportCostsApi.Features.Orcamentos;
using ImportCostsApi.Features.Orcamentos.GetAll;
using ImportCostsApi.Features.Orcamentos.Resumo;

/// <summary>
/// Endpoints para recuperar orçamentos
/// GET /api/orcamentos/{id} - Recuperar orçamento específico
/// GET /api/orcamentos - Listar todos os orçamentos
/// GET /api/orcamentos/{id}/resumo - Recuperar apenas o resumo
/// </summary>
[ApiController]
[Route("api/orcamentos")]
[Tags("Orcamentos")]
public class GetOrcamentoController : ControllerBase
{
    private readonly GetOrcamentoHandler _handler;
    private readonly GetAllOrcamentosHandler _handlerGetAll;
    private readonly GetResumoOrcamentoHandler _handlerResumo;
    private readonly ILogger<GetOrcamentoController> _logger;

    public GetOrcamentoController(
        GetOrcamentoHandler handler,
        GetAllOrcamentosHandler handlerGetAll,
        GetResumoOrcamentoHandler handlerResumo,
        ILogger<GetOrcamentoController> logger)
    {
        _handler = handler;
        _handlerGetAll = handlerGetAll;
        _handlerResumo = handlerResumo;
        _logger = logger;
    }

    /// <summary>
    /// Recupera um orçamento específico com resumo consolidado de todas as fases
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var dto = await _handler.HandleAsync(id);
        return Ok(dto);
    }

    /// <summary>
    /// Lista todos os orçamentos com paginação
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        var dtos = await _handlerGetAll.HandleAsync(skip, take);
        return Ok(dtos);
    }

    /// <summary>
    /// Recupera apenas o resumo consolidado do orçamento (agregação das 4 fases)
    /// </summary>
    [HttpGet("{id}/resumo")]
    public async Task<IActionResult> GetResumo(string id)
    {
        var resumo = await _handlerResumo.HandleAsync(id);
        return Ok(resumo);
    }
}
