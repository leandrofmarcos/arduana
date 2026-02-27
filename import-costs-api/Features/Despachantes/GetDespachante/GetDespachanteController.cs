using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Despachantes.GetDespachante;

/// <summary>
/// Controller para obter despachante por ID
/// </summary>
[ApiController]
[Route("api/despachantes")]
public class GetDespachanteController : ControllerBase
{
    private readonly GetDespachanteHandler _handler;

    public GetDespachanteController(GetDespachanteHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Obter despachante por ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<DespachanteResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(string id)
    {
        var despachante = await _handler.Handle(id);

        var response = new DespachanteResponseDto
        {
            Id = despachante.Id,
            Nome = despachante.Nome,
            Contato = despachante.Contato,
            CreatedAt = despachante.CreatedAt
        };

        return Ok(ApiResponse<DespachanteResponseDto>.Ok(response));
    }
}
