namespace ImportCostsApi.Features.Vendas.Create;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for creating a new Venda
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class CreateVendaController : ControllerBase
{
    private readonly CreateVendaHandler _handler;

    public CreateVendaController(CreateVendaHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Create a new Venda for an Orcamento
    /// </summary>
    [HttpPost("{orcamentoId}/venda")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<VendaResponseDto>> CreateVenda(
        string orcamentoId,
        [FromBody] CreateVendaDto request)
    {
        request.OrcamentoId = orcamentoId;
        var result = await _handler.HandleAsync(request);
        return CreatedAtAction(nameof(CreateVenda), new { orcamentoId }, result);
    }
}
