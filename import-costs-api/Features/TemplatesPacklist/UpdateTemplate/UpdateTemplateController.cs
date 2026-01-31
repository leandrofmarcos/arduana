using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.TemplatesPacklist.UpdateTemplate;

/// <summary>
/// Controller para atualização de template
/// </summary>
[ApiController]
[Route("api/templates-packlist")]
public class UpdateTemplateController : ControllerBase
{
    private readonly UpdateTemplateHandler _handler;

    public UpdateTemplateController(UpdateTemplateHandler handler)
    {
        _handler = handler;
    }

    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<TemplateResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(string id, [FromForm] UpdateTemplateDto dto, CancellationToken cancellationToken)
    {
        var template = await _handler.Handle(id, dto, cancellationToken);

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

        return Ok(ApiResponse<TemplateResponseDto>.Ok(response, "Template atualizado com sucesso"));
    }
}
