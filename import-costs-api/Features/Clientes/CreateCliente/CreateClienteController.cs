using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Clientes.CreateCliente;

/// <summary>
/// Controller para criação de cliente
/// </summary>
[ApiController]
[Tags("Clientes")]
[Route("api/clientes")]
public class CreateClienteController : ControllerBase
{
    private readonly CreateClienteHandler _handler;

    public CreateClienteController(CreateClienteHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Criar um novo cliente
    /// </summary>
    /// <param name="dto">Dados do cliente a ser criado</param>
    /// <returns>Cliente criado com sucesso</returns>
    /// <response code="201">Cliente criado com sucesso</response>
    /// <response code="400">Erro de validação ou cliente duplicado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ClienteResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Create([FromBody] CreateClienteDto dto)
    {
        var cliente = await _handler.Handle(dto);

        var response = new ClienteResponseDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Contato = cliente.Contato,
            TemplatePacklistId = cliente.TemplatePacklistId,
            CreatedAt = cliente.CreatedAt
        };

        return StatusCode(
            StatusCodes.Status201Created,
            ApiResponse<ClienteResponseDto>.Created(response, "Cliente criado com sucesso"));
    }
}
