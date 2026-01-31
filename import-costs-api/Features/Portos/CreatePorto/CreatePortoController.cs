using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Portos.CreatePorto;

/// <summary>
/// Controller para criação de porto
/// </summary>
[ApiController]
[Route("api/portos")]
public class CreatePortoController : ControllerBase
{
    private readonly CreatePortoHandler _handler;

    public CreatePortoController(CreatePortoHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Criar um novo porto
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PortoResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Create([FromBody] CreatePortoDto dto)
    {
        var porto = await _handler.Handle(dto);

        var response = new PortoResponseDto
        {
            Id = porto.Id,
            Nome = porto.Nome,
            Codigo = porto.Codigo,
            Pais = porto.Pais,
            CreatedAt = porto.CreatedAt
        };

        return CreatedAtAction(
            "GetById",
            new { id = porto.Id, controller = "Portos" },
            ApiResponse<PortoResponseDto>.Created(response, "Porto criado com sucesso"));
    }
}
