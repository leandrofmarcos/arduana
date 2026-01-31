using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.TemplatesPacklist.GetTemplate;

/// <summary>
/// Controller para obter template por ID
/// </summary>
[ApiController]
[Route("api/templates-packlist")]
public class GetTemplateController : ControllerBase
{
    private readonly GetTemplateHandler _handler;

    public GetTemplateController(GetTemplateHandler handler)
    {
        _handler = handler;
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TemplateResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(string id)
    {
        var template = await _handler.Handle(id);

        var response = new TemplateResponseDto
        {
            Id = template.Id,
            Nome = template.Nome,
            Descricao = template.Descricao,
            NomeArquivo = template.NomeArquivo,
            Config = template.Config,
            DataCriacao = template.DataCriacao,
            DataAtualizacao = template.DataAtualizacao
        };

        return Ok(ApiResponse<TemplateResponseDto>.Ok(response));
    }
}
