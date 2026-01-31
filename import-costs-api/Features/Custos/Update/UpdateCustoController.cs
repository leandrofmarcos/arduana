namespace ImportCostsApi.Features.Custos.Update;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for updating an existing Custo
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class UpdateCustoController : ControllerBase
{
    private readonly UpdateCustoHandler _handler;

    public UpdateCustoController(UpdateCustoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Update an existing Custo
    /// </summary>
    [HttpPut("{orcamentoId}/custo")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustoResponseDto>> UpdateCusto(
        string orcamentoId,
        [FromBody] UpdateCustoDto request)
    {
        var custo = await _handler.HandleAsync(orcamentoId, request);
        return Ok(custo);
    }
}
