namespace ImportCostsApi.Features.Orcamentos.Create;

using Microsoft.AspNetCore.Mvc;
using ImportCostsApi.Features.Orcamentos;
using ImportCostsApi.Features.Orcamentos.Get;

/// <summary>
/// Endpoint para criar novo orçamento
/// POST /api/orcamentos - Criar novo orçamento
/// </summary>
[ApiController]
[Route("api/orcamentos")]
[Tags("Orcamentos")]
public class CreateOrcamentoController : ControllerBase
{
    private readonly CreateOrcamentoHandler _handler;
    private readonly ILogger<CreateOrcamentoController> _logger;

    public CreateOrcamentoController(CreateOrcamentoHandler handler, ILogger<CreateOrcamentoController> logger)
    {
        _handler = handler;
        _logger = logger;
    }

    /// <summary>
    /// Cria novo orçamento vinculado a um cliente
    /// Requer cliente existente
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrcamentoDto dto)
    {
        var resultado = await _handler.HandleAsync(dto);
        return CreatedAtAction(nameof(GetOrcamentoController.GetById), new { id = resultado.Id }, resultado);
    }
}
