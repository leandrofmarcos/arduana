using Comex133Api.Core.Models;
using Comex133Api.Features.UsuarioVinculos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/usuario-vinculos")]
[Authorize(Roles = "Administrador")]
public class UsuarioVinculosController : ControllerBase
{
    private readonly UsuarioVinculosService _service;

    public UsuarioVinculosController(UsuarioVinculosService service) =>
        _service = service;

    [HttpGet("usuario/{usuarioId:int}")]
    public async Task<IActionResult> GetByUsuario(int usuarioId) =>
        Ok(ApiResponse.Ok(await _service.GetByUsuarioAsync(usuarioId)));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) =>
        Ok(ApiResponse.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUsuarioVinculoRequest request) =>
        StatusCode(201, ApiResponse.Created(await _service.CreateAsync(request)));

    [HttpPatch("{id:int}/ativo")]
    public async Task<IActionResult> SetAtivo(int id, [FromBody] UpdateUsuarioVinculoAtivoRequest request)
    {
        var result = await _service.SetAtivoAsync(id, request.Ativo);
        return Ok(ApiResponse.Ok(result));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Vínculo removido com sucesso."));
    }
}
