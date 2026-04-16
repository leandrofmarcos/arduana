using Comex133Api.Core.Models;
using Comex133Api.Features.Parametros;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ParametrosController : ControllerBase
{
    private readonly ParametroService _service;
    private readonly IValidator<CreateParametroRequest> _createValidator;
    private readonly IValidator<UpdateParametroRequest> _updateValidator;
    private readonly ILogger<ParametrosController> _logger;

    public ParametrosController(
        ParametroService service,
        IValidator<CreateParametroRequest> createValidator,
        IValidator<UpdateParametroRequest> updateValidator,
        ILogger<ParametrosController> logger)
    {
        _service = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _logger = logger;
    }

    /// <summary>Lista todos os parâmetros do sistema.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(ApiResponse.Ok(items));
    }

    /// <summary>Busca um parâmetro pelo ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        return Ok(ApiResponse.Ok(item));
    }

    /// <summary>Cria um novo parâmetro.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateParametroRequest request)
    {
        var validation = await _createValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            var errors = validation.Errors
                .Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage })
                .ToList();
            return BadRequest(ApiResponse.ValidationError(errors));
        }

        var created = await _service.CreateAsync(request);
        _logger.LogInformation("Parâmetro criado: {Chave}", created.Chave);
        return StatusCode(201, ApiResponse.Created(created));
    }

    /// <summary>Atualiza um parâmetro existente.</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateParametroRequest request)
    {
        var validation = await _updateValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            var errors = validation.Errors
                .Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage })
                .ToList();
            return BadRequest(ApiResponse.ValidationError(errors));
        }

        var updated = await _service.UpdateAsync(id, request);
        _logger.LogInformation("Parâmetro atualizado: {Id} → {Chave}", id, updated.Chave);
        return Ok(ApiResponse.Ok(updated, "Parâmetro atualizado com sucesso"));
    }

    /// <summary>Exclui um parâmetro pelo ID.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        _logger.LogInformation("Parâmetro excluído: {Id}", id);
        return Ok(ApiResponse.Ok(null, "Parâmetro excluído com sucesso"));
    }
}
