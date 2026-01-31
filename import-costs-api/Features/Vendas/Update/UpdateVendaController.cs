namespace ImportCostsApi.Features.Vendas.Update;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for updating an existing Venda
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class UpdateVendaController : ControllerBase
{
    private readonly UpdateVendaHandler _handler;

    public UpdateVendaController(UpdateVendaHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Update an existing Venda
    /// </summary>
    [HttpPut("{orcamentoId}/venda")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VendaResponseDto>> UpdateVenda(
        string orcamentoId,
        [FromBody] UpdateVendaDto request)
    {
        var venda = await _handler.HandleAsync(orcamentoId, request);
        return Ok(venda);
    }
}
