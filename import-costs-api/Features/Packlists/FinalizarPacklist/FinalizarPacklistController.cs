using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Packlists.FinalizarPacklist;

/// <summary>
/// Controller para finalizar packlist
/// </summary>
[ApiController]
[Route("api/orcamentos/{orcamentoId}/packlist")]
public class FinalizarPacklistController : ControllerBase
{
    private readonly FinalizarPacklistHandler _handler;

    public FinalizarPacklistController(FinalizarPacklistHandler handler)
    {
        _handler = handler;
    }

    [HttpPost("finalizar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Finalizar(string orcamentoId)
    {
        await _handler.Handle(orcamentoId);
        return NoContent();
    }
}
