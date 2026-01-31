using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Clientes.DeleteCliente;

/// <summary>
/// Controller para deletar cliente
/// </summary>
[ApiController]
[Tags("Clientes")]
[Route("api/clientes")]
public class DeleteClienteController : ControllerBase
{
    private readonly DeleteClienteHandler _handler;

    public DeleteClienteController(DeleteClienteHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Deletar um cliente
    /// </summary>
    /// <param name="id">ID do cliente a ser deletado</param>
    /// <returns>Confirmação de deleção</returns>
    /// <response code="204">Cliente deletado com sucesso</response>
    /// <response code="400">Cliente possui orçamentos vinculados</response>
    /// <response code="404">Cliente não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(string id)
    {
        await _handler.Handle(id);
        return NoContent();
    }
}
