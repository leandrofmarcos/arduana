using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Packlists.GetPacklist;

/// <summary>
/// Controller para obter packlist por orçamento
/// </summary>
[ApiController]
[Route("api/orcamentos/{orcamentoId}/packlist")]
public class GetPacklistController : ControllerBase
{
    private readonly GetPacklistHandler _handler;

    public GetPacklistController(GetPacklistHandler handler)
    {
        _handler = handler;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PacklistResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Get(string orcamentoId)
    {
        var packlist = await _handler.Handle(orcamentoId);

        var response = new PacklistResponseDto
        {
            Id = packlist.Id,
            OrcamentoId = packlist.OrcamentoId,
            Codigo = packlist.Codigo,
            Cliente = packlist.Cliente,
            Despachante = packlist.Despachante,
            ArquivoNome = packlist.ArquivoNome,
            ArquivoCaminho = packlist.ArquivoCaminho,
            EnviadoEm = packlist.EnviadoEm,
            EnviadoPor = packlist.EnviadoPor,
            Status = packlist.Status,
            TotalItems = packlist.TotalItems,
            MappingConfig = packlist.MappingConfig
        };

        return Ok(ApiResponse<PacklistResponseDto>.Ok(response));
    }
}
