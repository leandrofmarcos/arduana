using Comex133Api.Core.Models;
using Comex133Api.Features.Despachantes;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/despachantes")]
[Authorize(Roles = "Admin")]
public class DespachantesController : ControllerBase
{
    private readonly DespachantesService                   _service;
    private readonly IValidator<CreateDespachantRequest>   _createValidator;
    private readonly IValidator<UpdateDespachantRequest>   _updateValidator;

    public DespachantesController(
        DespachantesService service,
        IValidator<CreateDespachantRequest> createValidator,
        IValidator<UpdateDespachantRequest> updateValidator)
    {
        _service         = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(ApiResponse.Ok(await _service.GetAllAsync()));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) =>
        Ok(ApiResponse.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDespachantRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return StatusCode(201, ApiResponse.Created(await _service.CreateAsync(request)));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDespachantRequest request)
    {
        var v = await _updateValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.UpdateAsync(id, request)));
    }

    [HttpPatch("{id:int}/ativo")]
    public async Task<IActionResult> SetAtivo(int id, [FromBody] AtivoRequest request)
    {
        await _service.SetAtivoAsync(id, request.Ativo);
        return Ok(ApiResponse.Ok(message: $"Despachante {(request.Ativo ? "ativado" : "desativado")} com sucesso."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Despachante removido com sucesso."));
    }
}
