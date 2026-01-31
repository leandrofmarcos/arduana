namespace ImportCostsApi.Features.Orcamentos.Delete;

using Microsoft.AspNetCore.Mvc;
using ImportCostsApi.Features.Orcamentos;

/// <summary>
/// Endpoint para deletar orçamento
/// DELETE /api/orcamentos/{id} - Deletar orçamento
/// </summary>
[ApiController]
[Route("api/orcamentos")]
[Tags("Orcamentos")]
public class DeleteOrcamentoController : ControllerBase
{
    private readonly DeleteOrcamentoHandler _handler;
    private readonly ILogger<DeleteOrcamentoController> _logger;

    public DeleteOrcamentoController(DeleteOrcamentoHandler handler, ILogger<DeleteOrcamentoController> logger)
    {
        _handler = handler;
        _logger = logger;
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _handler.HandleAsync(id);
        return NoContent();
    }
}
