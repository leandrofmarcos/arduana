using Comex133Api.Core.Models;
using Comex133Api.Features.ModelosDespesa;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/modelos-despesa")]
[Authorize(Roles = "Administrador")]
public class ModelosDespesaController : ControllerBase
{
    private readonly ModelosDespesaService                   _service;
    private readonly IValidator<CreateModeloDespesaRequest>  _createValidator;
    private readonly IValidator<UpdateModeloDespesaRequest>  _updateValidator;

    public ModelosDespesaController(
        ModelosDespesaService service,
        IValidator<CreateModeloDespesaRequest> createValidator,
        IValidator<UpdateModeloDespesaRequest> updateValidator)
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
    public async Task<IActionResult> Create([FromBody] CreateModeloDespesaRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return StatusCode(201, ApiResponse.Created(await _service.CreateAsync(request)));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateModeloDespesaRequest request)
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
        return Ok(ApiResponse.Ok(message: $"Modelo de Despesa {(request.Ativo ? "ativado" : "desativado")} com sucesso."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Modelo de Despesa removido com sucesso."));
    }

    // Item management

    [HttpGet("{id:int}/itens")]
    public async Task<IActionResult> GetItens(int id, [FromQuery] PaginationQuery pagination) =>
        Ok(ApiResponse.Ok(await _service.GetItensAsync(id, pagination)));

    [HttpPost("{id:int}/itens")]
    public async Task<IActionResult> AddItem(int id, [FromBody] AddItemRequest request)
    {
        var item = await _service.AddItemAsync(id, request);
        return StatusCode(201, ApiResponse.Created(item));
    }

    [HttpDelete("{id:int}/itens/{despesaCatalogoId:int}")]
    public async Task<IActionResult> RemoveItem(int id, int despesaCatalogoId)
    {
        await _service.RemoveItemAsync(id, despesaCatalogoId);
        return Ok(ApiResponse.Ok(message: "Item removido do modelo com sucesso."));
    }
}


