using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Funcionarios.CreateFuncionario;

/// <summary>
/// Controller para criação de funcionário
/// </summary>
[ApiController]
[Tags("Funcionários")]
[Route("api/funcionarios")]
public class CreateFuncionarioController : ControllerBase
{
    private readonly CreateFuncionarioHandler _handler;

    public CreateFuncionarioController(CreateFuncionarioHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Criar um novo funcionário
    /// </summary>
    /// <param name="dto">Dados do funcionário a ser criado</param>
    /// <returns>Funcionário criado com sucesso</returns>
    /// <response code="201">Funcionário criado com sucesso</response>
    /// <response code="400">Erro de validação ou funcionário duplicado</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<FuncionarioResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Create([FromBody] CreateFuncionarioDto dto)
    {
        var funcionario = await _handler.Handle(dto);

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

        return CreatedAtAction(
            "GetById",
            new { id = funcionario.Id, controller = "Funcionarios" },
            ApiResponse<FuncionarioResponseDto>.Created(response, $"Funcionário criado com sucesso"));
    }
}
