using Comex133Api.Core.Models;
using Comex133Api.Features.ControleNavios;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/controle-navios")]
[Authorize(Roles = "Administrador,Gerente,Analista")]
public class ControleNaviosController : ControllerBase
{
    private readonly ControleNaviosService                              _service;
    private readonly IValidator<CreateControleNavioRequest>             _createValidator;
    private readonly IValidator<UpdateControleNavioRequest>             _updateValidator;
    private readonly IValidator<UpsertControleNavioTrajetoRequest>      _trajetoValidator;

    public ControleNaviosController(
        ControleNaviosService service,
        IValidator<CreateControleNavioRequest> createValidator,
        IValidator<UpdateControleNavioRequest> updateValidator,
        IValidator<UpsertControleNavioTrajetoRequest> trajetoValidator)
    {
        _service          = service;
        _createValidator  = createValidator;
        _updateValidator  = updateValidator;
        _trajetoValidator = trajetoValidator;
    }

    // ── Navios ──────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery pagination) =>
        Ok(ApiResponse.Ok(await _service.GetAllAsync(pagination)));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) =>
        Ok(ApiResponse.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Create([FromBody] CreateControleNavioRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return StatusCode(201, ApiResponse.Created(await _service.CreateAsync(request)));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateControleNavioRequest request)
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
        return Ok(ApiResponse.Ok(message: $"Controle de Navio {(request.Ativo ? "ativado" : "desativado")} com sucesso."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Controle de Navio removido com sucesso."));
    }

    // ── Trajetos ─────────────────────────────────────────────────────────

    [HttpGet("trajetos")]
    public async Task<IActionResult> GetAllTrajetos([FromQuery] PaginationQuery pagination) =>
        Ok(ApiResponse.Ok(await _service.GetAllTrajetosAsync(pagination)));

    [HttpGet("{id:int}/trajetos")]
    public async Task<IActionResult> GetTrajetos(int id) =>
        Ok(ApiResponse.Ok(await _service.GetTrajetosByNavioAsync(id)));

    [HttpPost("{id:int}/trajetos")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> AddTrajeto(int id, [FromBody] UpsertControleNavioTrajetoRequest request)
    {
        var v = await _trajetoValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return StatusCode(201, ApiResponse.Created(await _service.AddTrajetoAsync(id, request)));
    }

    [HttpPatch("{id:int}/trajetos")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> ReplaceTrajetos(int id, [FromBody] IList<UpsertControleNavioTrajetoRequest> requests)
    {
        foreach (var req in requests)
        {
            var v = await _trajetoValidator.ValidateAsync(req);
            if (!v.IsValid)
                return BadRequest(ApiResponse.ValidationError(
                    v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));
        }

        return Ok(ApiResponse.Ok(await _service.ReplaceTrajetosAsync(id, requests)));
    }

    [HttpDelete("{id:int}/trajetos/{trajetoId:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> DeleteTrajeto(int id, int trajetoId)
    {
        await _service.DeleteTrajetoAsync(id, trajetoId);
        return Ok(ApiResponse.Ok(message: "Trajeto removido com sucesso."));
    }
}
