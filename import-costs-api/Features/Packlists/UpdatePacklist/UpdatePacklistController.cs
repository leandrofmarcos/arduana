using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Packlists.UpdatePacklist;

/// <summary>
/// Controller para atualização de packlist
/// </summary>
[ApiController]
[Route("api/orcamentos/{orcamentoId}/packlist")]
public class UpdatePacklistController : ControllerBase
{
    private readonly UpdatePacklistHandler _handler;

    public UpdatePacklistController(UpdatePacklistHandler handler)
    {
        _handler = handler;
    }

    [HttpPut]
    [ProducesResponseType(typeof(ApiResponse<PacklistResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(string orcamentoId, [FromBody] UpdatePacklistDto dto)
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

        return Ok(ApiResponse<PacklistResponseDto>.Ok(response, "Packlist atualizado com sucesso"));
    }
}
