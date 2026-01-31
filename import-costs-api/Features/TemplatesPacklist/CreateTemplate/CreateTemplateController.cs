using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.TemplatesPacklist.CreateTemplate;

/// <summary>
/// Controller para criação de template de packlist
/// </summary>
[ApiController]
[Route("api/templates-packlist")]
public class CreateTemplateController : ControllerBase
{
    private readonly CreateTemplateHandler _handler;

    public CreateTemplateController(CreateTemplateHandler handler)
    {
        _handler = handler;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<TemplateResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Create([FromForm] CreateTemplateDto dto, CancellationToken cancellationToken)
    {
        var template = await _handler.Handle(dto, cancellationToken);

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

        return CreatedAtAction(
            "GetById",
            new { id = template.Id, controller = "TemplatesPacklist" },
            ApiResponse<TemplateResponseDto>.Created(response, "Template criado com sucesso"));
    }
}
