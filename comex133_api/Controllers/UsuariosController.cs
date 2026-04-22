using System.Security.Claims;
using Comex133Api.Core.Models;
using Comex133Api.Features.Usuarios;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize(Roles = "Administrador")]
public class UsuariosController : ControllerBase
{
    private readonly UsuarioService                        _service;
    private readonly IValidator<CreateUsuarioRequest>      _createValidator;
    private readonly IValidator<UpdateUsuarioRequest>      _updateValidator;
    private readonly IValidator<AlterarSenhaRequest>       _senhaValidator;

    public UsuariosController(
        UsuarioService service,
        IValidator<CreateUsuarioRequest>  createValidator,
        IValidator<UpdateUsuarioRequest>  updateValidator,
        IValidator<AlterarSenhaRequest>   senhaValidator)
    {
        _service         = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _senhaValidator  = senhaValidator;
    }

    /// <summary>Lista todos os usuários.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery pagination)
    {
        var items = await _service.GetAllAsync(pagination);
        return Ok(ApiResponse.Ok(items));
    }

    /// <summary>Busca um usuário pelo ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        return Ok(ApiResponse.Ok(item));
    }

    /// <summary>Cria um novo usuário.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUsuarioRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var created = await _service.CreateAsync(request);
        return StatusCode(201, ApiResponse.Created(created));
    }

    /// <summary>Atualiza o nome do usuário.</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUsuarioRequest request)
    {
        var v = await _updateValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var updated = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse.Ok(updated));
    }

    /// <summary>Altera a senha do próprio usuário autenticado.</summary>
    [HttpPatch("me/senha")]
    [Authorize] // qualquer usuário autenticado
    public async Task<IActionResult> AlterarMinhaSenha([FromBody] AlterarSenhaRequest request)
    {
        var v = await _senhaValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!int.TryParse(sub, out var usuarioId))
            return Unauthorized();

        await _service.AlterarSenhaAsync(usuarioId, request);
        return Ok(ApiResponse.Ok(message: "Senha alterada com sucesso."));
    }

    /// <summary>Redefine a senha de um usuário (somente Admin).</summary>
    [HttpPatch("{id:int}/senha")]
    public async Task<IActionResult> AlterarSenhaAdmin(int id, [FromBody] AlterarSenhaAdminRequest request)
    {
        await _service.AlterarSenhaAdminAsync(id, request);
        return Ok(ApiResponse.Ok(message: "Senha redefinida com sucesso."));
    }

    /// <summary>Ativa ou desativa um usuário.</summary>
    [HttpPatch("{id:int}/ativo")]
    public async Task<IActionResult> SetAtivo(int id, [FromBody] AtivoRequest request)
    {
        await _service.SetAtivoAsync(id, request.Ativo);
        return Ok(ApiResponse.Ok(message: $"Usuário {(request.Ativo ? "ativado" : "desativado")} com sucesso."));
    }

    /// <summary>Define as roles do usuário (substitui as existentes).</summary>
    [HttpPut("{id:int}/roles")]
    public async Task<IActionResult> AtribuirRoles(int id, [FromBody] AtribuirRolesRequest request)
    {
        var updated = await _service.AtribuirRolesAsync(id, request);
        return Ok(ApiResponse.Ok(updated));
    }

    /// <summary>Remove um usuário.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Usuário removido com sucesso."));
    }
}
