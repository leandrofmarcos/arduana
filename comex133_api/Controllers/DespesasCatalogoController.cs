using Comex133Api.Core.Models;
using Comex133Api.Features.DespesasCatalogo;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/despesas-catalogo")]
[Authorize(Roles = "Administrador,Gerente,Analista")]
public class DespesasCatalogoController : ControllerBase
{
    private readonly DespesasCatalogoService                   _service;
    private readonly IValidator<CreateDespesaCatalogoRequest>  _createValidator;
    private readonly IValidator<UpdateDespesaCatalogoRequest>  _updateValidator;

    public DespesasCatalogoController(
        DespesasCatalogoService service,
        IValidator<CreateDespesaCatalogoRequest> createValidator,
        IValidator<UpdateDespesaCatalogoRequest> updateValidator)
    {
        _service         = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery pagination) =>
        Ok(ApiResponse.Ok(await _service.GetAllAsync(pagination)));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) =>
        Ok(ApiResponse.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Create([FromBody] CreateDespesaCatalogoRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return StatusCode(201, ApiResponse.Created(await _service.CreateAsync(request)));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDespesaCatalogoRequest request)
    {
        var v = await _updateValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.UpdateAsync(id, request)));
    }

    [HttpPatch("{id:int}/ativo")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> SetAtivo(int id, [FromBody] AtivoRequest request)
    {
        await _service.SetAtivoAsync(id, request.Ativo);
        return Ok(ApiResponse.Ok(message: $"Despesa Catálogo {(request.Ativo ? "ativada" : "desativada")} com sucesso."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Despesa Catálogo removida com sucesso."));
    }
}


