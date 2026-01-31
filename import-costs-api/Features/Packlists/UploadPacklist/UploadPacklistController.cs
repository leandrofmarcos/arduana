using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Packlists.UploadPacklist;

/// <summary>
/// Controller para upload de arquivo do packlist
/// </summary>
[ApiController]
[Route("api/orcamentos/{orcamentoId}/packlist")]
public class UploadPacklistController : ControllerBase
{
    private readonly UploadPacklistHandler _handler;

    public UploadPacklistController(UploadPacklistHandler handler)
    {
        _handler = handler;
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Upload(string orcamentoId, [FromForm] UploadPacklistDto dto, CancellationToken cancellationToken)
    {
        await _handler.Handle(orcamentoId, dto, cancellationToken);
        return NoContent();
    }
}
