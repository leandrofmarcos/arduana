using Comex133Api.Core.Models;
using Comex133Api.Features.Packlist;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/packlist")]
[Authorize(Roles = "Administrador,Gerente,Analista,Despachante")]
public class PacklistController : ControllerBase
{
    private readonly PacklistService _service;
    private readonly IValidator<SaveMapeamentoRequest> _mapeamentoValidator;

    public PacklistController(
        PacklistService service,
        IValidator<SaveMapeamentoRequest> mapeamentoValidator)
    {
        _service             = service;
        _mapeamentoValidator = mapeamentoValidator;
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Administrador,Gerente,Analista")]
    public async Task<IActionResult> Upload(
        IFormFile file,
        [FromQuery] int solicitacaoId,
        CancellationToken ct)
    {
        var result = await _service.UploadAsync(file, solicitacaoId, ct);
        return StatusCode(201, ApiResponse.Created(result));
    }

    [HttpPost("{id:int}/mapeamento")]
    [Authorize(Roles = "Administrador,Gerente,Analista")]
    public async Task<IActionResult> SaveMapeamento(
        int id,
        [FromBody] SaveMapeamentoRequest request,
        CancellationToken ct)
    {
        var validation = await _mapeamentoValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                validation.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        var result = await _service.SaveMapeamentoAsync(id, request, ct);
        return Ok(ApiResponse.Ok(result));
    }

    [HttpGet("solicitacao/{solicitacaoId:int}")]
    public async Task<IActionResult> GetBySolicitacao(int solicitacaoId, CancellationToken ct)
    {
        var result = await _service.GetBySolicitacaoAsync(solicitacaoId, ct);
        return Ok(ApiResponse.Ok(result));
    }

    [HttpGet("{id:int}/itens")]
    public async Task<IActionResult> GetItens(
        int id,
        [FromQuery] PaginationQuery pagination,
        [FromQuery] string? filtroNcm,
        CancellationToken ct)
    {
        var result = await _service.GetItensAsync(id, pagination, filtroNcm, ct);
        return Ok(ApiResponse.Ok(result));
    }

    [HttpGet("{id:int}/arquivo")]
    public async Task<IActionResult> DownloadArquivo(int id, CancellationToken ct)
    {
        var file = await _service.GetArquivoAsync(id, ct);
        if (file is null)
            return NotFound(ApiResponse.Ok(message: "Arquivo não encontrado no servidor."));

        var (path, nomeArquivo) = file.Value;
        var contentType = Path.GetExtension(nomeArquivo).ToLowerInvariant() switch
        {
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".xls"  => "application/vnd.ms-excel",
            _       => "text/csv"
        };

        var stream = System.IO.File.OpenRead(path);
        return File(stream, contentType, nomeArquivo);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador,Gerente,Analista")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return Ok(ApiResponse.Ok(message: "Packlist removido com sucesso."));
    }
}
