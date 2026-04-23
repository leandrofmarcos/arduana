using Comex133Api.Core.Models;
using Comex133Api.Features.Navios;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/navios")]
[Authorize(Roles = "Administrador,Gerente,Analista")]
public class NaviosController : ControllerBase
{
    private readonly NaviosService                          _service;
    private readonly IValidator<CreateNavioRequest>         _createValidator;
    private readonly IValidator<UpdateNavioRequest>         _updateValidator;
    private readonly IValidator<CreateNavioTrajetoRequest>  _createTrajetoValidator;
    private readonly IValidator<UpdateNavioTrajetoRequest>  _updateTrajetoValidator;

    public NaviosController(
        NaviosService service,
        IValidator<CreateNavioRequest> createValidator,
        IValidator<UpdateNavioRequest> updateValidator,
        IValidator<CreateNavioTrajetoRequest> createTrajetoValidator,
        IValidator<UpdateNavioTrajetoRequest> updateTrajetoValidator)
    {
        _service                = service;
        _createValidator        = createValidator;
        _updateValidator        = updateValidator;
        _createTrajetoValidator = createTrajetoValidator;
        _updateTrajetoValidator = updateTrajetoValidator;
    }

    // ── Navios ────────────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery pagination, [FromQuery] bool? ativo = null) =>
        Ok(ApiResponse.Ok(await _service.GetAllAsync(pagination, ativo)));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) =>
        Ok(ApiResponse.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Create([FromBody] CreateNavioRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return StatusCode(201, ApiResponse.Created(await _service.CreateAsync(request)));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateNavioRequest request)
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
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    // ── NavioTrajeto (pernas) ─────────────────────────────────────────────────

    [HttpGet("{navioId:int}/trajetos")]
    public async Task<IActionResult> GetTrajetos(int navioId) =>
        Ok(ApiResponse.Ok(await _service.GetTrajetosAsync(navioId)));

    [HttpPost("{navioId:int}/trajetos")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> AddTrajeto(int navioId, [FromBody] CreateNavioTrajetoRequest request)
    {
        var v = await _createTrajetoValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return StatusCode(201, ApiResponse.Created(await _service.AddTrajetoAsync(navioId, request)));
    }

    [HttpPatch("{navioId:int}/trajetos")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> ReplaceTrajetos(int navioId, [FromBody] IList<CreateNavioTrajetoRequest> requests)
    {
        var payload = requests ?? new List<CreateNavioTrajetoRequest>();

        foreach (var req in payload)
        {
            var v = await _createTrajetoValidator.ValidateAsync(req);
            if (!v.IsValid)
            {
                return BadRequest(ApiResponse.ValidationError(
                    v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));
            }
        }

        return Ok(ApiResponse.Ok(await _service.ReplaceTrajetosAsync(navioId, payload)));
    }

    [HttpPut("{navioId:int}/trajetos/{id:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> UpdateTrajeto(int navioId, int id, [FromBody] UpdateNavioTrajetoRequest request)
    {
        var v = await _updateTrajetoValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.UpdateTrajetoAsync(navioId, id, request)));
    }

    [HttpPatch("{navioId:int}/trajetos/{id:int}/status")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> UpdateTrajetoStatus(int navioId, int id, [FromBody] UpdateNavioTrajetoStatusRequest request)
    {
        return Ok(ApiResponse.Ok(await _service.UpdateTrajetoStatusAsync(navioId, id, request.StatusPerna)));
    }

    [HttpDelete("{navioId:int}/trajetos/{id:int}")]
    [Authorize(Roles = "Administrador,Gerente")]
    public async Task<IActionResult> DeleteTrajeto(int navioId, int id)
    {
        await _service.DeleteTrajetoAsync(navioId, id);
        return NoContent();
    }
}
