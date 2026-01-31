namespace ImportCostsApi.Features.Aduanas.Delete;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for deleting an Aduana
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class DeleteAduanaController : ControllerBase
{
    private readonly DeleteAduanaHandler _handler;

    public DeleteAduanaController(DeleteAduanaHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Delete an Aduana by Orcamento ID
    /// </summary>
    [HttpDelete("{orcamentoId}/aduana")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteAduana(string orcamentoId)
    {
        await _handler.HandleAsync(orcamentoId);
        return NoContent();
    }
}
