using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Portos.GetPorto;

/// <summary>
/// Controller para obter porto por ID
/// </summary>
[ApiController]
[Route("api/portos")]
public class GetPortoController : ControllerBase
{
    private readonly GetPortoHandler _handler;

    public GetPortoController(GetPortoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Obter porto por ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PortoResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(string id)
    {
        var porto = await _handler.Handle(id);

        var response = new PortoResponseDto
        {
            Id = porto.Id,
            Nome = porto.Nome,
            CreatedAt = porto.CreatedAt
        };

        return Ok(ApiResponse<PortoResponseDto>.Ok(response));
    }
}
