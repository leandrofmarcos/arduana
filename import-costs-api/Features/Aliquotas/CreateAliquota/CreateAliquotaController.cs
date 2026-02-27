using ImportCostsApi.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.Aliquotas.CreateAliquota;

/// <summary>
/// Controller para criação de perfil de alíquotas
/// </summary>
[ApiController]
[Route("api/aliquotas")]
public class CreateAliquotaController : ControllerBase
{
    private readonly CreateAliquotaHandler _handler;

    public CreateAliquotaController(CreateAliquotaHandler handler)
    {
        _handler = handler;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<AliquotaResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Create([FromBody] CreateAliquotaDto dto)
    {
        var perfil = await _handler.Handle(dto);

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

        return StatusCode(
            StatusCodes.Status201Created,
            ApiResponse<AliquotaResponseDto>.Created(response, "Perfil de alíquotas criado com sucesso"));
    }
}
