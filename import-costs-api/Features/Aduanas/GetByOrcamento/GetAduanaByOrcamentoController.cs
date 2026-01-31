namespace ImportCostsApi.Features.Aduanas.GetByOrcamento;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for retrieving Aduana by Orcamento ID
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class GetAduanaByOrcamentoController : ControllerBase
{
    private readonly GetAduanaByOrcamentoHandler _handler;

    public GetAduanaByOrcamentoController(GetAduanaByOrcamentoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Get Aduana associated with an Orcamento
    /// </summary>
    [HttpGet("{orcamentoId}/aduana")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AduanaResponseDto>> GetAduanaByOrcamento(string orcamentoId)
    {
        var result = await _handler.HandleAsync(orcamentoId);
        return Ok(result);
    }
}
