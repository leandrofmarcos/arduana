using Comex133Api.Core.Models;
using Comex133Api.Features.Navios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/logistica")]
[Authorize(Roles = "Administrador,Gerente,Analista,Despachante")]
public class LogisticaController : ControllerBase
{
    private readonly NaviosService _service;

    public LogisticaController(NaviosService service) => _service = service;

    /// <summary>
    /// Retorna navios com embarques ativos, trajetos e posição atual no porto.
    /// Somente navios com ao menos 1 embarque ativo vinculado são incluídos.
    /// Para Despachante, retorna apenas navios com embarques associados ao próprio despachante.
    /// </summary>
    [HttpGet("controle-navios")]
    public async Task<IActionResult> GetControleNavios() =>
        Ok(ApiResponse.Ok(await _service.GetControleNaviosOperacionalAsync()));
}
