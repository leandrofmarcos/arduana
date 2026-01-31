using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Despachantes.UpdateDespachante;

/// <summary>
/// Controller para atualização de despachante
/// </summary>
[ApiController]
[Route("api/despachantes")]
public class UpdateDespachanteController : ControllerBase
{
    private readonly UpdateDespachanteHandler _handler;

    public UpdateDespachanteController(UpdateDespachanteHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Atualizar um despachante existente
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<DespachanteResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateDespachanteDto dto)
    {
        var despachante = await _handler.Handle(id, dto);

        var response = new DespachanteResponseDto
        {
            Id = despachante.Id,
            Nome = despachante.Nome,
            Documento = despachante.Documento,
            Contato = despachante.Contato,
            CreatedAt = despachante.CreatedAt
        };

        return Ok(ApiResponse<DespachanteResponseDto>.Ok(response, "Despachante atualizado com sucesso"));
    }
}
