using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Aliquotas.GetAliquota;

/// <summary>
/// Controller para obter perfil de alíquotas por ID
/// </summary>
[ApiController]
[Route("api/aliquotas")]
public class GetAliquotaController : ControllerBase
{
    private readonly GetAliquotaHandler _handler;

    public GetAliquotaController(GetAliquotaHandler handler)
    {
        _handler = handler;
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<AliquotaResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(string id)
    {
        var perfil = await _handler.Handle(id);

        var response = new AliquotaResponseDto
        {
            Id = perfil.Id,
            Nome = perfil.Nome,
            Descricao = perfil.Descricao,
            II = perfil.II,
            IPI = perfil.IPI,
            ICMS = perfil.ICMS,
            PIS = perfil.PIS,
            COFINS = perfil.COFINS,
            Padrao = perfil.Padrao,
            CreatedAt = perfil.CreatedAt
        };

        return Ok(ApiResponse<AliquotaResponseDto>.Ok(response));
    }
}
