using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Clientes.GetCliente;

/// <summary>
/// Controller para obter cliente por ID
/// </summary>
[ApiController]
[Tags("Clientes")]
[Route("api/clientes")]
public class GetClienteController : ControllerBase
{
    private readonly GetClienteHandler _handler;

    public GetClienteController(GetClienteHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Obter cliente por ID
    /// </summary>
    /// <param name="id">ID do cliente</param>
    /// <returns>Dados do cliente</returns>
    /// <response code="200">Cliente encontrado</response>
    /// <response code="404">Cliente não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ClienteResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(string id)
    {
        var cliente = await _handler.Handle(id);

        var response = new ClienteResponseDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Contato = cliente.Contato,
            TemplatePacklistId = cliente.TemplatePacklistId,
            CreatedAt = cliente.CreatedAt
        };

        return Ok(ApiResponse<ClienteResponseDto>.Ok(response));
    }
}
