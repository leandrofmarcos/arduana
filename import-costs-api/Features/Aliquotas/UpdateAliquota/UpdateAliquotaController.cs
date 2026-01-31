using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Aliquotas.UpdateAliquota;

/// <summary>
/// Controller para atualização de perfil de alíquotas
/// </summary>
[ApiController]
[Route("api/aliquotas")]
public class UpdateAliquotaController : ControllerBase
{
    private readonly UpdateAliquotaHandler _handler;

    public UpdateAliquotaController(UpdateAliquotaHandler handler)
    {
        _handler = handler;
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<AliquotaResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateAliquotaDto dto)
    {
        var perfil = await _handler.Handle(id, dto);

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

        return Ok(ApiResponse<AliquotaResponseDto>.Ok(response, "Perfil de alíquotas atualizado com sucesso"));
    }
}
