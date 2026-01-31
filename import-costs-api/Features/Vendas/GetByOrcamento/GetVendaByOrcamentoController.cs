namespace ImportCostsApi.Features.Vendas.GetByOrcamento;

using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Endpoint for retrieving Venda by Orcamento ID
/// </summary>
[ApiController]
[Route("api/orcamentos")]
public class GetVendaByOrcamentoController : ControllerBase
{
    private readonly GetVendaByOrcamentoHandler _handler;

    public GetVendaByOrcamentoController(GetVendaByOrcamentoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Get Venda associated with an Orcamento
    /// </summary>
    [HttpGet("{orcamentoId}/venda")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VendaResponseDto>> GetVendaByOrcamento(string orcamentoId)
    {
        var result = await _handler.HandleAsync(orcamentoId);
        return Ok(result);
    }
}
