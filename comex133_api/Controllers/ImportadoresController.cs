using Comex133Api.Core.Models;
using Comex133Api.Features.Importadores;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/importadores")]
[Authorize(Roles = "Administrador,Gerente,Analista")]
public class ImportadoresController : ControllerBase
{
    private readonly ImportadoresService                   _service;
    private readonly IValidator<CreateImportadorRequest>   _createValidator;
    private readonly IValidator<UpdateImportadorRequest>   _updateValidator;

    public ImportadoresController(
        ImportadoresService service,
        IValidator<CreateImportadorRequest> createValidator,
        IValidator<UpdateImportadorRequest> updateValidator)
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
    public async Task<IActionResult> Create([FromBody] CreateImportadorRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return StatusCode(201, ApiResponse.Created(await _service.CreateAsync(request)));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateImportadorRequest request)
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
        return Ok(ApiResponse.Ok(message: $"Importador {(request.Ativo ? "ativado" : "desativado")} com sucesso."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Importador removido com sucesso."));
    }
}


