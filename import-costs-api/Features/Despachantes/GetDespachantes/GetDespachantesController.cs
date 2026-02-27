using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Despachantes.GetDespachantes;

/// <summary>
/// Controller para listar despachantes
/// </summary>
[ApiController]
[Route("api/despachantes")]
public class GetDespachantesController : ControllerBase
{
    private readonly GetDespachantesHandler _handler;

    public GetDespachantesController(GetDespachantesHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Listar todos os despachantes com paginação
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<DespachanteResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _handler.Handle(pageNumber, pageSize);

        var despachantes = result.Items.Select(d => new DespachanteResponseDto
        {
            Id = d.Id,
            Nome = d.Nome,
            Contato = d.Contato,
            CreatedAt = d.CreatedAt
        }).ToList();

        var pagedResult = new PagedResult<DespachanteResponseDto>
        {
            Items = despachantes,
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize
        };

        return Ok(ApiResponse<PagedResult<DespachanteResponseDto>>.Ok(pagedResult, "Despachantes listados com sucesso"));
    }
}
