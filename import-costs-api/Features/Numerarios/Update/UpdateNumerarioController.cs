namespace ImportCostsApi.Features.Numerarios.Update;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for updating an existing Numerario Lancamento
/// </summary>
[ApiController]
[Route("api/numerarios")]
public class UpdateNumerarioController : ControllerBase
{
    private readonly UpdateNumerarioHandler _handler;

    public UpdateNumerarioController(UpdateNumerarioHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Update an existing Numerario Lancamento
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NumerarioLancamentoResponseDto>> UpdateNumerario(
        string id,
        [FromBody] UpdateNumerarioDto request)
    {
        var result = await _handler.HandleAsync(id, request);
        return Ok(result);
    }
}
