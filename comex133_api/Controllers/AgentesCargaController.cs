using Comex133Api.Core.Models;
using Comex133Api.Features.AgentesCarga;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/agentes-carga")]
[Authorize(Roles = "Admin")]
public class AgentesCargaController : ControllerBase
{
    private readonly AgentesCargaService                   _service;
    private readonly IValidator<CreateAgenteCargaRequest>  _createValidator;
    private readonly IValidator<UpdateAgenteCargaRequest>  _updateValidator;

    public AgentesCargaController(
        AgentesCargaService service,
        IValidator<CreateAgenteCargaRequest> createValidator,
        IValidator<UpdateAgenteCargaRequest> updateValidator)
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
    public async Task<IActionResult> Create([FromBody] CreateAgenteCargaRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return StatusCode(201, ApiResponse.Created(await _service.CreateAsync(request)));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAgenteCargaRequest request)
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
        return Ok(ApiResponse.Ok(message: $"Agente de Carga {(request.Ativo ? "ativado" : "desativado")} com sucesso."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Agente de Carga removido com sucesso."));
    }
}
