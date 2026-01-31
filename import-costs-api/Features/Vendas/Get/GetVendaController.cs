namespace ImportCostsApi.Features.Vendas.Get;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for retrieving a single Venda by ID
/// </summary>
[ApiController]
[Route("api/vendas")]
public class GetVendaController : ControllerBase
{
    private readonly GetVendaHandler _handler;

    public GetVendaController(GetVendaHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Get a Venda by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VendaResponseDto>> GetVenda(string id)
    {
        var result = await _handler.HandleAsync(id);
        return Ok(result);
    }
}
