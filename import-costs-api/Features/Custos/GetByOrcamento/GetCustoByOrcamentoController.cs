namespace ImportCostsApi.Features.Custos.GetByOrcamento;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for retrieving Custo by Orcamento ID
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class GetCustoByOrcamentoController : ControllerBase
{
    private readonly GetCustoByOrcamentoHandler _handler;

    public GetCustoByOrcamentoController(GetCustoByOrcamentoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Get Custo associated with an Orcamento
    /// </summary>
    [HttpGet("{orcamentoId}/custo")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustoResponseDto>> GetCustoByOrcamento(string orcamentoId)
    {
        var result = await _handler.HandleAsync(orcamentoId);
        return Ok(result);
    }
}
