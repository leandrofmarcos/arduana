using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Aliquotas.GetAliquotas;

/// <summary>
/// Controller para listar perfis de alíquotas
/// </summary>
[ApiController]
[Route("api/aliquotas")]
public class GetAliquotasController : ControllerBase
{
    private readonly GetAliquotasHandler _handler;

    public GetAliquotasController(GetAliquotasHandler handler)
    {
        _handler = handler;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AliquotaResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _handler.Handle(pageNumber, pageSize);

        var perfis = result.Items.Select(p => new AliquotaResponseDto
        {
            Id = p.Id,
            Nome = p.Nome,
            Descricao = p.Descricao,
            II = p.II,
            IPI = p.IPI,
            ICMS = p.ICMS,
            PIS = p.PIS,
            COFINS = p.COFINS,
            Padrao = p.Padrao,
            CreatedAt = p.CreatedAt
        }).ToList();

        var pagedResult = new PagedResult<AliquotaResponseDto>
        {
            Items = perfis,
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize
        };

        return Ok(ApiResponse<PagedResult<AliquotaResponseDto>>.Ok(pagedResult, "Perfis de alíquotas listados com sucesso"));
    }
}
