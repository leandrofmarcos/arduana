using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Despachantes.DeleteDespachante;

/// <summary>
/// Controller para deletar despachante
/// </summary>
[ApiController]
[Route("api/despachantes")]
public class DeleteDespachanteController : ControllerBase
{
    private readonly DeleteDespachanteHandler _handler;

    public DeleteDespachanteController(DeleteDespachanteHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Deletar um despachante
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(string id)
    {
        await _handler.Handle(id);
        return NoContent();
    }
}
