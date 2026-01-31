using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Aliquotas.DeleteAliquota;

/// <summary>
/// Controller para deletar perfil de alíquotas
/// </summary>
[ApiController]
[Route("api/aliquotas")]
public class DeleteAliquotaController : ControllerBase
{
    private readonly DeleteAliquotaHandler _handler;

    public DeleteAliquotaController(DeleteAliquotaHandler handler)
    {
        _handler = handler;
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(string id)
    {
        await _handler.Handle(id);
        return NoContent();
    }
}
