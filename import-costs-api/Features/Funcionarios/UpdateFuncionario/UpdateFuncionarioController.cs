using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Funcionarios.UpdateFuncionario;

/// <summary>
/// Controller para atualização de funcionário
/// </summary>
[ApiController]
[Tags("Funcionários")]
[Route("api/funcionarios")]
public class UpdateFuncionarioController : ControllerBase
{
    private readonly UpdateFuncionarioHandler _handler;

    public UpdateFuncionarioController(UpdateFuncionarioHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Atualizar um funcionário existente
    /// </summary>
    /// <param name="id">ID do funcionário a ser atualizado</param>
    /// <param name="dto">Dados atualizados do funcionário</param>
    /// <returns>Funcionário atualizado com sucesso</returns>
    /// <response code="200">Funcionário atualizado com sucesso</response>
    /// <response code="400">Erro de validação ou funcionário duplicado</response>
    /// <response code="404">Funcionário não encontrado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<FuncionarioResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateFuncionarioDto dto)
    {
        var funcionario = await _handler.Handle(id, dto);

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

        return Ok(ApiResponse<FuncionarioResponseDto>.Ok(response, "Funcionário atualizado com sucesso"));
    }
}
