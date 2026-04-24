using Comex133Api.Core.Models;
using Comex133Api.Features.CustosDespachante;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/custos-despachante")]
[Authorize(Roles = "Administrador,Gerente,Analista,Despachante")]
public class CustoDespachanteController : ControllerBase
{
    private readonly CustosDespachanteService _service;
    private readonly IValidator<CreateCustoDespachanteRequest> _createValidator;
    private readonly IValidator<UpdateCustoDespachanteRequest> _updateValidator;
    private readonly IValidator<UpsertCustoDespachanteLiRequest> _liValidator;
    private readonly IValidator<UpsertCustoDespachanteDespesaRequest> _despesaValidator;
    private readonly IValidator<UpsertNcmVinculadoCustoRequest> _ncmValidator;
    private readonly IValidator<UpsertValorImpostoCustoRequest> _valorImpostoValidator;

    public CustoDespachanteController(
        CustosDespachanteService service,
        IValidator<CreateCustoDespachanteRequest> createValidator,
        IValidator<UpdateCustoDespachanteRequest> updateValidator,
        IValidator<UpsertCustoDespachanteLiRequest> liValidator,
        IValidator<UpsertCustoDespachanteDespesaRequest> despesaValidator,
        IValidator<UpsertNcmVinculadoCustoRequest> ncmValidator,
        IValidator<UpsertValorImpostoCustoRequest> valorImpostoValidator)
    {
        _service              = service;
        _createValidator      = createValidator;
        _updateValidator      = updateValidator;
        _liValidator          = liValidator;
        _despesaValidator     = despesaValidator;
        _ncmValidator         = ncmValidator;
        _valorImpostoValidator = valorImpostoValidator;
    }

    // ── CRUD principal ────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery pagination, [FromQuery] int? solicitacaoOrcamentoId) =>
        Ok(ApiResponse.Ok(await _service.GetAllAsync(pagination, solicitacaoOrcamentoId)));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) =>
        Ok(ApiResponse.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    [Authorize(Roles = "Administrador,Gerente,Analista,Despachante")]
    public async Task<IActionResult> Create([FromBody] CreateCustoDespachanteRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.CreateAsync(request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustoDespachanteRequest request)
    {
        var v = await _updateValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.UpdateAsync(id, request)));
    }

    // ── Transições de status ──────────────────────────────────────────────────

    [HttpPatch("{id:int}/iniciar")]
    public async Task<IActionResult> Iniciar(int id) =>
        Ok(ApiResponse.Ok(await _service.IniciarAsync(id)));

    [HttpPatch("{id:int}/finalizar")]
    public async Task<IActionResult> Finalizar(int id) =>
        Ok(ApiResponse.Ok(await _service.FinalizarAsync(id)));

    [HttpPatch("{id:int}/reabrir")]
    public async Task<IActionResult> Reabrir(int id) =>
        Ok(ApiResponse.Ok(await _service.ReabrirAsync(id)));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador,Gerente,Analista,Despachante")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Custo excluído com sucesso."));
    }

    // ── LIs ───────────────────────────────────────────────────────────────────

    [HttpPost("{id:int}/lis")]
    public async Task<IActionResult> AddLi(int id, [FromBody] UpsertCustoDespachanteLiRequest request)
    {
        var v = await _liValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.AddLiAsync(id, request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpPut("{id:int}/lis/{liId:int}")]
    public async Task<IActionResult> UpdateLi(int id, int liId, [FromBody] UpsertCustoDespachanteLiRequest request)
    {
        var v = await _liValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.UpdateLiAsync(id, liId, request)));
    }

    [HttpDelete("{id:int}/lis/{liId:int}")]
    public async Task<IActionResult> DeleteLi(int id, int liId)
    {
        await _service.DeleteLiAsync(id, liId);
        return Ok(ApiResponse.Ok(message: "LI removida com sucesso."));
    }

    // ── Despesas ──────────────────────────────────────────────────────────────

    [HttpPost("{id:int}/despesas")]
    public async Task<IActionResult> AddDespesa(int id, [FromBody] UpsertCustoDespachanteDespesaRequest request)
    {
        var v = await _despesaValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.AddDespesaAsync(id, request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpPut("{id:int}/despesas/{despesaId:int}")]
    public async Task<IActionResult> UpdateDespesa(int id, int despesaId, [FromBody] UpsertCustoDespachanteDespesaRequest request)
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

    // ── NCMs ──────────────────────────────────────────────────────────────────

    [HttpPost("{id:int}/ncms")]
    public async Task<IActionResult> AddNcm(int id, [FromBody] UpsertNcmVinculadoCustoRequest request)
    {
        var v = await _ncmValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.AddNcmAsync(id, request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpPut("{id:int}/ncms/{ncmId:int}")]
    public async Task<IActionResult> UpdateNcm(int id, int ncmId, [FromBody] UpsertNcmVinculadoCustoRequest request)
    {
        var v = await _ncmValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.UpdateNcmAsync(id, ncmId, request)));
    }

    [HttpDelete("{id:int}/ncms/{ncmId:int}")]
    public async Task<IActionResult> DeleteNcm(int id, int ncmId)
    {
        await _service.DeleteNcmAsync(id, ncmId);
        return Ok(ApiResponse.Ok(message: "NCM removido com sucesso."));
    }

    // ── Valores de imposto ────────────────────────────────────────────────────

    [HttpPost("{id:int}/ncms/{ncmId:int}/valores-imposto")]
    public async Task<IActionResult> AddValorImposto(int id, int ncmId, [FromBody] UpsertValorImpostoCustoRequest request)
    {
        var v = await _valorImpostoValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.AddValorImpostoAsync(id, ncmId, request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpDelete("{id:int}/ncms/{ncmId:int}/valores-imposto/{valorId:int}")]
    public async Task<IActionResult> DeleteValorImposto(int id, int ncmId, int valorId)
    {
        await _service.DeleteValorImpostoAsync(id, ncmId, valorId);
        return Ok(ApiResponse.Ok(message: "Valor de imposto removido com sucesso."));
    }
}
