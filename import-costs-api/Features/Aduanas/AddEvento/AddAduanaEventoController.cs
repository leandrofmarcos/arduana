namespace ImportCostsApi.Features.Aduanas.AddEvento;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for adding an event to an Aduana
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class AddAduanaEventoController : ControllerBase
{
    private readonly AddAduanaEventoHandler _handler;

    public AddAduanaEventoController(AddAduanaEventoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Add an event to an Aduana (timeline entry)
    /// </summary>
    [HttpPost("{orcamentoId}/aduana/eventos")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AduanaEventoDto>> AddEvento(
        string orcamentoId,
        [FromBody] AddAduanaEventoDto request)
    {
        var result = await _handler.HandleAsync(orcamentoId, request);
        return CreatedAtAction(nameof(AddEvento), new { orcamentoId }, result);
    }
}
