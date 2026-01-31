using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Packlists.AddPacklistItem;

/// <summary>
/// Controller para adicionar item ao packlist
/// </summary>
[ApiController]
[Route("api/orcamentos/{orcamentoId}/packlist/items")]
public class AddPacklistItemController : ControllerBase
{
    private readonly AddPacklistItemHandler _handler;

    public AddPacklistItemController(AddPacklistItemHandler handler)
    {
        _handler = handler;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PacklistItemResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Add(string orcamentoId, [FromBody] AddPacklistItemDto dto)
    {
        var item = await _handler.Handle(orcamentoId, dto);

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

        return CreatedAtAction(
            "GetAll",
            new { orcamentoId, controller = "PacklistItems" },
            ApiResponse<PacklistItemResponseDto>.Created(response, "Item adicionado com sucesso"));
    }
}
