using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Packlists.DeletePacklistItem;

/// <summary>
/// Controller para deletar item do packlist
/// </summary>
[ApiController]
[Route("api/orcamentos/{orcamentoId}/packlist/items")]
public class DeletePacklistItemController : ControllerBase
{
    private readonly DeletePacklistItemHandler _handler;

    public DeletePacklistItemController(DeletePacklistItemHandler handler)
    {
        _handler = handler;
    }

    [HttpDelete("{itemId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(string orcamentoId, string itemId)
    {
        await _handler.Handle(orcamentoId, itemId);
        return NoContent();
    }
}
