using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.TemplatesPacklist.GetTemplates;

/// <summary>
/// Controller para listar templates
/// </summary>
[ApiController]
[Route("api/templates-packlist")]
public class GetTemplatesController : ControllerBase
{
    private readonly GetTemplatesHandler _handler;

    public GetTemplatesController(GetTemplatesHandler handler)
    {
        _handler = handler;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<TemplateResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _handler.Handle(pageNumber, pageSize);

        var templates = result.Items.Select(t => new TemplateResponseDto
        {
            Id = t.Id,
            Nome = t.Nome,
            Descricao = t.Descricao,
            NomeArquivo = t.NomeArquivo,
            Config = t.Config,
            DataCriacao = t.DataCriacao,
            DataAtualizacao = t.DataAtualizacao
        }).ToList();

        var pagedResult = new PagedResult<TemplateResponseDto>
        {
            Items = templates,
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize
        };

        return Ok(ApiResponse<PagedResult<TemplateResponseDto>>.Ok(pagedResult, "Templates listados com sucesso"));
    }
}
