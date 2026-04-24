using Comex133Api.Core.Models;
using Comex133Api.Features.OrcamentosVenda;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/orcamentos-venda")]
[Authorize(Roles = "Administrador,Gerente,Analista")]
public class OrcamentosVendaController : ControllerBase
{
    private readonly OrcamentosVendaService _service;
    private readonly IValidator<CreateOrcamentoVendaRequest> _createValidator;
    private readonly IValidator<UpdateOrcamentoVendaRequest> _updateValidator;
    private readonly IValidator<UpsertOrcamentoVendaDespesaRequest> _despesaValidator;
    private readonly IValidator<SolicitarReaberturaRequest> _reaberturaValidator;

    public OrcamentosVendaController(
        OrcamentosVendaService service,
        IValidator<CreateOrcamentoVendaRequest> createValidator,
        IValidator<UpdateOrcamentoVendaRequest> updateValidator,
        IValidator<UpsertOrcamentoVendaDespesaRequest> despesaValidator,
        IValidator<SolicitarReaberturaRequest> reaberturaValidator)
    {
        _service            = service;
        _createValidator    = createValidator;
        _updateValidator    = updateValidator;
        _despesaValidator   = despesaValidator;
        _reaberturaValidator = reaberturaValidator;
    }

    // ── CRUD principal ────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery pagination, [FromQuery] int? solicitacaoOrcamentoId) =>
        Ok(ApiResponse.Ok(await _service.GetAllAsync(pagination, solicitacaoOrcamentoId)));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) =>
        Ok(ApiResponse.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrcamentoVendaRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.CreateAsync(request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOrcamentoVendaRequest request)
    {
        var v = await _updateValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.UpdateAsync(id, request)));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Orçamento de venda excluído com sucesso."));
    }

    // ── Transições de status ──────────────────────────────────────────────────

    [HttpPatch("{id:int}/finalizar")]
    public async Task<IActionResult> Finalizar(int id) =>
        Ok(ApiResponse.Ok(await _service.FinalizarAsync(id)));

    [HttpPatch("{id:int}/cancelar")]
    public async Task<IActionResult> Cancelar(int id) =>
        Ok(ApiResponse.Ok(await _service.CancelarAsync(id)));

    [HttpPatch("{id:int}/reabrir")]
    public async Task<IActionResult> Reabrir(int id) =>
        Ok(ApiResponse.Ok(await _service.ReabrirAsync(id)));

    // ── Gestão de custos vinculados ───────────────────────────────────────────

    [HttpPost("{id:int}/custos")]
    public async Task<IActionResult> VincularCusto(int id, [FromBody] VincularCustoRequest request) =>
        StatusCode(201, ApiResponse.Created(await _service.VincularCustoAsync(id, request)));

    [HttpDelete("{id:int}/custos/{vinculoId:int}")]
    public async Task<IActionResult> DesvincularCusto(int id, int vinculoId)
    {
        await _service.DesvincularCustoAsync(id, vinculoId);
        return Ok(ApiResponse.Ok(message: "Custo desvinculado com sucesso."));
    }

    [HttpPatch("{id:int}/custos/{custoId:int}/cancelar")]
    public async Task<IActionResult> CancelarCusto(int id, int custoId)
    {
        await _service.CancelarCustoAsync(id, custoId);
        return Ok(ApiResponse.Ok(message: "Custo cancelado pelo orçamento de venda."));
    }

    [HttpPost("{id:int}/custos/{custoId:int}/solicitar-reabertura")]
    public async Task<IActionResult> SolicitarRreabertura(int id, int custoId, [FromBody] SolicitarReaberturaRequest request)
    {
        var v = await _reaberturaValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.SolicitarReaberturaCustoAsync(id, custoId, request)));
    }

    // ── Despesas ──────────────────────────────────────────────────────────────

    [HttpPost("{id:int}/despesas")]
    public async Task<IActionResult> AddDespesa(int id, [FromBody] UpsertOrcamentoVendaDespesaRequest request)
    {
        var v = await _despesaValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.AddDespesaAsync(id, request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpPut("{id:int}/despesas/{despesaId:int}")]
    public async Task<IActionResult> UpdateDespesa(int id, int despesaId, [FromBody] UpsertOrcamentoVendaDespesaRequest request)
    {
        var v = await _despesaValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.UpdateDespesaAsync(id, despesaId, request)));
    }

    [HttpDelete("{id:int}/despesas/{despesaId:int}")]
    public async Task<IActionResult> DeleteDespesa(int id, int despesaId)
    {
        await _service.DeleteDespesaAsync(id, despesaId);
        return Ok(ApiResponse.Ok(message: "Despesa removida com sucesso."));
    }

    // ── Despesas extras ───────────────────────────────────────────────────────

    [HttpPost("{id:int}/extras")]
    public async Task<IActionResult> AddExtra(int id, [FromBody] UpsertOrcamentoVendaDespesaRequest request)
    {
        var v = await _despesaValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.AddExtraAsync(id, request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpPut("{id:int}/extras/{extraId:int}")]
    public async Task<IActionResult> UpdateExtra(int id, int extraId, [FromBody] UpsertOrcamentoVendaDespesaRequest request)
    {
        var v = await _despesaValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.UpdateExtraAsync(id, extraId, request)));
    }

    [HttpDelete("{id:int}/extras/{extraId:int}")]
    public async Task<IActionResult> DeleteExtra(int id, int extraId)
    {
        await _service.DeleteExtraAsync(id, extraId);
        return Ok(ApiResponse.Ok(message: "Despesa extra removida com sucesso."));
    }
}
