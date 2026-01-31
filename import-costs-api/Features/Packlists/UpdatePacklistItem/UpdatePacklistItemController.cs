using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Packlists.UpdatePacklistItem;

/// <summary>
/// Controller para atualização de item do packlist
/// </summary>
[ApiController]
[Route("api/orcamentos/{orcamentoId}/packlist/items")]
public class UpdatePacklistItemController : ControllerBase
{
    private readonly UpdatePacklistItemHandler _handler;

    public UpdatePacklistItemController(UpdatePacklistItemHandler handler)
    {
        _handler = handler;
    }

    [HttpPut("{itemId}")]
    [ProducesResponseType(typeof(ApiResponse<PacklistItemResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(string orcamentoId, string itemId, [FromBody] UpdatePacklistItemDto dto)
    {
        var item = await _handler.Handle(orcamentoId, itemId, dto);

        var response = new PacklistItemResponseDto
        {
            Id = item.Id,
            PacklistId = item.PacklistId,
            Codigo = item.Codigo,
            Descricao = item.Descricao,
            Quantidade = item.Quantidade,
            PesoKg = item.PesoKg,
            ValorUSD = item.ValorUSD,
            VolumeM3 = item.VolumeM3
        };

        return Ok(ApiResponse<PacklistItemResponseDto>.Ok(response, "Item atualizado com sucesso"));
    }
}
