using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Portos.UpdatePorto;

/// <summary>
/// Controller para atualização de porto
/// </summary>
[ApiController]
[Route("api/portos")]
public class UpdatePortoController : ControllerBase
{
    private readonly UpdatePortoHandler _handler;

    public UpdatePortoController(UpdatePortoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Atualizar um porto existente
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PortoResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdatePortoDto dto)
    {
        var porto = await _handler.Handle(id, dto);

        var response = new PortoResponseDto
        {
            Id = porto.Id,
            Nome = porto.Nome,
            CreatedAt = porto.CreatedAt
        };

        return Ok(ApiResponse<PortoResponseDto>.Ok(response, "Porto atualizado com sucesso"));
    }
}
