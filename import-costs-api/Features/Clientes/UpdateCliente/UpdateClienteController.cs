using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Clientes.UpdateCliente;

/// <summary>
/// Controller para atualização de cliente
/// </summary>
[ApiController]
[Tags("Clientes")]
[Route("api/clientes")]
public class UpdateClienteController : ControllerBase
{
    private readonly UpdateClienteHandler _handler;

    public UpdateClienteController(UpdateClienteHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Atualizar um cliente existente
    /// </summary>
    /// <param name="id">ID do cliente a ser atualizado</param>
    /// <param name="dto">Dados a serem atualizados</param>
    /// <returns>Cliente atualizado com sucesso</returns>
    /// <response code="200">Cliente atualizado com sucesso</response>
    /// <response code="400">Erro de validação</response>
    /// <response code="404">Cliente não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ClienteResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateClienteDto dto)
    {
        var cliente = await _handler.Handle(id, dto);

        var response = new ClienteResponseDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Documento = cliente.Documento,
            Contato = cliente.Contato,
            TemplatePacklistId = cliente.TemplatePacklistId,
            CreatedAt = cliente.CreatedAt
        };

        return Ok(ApiResponse<ClienteResponseDto>.Ok(response, "Cliente atualizado com sucesso"));
    }
}
