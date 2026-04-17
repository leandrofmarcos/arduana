using Comex133Api.Core.Models;
using Comex133Api.Features.SolicitacoesOrcamento;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/solicitacoes-orcamento")]
[Authorize(Roles = "Admin")]
public class SolicitacoesOrcamentoController : ControllerBase
{
    private readonly SolicitacoesOrcamentoService _service;
    private readonly IValidator<CreateSolicitacaoOrcamentoRequest> _createValidator;
    private readonly IValidator<UpdateSolicitacaoOrcamentoRequest> _updateValidator;
    private readonly IValidator<UpdateSolicitacaoOrcamentoStatusRequest> _statusValidator;
    private readonly IValidator<AddSolicitacaoDespachanteRequest> _addDespachanteValidator;
    private readonly IValidator<AddSolicitacaoDocumentoRequest> _addDocumentoValidator;

    public SolicitacoesOrcamentoController(
        SolicitacoesOrcamentoService service,
        IValidator<CreateSolicitacaoOrcamentoRequest> createValidator,
        IValidator<UpdateSolicitacaoOrcamentoRequest> updateValidator,
        IValidator<UpdateSolicitacaoOrcamentoStatusRequest> statusValidator,
        IValidator<AddSolicitacaoDespachanteRequest> addDespachanteValidator,
        IValidator<AddSolicitacaoDocumentoRequest> addDocumentoValidator)
    {
        _service = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _statusValidator = statusValidator;
        _addDespachanteValidator = addDespachanteValidator;
        _addDocumentoValidator = addDocumentoValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery pagination) =>
        Ok(ApiResponse.Ok(await _service.GetAllAsync(pagination)));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id) =>
        Ok(ApiResponse.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSolicitacaoOrcamentoRequest request)
    {
        var validation = await _createValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                validation.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.CreateAsync(request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSolicitacaoOrcamentoRequest request)
    {
        var validation = await _updateValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                validation.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return Ok(ApiResponse.Ok(await _service.UpdateAsync(id, request)));
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, [FromBody] UpdateSolicitacaoOrcamentoStatusRequest request)
    {
        var validation = await _statusValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                validation.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        await _service.UpdateStatusAsync(id, request.Status);
        return Ok(ApiResponse.Ok(message: "Status da solicitação atualizado com sucesso."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse.Ok(message: "Solicitação removida com sucesso."));
    }

    [HttpGet("{id:int}/despachantes")]
    public async Task<IActionResult> GetDespachantes(int id) =>
        Ok(ApiResponse.Ok(await _service.GetDespachantesAsync(id)));

    [HttpPost("{id:int}/despachantes")]
    public async Task<IActionResult> AddDespachante(int id, [FromBody] AddSolicitacaoDespachanteRequest request)
    {
        var validation = await _addDespachanteValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                validation.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.AddDespachanteAsync(id, request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpDelete("{id:int}/despachantes/{solicitacaoDespachanteId:int}")]
    public async Task<IActionResult> RemoveDespachante(int id, int solicitacaoDespachanteId)
    {
        await _service.RemoveDespachanteAsync(id, solicitacaoDespachanteId);
        return Ok(ApiResponse.Ok(message: "Despachante removido da solicitação com sucesso."));
    }

    [HttpGet("{id:int}/documentos")]
    public async Task<IActionResult> GetDocumentos(int id) =>
        Ok(ApiResponse.Ok(await _service.GetDocumentosAsync(id)));

    [HttpPost("{id:int}/documentos")]
    public async Task<IActionResult> AddDocumento(int id, [FromBody] AddSolicitacaoDocumentoRequest request)
    {
        var validation = await _addDocumentoValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                validation.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.AddDocumentoAsync(id, request);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpDelete("{id:int}/documentos/{documentoId:int}")]
    public async Task<IActionResult> RemoveDocumento(int id, int documentoId)
    {
        await _service.RemoveDocumentoAsync(id, documentoId);
        return Ok(ApiResponse.Ok(message: "Documento removido da solicitação com sucesso."));
    }
}
