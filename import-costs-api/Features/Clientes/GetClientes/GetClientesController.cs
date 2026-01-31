using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Clientes.GetClientes;

/// <summary>
/// Controller para listar clientes
/// </summary>
[ApiController]
[Tags("Clientes")]
[Route("api/clientes")]
public class GetClientesController : ControllerBase
{
    private readonly GetClientesHandler _handler;

    public GetClientesController(GetClientesHandler handler)
    {
        _handler = handler;
    }

    /// <summary>
    /// Listar todos os clientes com paginação
    /// </summary>
    /// <param name="pageNumber">Número da página (padrão: 1)</param>
    /// <param name="pageSize">Quantidade de itens por página (padrão: 10, máximo: 100)</param>
    /// <returns>Lista paginada de clientes</returns>
    /// <response code="200">Lista de clientes retornada com sucesso</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ClienteResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _handler.Handle(pageNumber, pageSize);

        var clientes = result.Items.Select(c => new ClienteResponseDto
        {
            Id = c.Id,
            Nome = c.Nome,
            Documento = c.Documento,
            Contato = c.Contato,
            TemplatePacklistId = c.TemplatePacklistId,
            CreatedAt = c.CreatedAt
        }).ToList();

        var pagedResult = new PagedResult<ClienteResponseDto>
        {
            Items = clientes,
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize = result.PageSize
        };

        return Ok(ApiResponse<PagedResult<ClienteResponseDto>>.Ok(pagedResult, "Clientes listados com sucesso"));
    }
}
