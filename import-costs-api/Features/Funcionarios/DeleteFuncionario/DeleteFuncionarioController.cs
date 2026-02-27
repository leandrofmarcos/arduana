using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Funcionarios.DeleteFuncionario;

/// <summary>
/// Controller para deleção de funcionário
/// </summary>
[ApiController]
[Tags("Funcionários")]
[Route("api/funcionarios")]
public class DeleteFuncionarioController : ControllerBase
{
    private readonly DeleteFuncionarioHandler _handler;

    public DeleteFuncionarioController(DeleteFuncionarioHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Deletar um funcionário (soft delete)
    /// </summary>
    /// <param name="id">ID do funcionário a ser deletado</param>
    /// <returns>Confirmação de deleção</returns>
    /// <response code="200">Funcionário deletado com sucesso</response>
    /// <response code="404">Funcionário não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(string id)
    {
        await _handler.Handle(id);

        return Ok(ApiResponse.Ok(null, "Funcionário deletado com sucesso"));
    }
}
