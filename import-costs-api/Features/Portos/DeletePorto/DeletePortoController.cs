using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Portos.DeletePorto;

/// <summary>
/// Controller para deletar porto
/// </summary>
[ApiController]
[Route("api/portos")]
public class DeletePortoController : ControllerBase
{
    private readonly DeletePortoHandler _handler;

    public DeletePortoController(DeletePortoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Deletar um porto
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
