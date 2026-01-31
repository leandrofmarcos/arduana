using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Aliquotas.GetAliquotaPadrao;

/// <summary>
/// Controller para obter o perfil de alíquotas padrão
/// </summary>
[ApiController]
[Route("api/aliquotas")]
public class GetAliquotaPadraoController : ControllerBase
{
    private readonly GetAliquotaPadraoHandler _handler;

    public GetAliquotaPadraoController(GetAliquotaPadraoHandler handler)
    {
        _handler = handler;
    }

    [HttpGet("padrao")]
    [ProducesResponseType(typeof(ApiResponse<AliquotaResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetPadrao()
    {
        var perfil = await _handler.Handle();

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
