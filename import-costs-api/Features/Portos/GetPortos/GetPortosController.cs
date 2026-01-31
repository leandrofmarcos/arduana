using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Portos.GetPortos;

/// <summary>
/// Controller para listar portos
/// </summary>
[ApiController]
[Route("api/portos")]
public class GetPortosController : ControllerBase
{
    private readonly GetPortosHandler _handler;

    public GetPortosController(GetPortosHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Listar todos os portos com paginação
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<PortoResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _handler.Handle(pageNumber, pageSize);

        var portos = result.Items.Select(p => new PortoResponseDto
        {
            Id = p.Id,
            Nome = p.Nome,
            Codigo = p.Codigo,
            Pais = p.Pais,
            CreatedAt = p.CreatedAt
        }).ToList();

        var pagedResult = new PagedResult<PortoResponseDto>
        {
            Items = portos,
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize
        };

        return Ok(ApiResponse<PagedResult<PortoResponseDto>>.Ok(pagedResult, "Portos listados com sucesso"));
    }
}
