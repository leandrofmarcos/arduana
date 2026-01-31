namespace ImportCostsApi.Features.Numerarios.Get;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for retrieving a single Numerario Lancamento by ID
/// </summary>
[ApiController]
[Route("api/numerarios")]
public class GetNumerarioController : ControllerBase
{
    private readonly GetNumerarioHandler _handler;

    public GetNumerarioController(GetNumerarioHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Get a Numerario Lancamento by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NumerarioLancamentoResponseDto>> GetNumerario(string id)
    {
        var result = await _handler.HandleAsync(id);
        return Ok(result);
    }
}
