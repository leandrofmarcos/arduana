namespace ImportCostsApi.Features.Numerarios.Create;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for creating a new Numerario Lancamento
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class CreateNumerarioController : ControllerBase
{
    private readonly CreateNumerarioHandler _handler;

    public CreateNumerarioController(CreateNumerarioHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Create a new Numerario Lancamento for an Orcamento
    /// </summary>
    [HttpPost("{orcamentoId}/numerarios")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NumerarioLancamentoResponseDto>> CreateNumerario(
        string orcamentoId,
        [FromBody] CreateNumerarioDto request)
    {
        request.OrcamentoId = orcamentoId;
        var result = await _handler.HandleAsync(request);
        return CreatedAtAction(nameof(CreateNumerario), new { orcamentoId, id = result.Id }, result);
    }
}
