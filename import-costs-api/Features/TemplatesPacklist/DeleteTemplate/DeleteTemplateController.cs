using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.TemplatesPacklist.DeleteTemplate;

/// <summary>
/// Controller para deletar template
/// </summary>
[ApiController]
[Route("api/templates-packlist")]
public class DeleteTemplateController : ControllerBase
{
    private readonly DeleteTemplateHandler _handler;

    public DeleteTemplateController(DeleteTemplateHandler handler)
    {
        _handler = handler;
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        await _handler.Handle(id, cancellationToken);
        return NoContent();
    }
}
