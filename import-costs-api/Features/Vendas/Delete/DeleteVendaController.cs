namespace ImportCostsApi.Features.Vendas.Delete;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for deleting a Venda
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class DeleteVendaController : ControllerBase
{
    private readonly DeleteVendaHandler _handler;

    public DeleteVendaController(DeleteVendaHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Delete a Venda by Orcamento ID
    /// </summary>
    [HttpDelete("{orcamentoId}/venda")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteVenda(string orcamentoId)
    {
        await _handler.HandleAsync(orcamentoId);
        return NoContent();
    }
}
