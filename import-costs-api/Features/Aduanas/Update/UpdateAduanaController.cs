namespace ImportCostsApi.Features.Aduanas.Update;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for updating an existing Aduana
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class UpdateAduanaController : ControllerBase
{
    private readonly UpdateAduanaHandler _handler;

    public UpdateAduanaController(UpdateAduanaHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Update an existing Aduana
    /// </summary>
    [HttpPut("{orcamentoId}/aduana")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AduanaResponseDto>> UpdateAduana(
        string orcamentoId,
        [FromBody] UpdateAduanaDto request)
    {
        var aduana = await _handler.HandleAsync(orcamentoId, request);
        return Ok(aduana);
    }
}
