namespace ImportCostsApi.Features.Custos.Create;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for creating a new Custo
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class CreateCustoController : ControllerBase
{
    private readonly CreateCustoHandler _handler;

    public CreateCustoController(CreateCustoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Create a new Custo for an Orcamento
    /// </summary>
    [HttpPost("{orcamentoId}/custo")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CustoResponseDto>> CreateCusto(
        string orcamentoId,
        [FromBody] CreateCustoDto request)
    {
        request.OrcamentoId = orcamentoId;
        var result = await _handler.HandleAsync(request);
        return CreatedAtAction(nameof(CreateCusto), new { orcamentoId }, result);
    }
}
