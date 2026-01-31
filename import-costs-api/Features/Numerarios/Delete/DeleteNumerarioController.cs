namespace ImportCostsApi.Features.Numerarios.Delete;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for deleting a Numerario Lancamento
/// </summary>
[ApiController]
[Route("api/numerarios")]
public class DeleteNumerarioController : ControllerBase
{
    private readonly DeleteNumerarioHandler _handler;

    public DeleteNumerarioController(DeleteNumerarioHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Delete a Numerario Lancamento by ID
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteNumerario(string id)
    {
        await _handler.HandleAsync(id);
        return NoContent();
    }
}
