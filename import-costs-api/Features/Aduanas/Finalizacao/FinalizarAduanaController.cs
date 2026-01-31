namespace ImportCostsApi.Features.Aduanas.Finalizacao;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for finalizing an Aduana
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class FinalizarAduanaController : ControllerBase
{
    private readonly FinalizarAduanaHandler _handler;

    public FinalizarAduanaController(FinalizarAduanaHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Finalize an Aduana (mark as completed with clearance date)
    /// </summary>
    [HttpPost("{orcamentoId}/aduana/finalizar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AduanaResponseDto>> FinalizarAduana(
        string orcamentoId,
        [FromBody] FinalizarAduanaDto request)
    {
        var result = await _handler.HandleAsync(orcamentoId, request);
        return Ok(result);
    }
}
