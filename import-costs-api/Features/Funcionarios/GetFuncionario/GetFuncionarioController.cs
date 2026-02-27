using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Funcionarios.GetFuncionario;

/// <summary>
/// Controller para obter funcionário por ID
/// </summary>
[ApiController]
[Tags("Funcionários")]
[Route("api/funcionarios")]
public class GetFuncionarioController : ControllerBase
{
    private readonly GetFuncionarioHandler _handler;

    public GetFuncionarioController(GetFuncionarioHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Obter funcionário por ID
    /// </summary>
    /// <param name="id">ID do funcionário</param>
    /// <returns>Funcionário encontrado</returns>
    /// <response code="200">Funcionário retornado com sucesso</response>
    /// <response code="404">Funcionário não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<FuncionarioResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(string id)
    {
        var funcionario = await _handler.Handle(id);

        var response = new FuncionarioResponseDto
        {
            Id = funcionario.Id,
            NomeCompleto = funcionario.NomeCompleto,
            Username = funcionario.Username,
            ContatoWhatsApp = funcionario.ContatoWhatsApp,
            ContatoWeChat = funcionario.ContatoWeChat,
            Email = funcionario.Email,
            Setor = funcionario.Setor,
            Cargo = funcionario.Cargo,
            CreatedAt = funcionario.CreatedAt,
            UpdatedAt = funcionario.UpdatedAt
        };

        return Ok(ApiResponse<FuncionarioResponseDto>.Ok(response));
    }
}
