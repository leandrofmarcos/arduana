using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Packlists.GetPacklistItems;

/// <summary>
/// Controller para listar itens do packlist
/// </summary>
[ApiController]
[Route("api/orcamentos/{orcamentoId}/packlist/items")]
public class GetPacklistItemsController : ControllerBase
{
    private readonly GetPacklistItemsHandler _handler;

    public GetPacklistItemsController(GetPacklistItemsHandler handler)
    {
        _handler = handler;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<PacklistItemResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAll(string orcamentoId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _handler.Handle(orcamentoId, pageNumber, pageSize);

        var items = result.Items.Select(i => new PacklistItemResponseDto
        {
            Id = i.Id,
            PacklistId = i.PacklistId,
            Codigo = i.Codigo,
            Descricao = i.Descricao,
            Quantidade = i.Quantidade,
            PesoKg = i.PesoKg,
            ValorUSD = i.ValorUSD,
            VolumeM3 = i.VolumeM3
        }).ToList();

        var paged = new PagedResult<PacklistItemResponseDto>
        {
            Items = items,
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize
        };

        return Ok(ApiResponse<PagedResult<PacklistItemResponseDto>>.Ok(paged, "Itens do packlist listados com sucesso"));
    }
}
