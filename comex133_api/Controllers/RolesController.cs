using Comex133Api.Core.Models;
using Comex133Api.Features.Roles;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly RoleService                    _service;
    private readonly IValidator<CreateRoleRequest>  _createValidator;
    private readonly IValidator<UpdateRoleRequest>  _updateValidator;

    public RolesController(
        RoleService service,
        IValidator<CreateRoleRequest> createValidator,
        IValidator<UpdateRoleRequest> updateValidator)
    {
        _service         = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    /// <summary>Lista todas as roles.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery pagination)
    {
        var items = await _service.GetAllAsync(pagination);
        return Ok(ApiResponse.Ok(items));
    }

    /// <summary>Busca uma role pelo ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        return Ok(ApiResponse.Ok(item));
    }

    /// <summary>Cria uma nova role.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var created = await _service.CreateAsync(request);
        return StatusCode(201, ApiResponse.Created(created));
    }

    /// <summary>Atualiza uma role.</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRoleRequest request)
    {
        var v = await _updateValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var updated = await _service.UpdateAsync(id, request);
        return Ok(ApiResponse.Ok(updated));
    }

    /// <summary>Remove uma role.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Role removida com sucesso."));
    }
}
