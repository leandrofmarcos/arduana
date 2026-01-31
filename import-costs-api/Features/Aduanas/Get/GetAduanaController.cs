namespace ImportCostsApi.Features.Aduanas.Get;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for retrieving a single Aduana by ID
/// </summary>
[ApiController]
[Route("api/aduanas")]
public class GetAduanaController : ControllerBase
{
    private readonly GetAduanaHandler _handler;

    public GetAduanaController(GetAduanaHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Get an Aduana by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AduanaResponseDto>> GetAduana(string id)
    {
        var result = await _handler.HandleAsync(id);
        return Ok(result);
    }
}
