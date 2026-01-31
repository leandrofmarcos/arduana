namespace ImportCostsApi.Features.Custos.Get;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for retrieving a single Custo by ID
/// </summary>
[ApiController]
[Route("api/custos")]
public class GetCustoController : ControllerBase
{
    private readonly GetCustoHandler _handler;

    public GetCustoController(GetCustoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Get a Custo by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustoResponseDto>> GetCusto(string id)
    {
        var result = await _handler.HandleAsync(id);
        return Ok(result);
    }
}
