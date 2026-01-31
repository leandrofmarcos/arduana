using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Despachantes.CreateDespachante;

/// <summary>
/// Controller para criação de despachante
/// </summary>
[ApiController]
[Route("api/despachantes")]
public class CreateDespachanteController : ControllerBase
{
    private readonly CreateDespachanteHandler _handler;

    public CreateDespachanteController(CreateDespachanteHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Criar um novo despachante
    /// </summary>
    /// <param name="dto">Dados do despachante a ser criado</param>
    /// <returns>Despachante criado com sucesso</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<DespachanteResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Create([FromBody] CreateDespachanteDto dto)
    {
        var despachante = await _handler.Handle(dto);

        var response = new DespachanteResponseDto
        {
            Id = despachante.Id,
            Nome = despachante.Nome,
            Documento = despachante.Documento,
            Contato = despachante.Contato,
            CreatedAt = despachante.CreatedAt
        };

        return CreatedAtAction(
            "GetById",
            new { id = despachante.Id, controller = "Despachantes" },
            ApiResponse<DespachanteResponseDto>.Created(response, "Despachante criado com sucesso"));
    }
}
