namespace ImportCostsApi.Features.Custos.Delete;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for deleting a Custo
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class DeleteCustoController : ControllerBase
{
    private readonly DeleteCustoHandler _handler;

    public DeleteCustoController(DeleteCustoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Delete a Custo by Orcamento ID
    /// </summary>
    [HttpDelete("{orcamentoId}/custo")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteCusto(string orcamentoId)
    {
        await _handler.HandleAsync(orcamentoId);
        return NoContent();
    }
}
