using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Funcionarios.GetFuncionarios;

/// <summary>
/// Controller para obter lista de funcionários
/// </summary>
[ApiController]
[Tags("Funcionários")]
[Route("api/funcionarios")]
public class GetFuncionariosController : ControllerBase
{
    private readonly GetFuncionariosHandler _handler;

    public GetFuncionariosController(GetFuncionariosHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Obter lista de funcionários com paginação
    /// </summary>
    /// <param name="pageNumber">Número da página (padrão: 1)</param>
    /// <param name="pageSize">Tamanho da página (padrão: 10)</param>
    /// <returns>Lista paginada de funcionários</returns>
    /// <response code="200">Lista de funcionários retornada com sucesso</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<FuncionarioResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _handler.Handle(pageNumber, pageSize);

        var response = new PagedResult<FuncionarioResponseDto>(
            result.Items.Select(f => new FuncionarioResponseDto
            {
                Id = f.Id,
                NomeCompleto = f.NomeCompleto,
                Username = f.Username,
                ContatoWhatsApp = f.ContatoWhatsApp,
                ContatoWeChat = f.ContatoWeChat,
                Email = f.Email,
                Setor = f.Setor,
                Cargo = f.Cargo,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            }).ToList(),
            result.TotalCount,
            result.PageNumber,
            result.PageSize
        );

        return Ok(ApiResponse<PagedResult<FuncionarioResponseDto>>.Ok(response));
    }
}
