namespace ImportCostsApi.Features.Orcamentos.Update;

using Microsoft.AspNetCore.Mvc;
using ImportCostsApi.Features.Orcamentos;
using ImportCostsApi.Features.Orcamentos.TransicaoFase;

/// <summary>
/// Endpoints para atualizar orçamento
/// PUT /api/orcamentos/{id} - Atualizar informações gerais
/// POST /api/orcamentos/{id}/transicao-fase - Transicionar entre fases
/// </summary>
[ApiController]
[Route("api/orcamentos")]
[Tags("Orcamentos")]
public class UpdateOrcamentoController : ControllerBase
{
    private readonly UpdateOrcamentoHandler _handler;
    private readonly TransicaoFaseHandler _handlerTransicao;
    private readonly ILogger<UpdateOrcamentoController> _logger;

    public UpdateOrcamentoController(
        UpdateOrcamentoHandler handler,
        TransicaoFaseHandler handlerTransicao,
        ILogger<UpdateOrcamentoController> logger)
    {
        _handler = handler;
        _handlerTransicao = handlerTransicao;
        _logger = logger;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateOrcamentoDto dto)
    {
        var resultado = await _handler.HandleAsync(id, dto);
        return Ok(resultado);
    }

    [HttpPost("{id}/transicao-fase")]
    public async Task<IActionResult> TransicionarFase(string id, [FromBody] TransicaoFaseDto dto)
    {
        var resultado = await _handlerTransicao.HandleAsync(id, dto);
        return Ok(resultado);
    }
}
