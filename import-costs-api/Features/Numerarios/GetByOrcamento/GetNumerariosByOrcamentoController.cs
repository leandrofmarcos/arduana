namespace ImportCostsApi.Features.Numerarios.GetByOrcamento;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for retrieving all Numerario Lancamentos by Orcamento ID
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class GetNumerariosByOrcamentoController : ControllerBase
{
    private readonly GetNumerariosByOrcamentoHandler _handler;

    public GetNumerariosByOrcamentoController(GetNumerariosByOrcamentoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Get all Numerario Lancamentos for an Orcamento
    /// </summary>
    [HttpGet("{orcamentoId}/numerarios")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<NumerarioLancamentoResponseDto>>> GetNumerariosByOrcamento(string orcamentoId)
    {
        var result = await _handler.HandleAsync(orcamentoId);
        return Ok(result);
    }
}
