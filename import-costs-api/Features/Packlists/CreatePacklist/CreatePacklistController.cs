using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Packlists.CreatePacklist;

/// <summary>
/// Controller para criação de packlist
/// </summary>
[ApiController]
[Route("api/orcamentos/{orcamentoId}/packlist")]
public class CreatePacklistController : ControllerBase
{
    private readonly CreatePacklistHandler _handler;

    public CreatePacklistController(CreatePacklistHandler handler)
    {
        _handler = handler;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PacklistResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Create(string orcamentoId, [FromBody] CreatePacklistDto dto)
    {
        var packlist = await _handler.Handle(orcamentoId, dto);

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

        return CreatedAtAction(
            "Get",
            new { orcamentoId, controller = "Packlist" },
            ApiResponse<PacklistResponseDto>.Created(response, "Packlist criado com sucesso"));
    }
}
