namespace ImportCostsApi.Features.Aduanas.Create;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for creating a new Aduana
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class CreateAduanaController : ControllerBase
{
    private readonly CreateAduanaHandler _handler;

    public CreateAduanaController(CreateAduanaHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Create a new Aduana for an Orcamento
    /// </summary>
    [HttpPost("{orcamentoId}/aduana")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AduanaResponseDto>> CreateAduana(
        string orcamentoId,
        [FromBody] CreateAduanaDto request)
    {
        request.OrcamentoId = orcamentoId;
        var result = await _handler.HandleAsync(request);
        return CreatedAtAction(nameof(CreateAduana), new { orcamentoId }, result);
    }
}
