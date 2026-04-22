using Comex133Api.Core.Models;
using Comex133Api.Features.Navios;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/embarques/{embarqueId:int}/navio-vinculo")]
[Authorize(Roles = "Administrador")]
public class EmbarqueNavioVinculoController : ControllerBase
{
    private readonly NaviosService                                  _service;
    private readonly IValidator<CreateEmbarqueNavioVinculoRequest>  _createValidator;

    public EmbarqueNavioVinculoController(
        NaviosService service,
        IValidator<CreateEmbarqueNavioVinculoRequest> createValidator)
    {
        _service         = service;
        _createValidator = createValidator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(int embarqueId)
    {
        var result = await _service.GetVinculoAsync(embarqueId);
        return Ok(ApiResponse.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create(int embarqueId, [FromBody] CreateEmbarqueNavioVinculoRequest request)
    {
        var v = await _createValidator.ValidateAsync(request);
        if (!v.IsValid)
            return BadRequest(ApiResponse.ValidationError(
                v.Errors.Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage }).ToList()));

        return StatusCode(201, ApiResponse.Created(await _service.CreateVinculoAsync(embarqueId, request)));
    }

    [HttpPatch]
    public async Task<IActionResult> Update(int embarqueId, [FromBody] UpdateEmbarqueNavioVinculoRequest request) =>
        Ok(ApiResponse.Ok(await _service.UpdateVinculoAsync(embarqueId, request)));

    [HttpDelete]
    public async Task<IActionResult> Delete(int embarqueId)
    {
        await _service.DeleteVinculoAsync(embarqueId);
        return NoContent();
    }
}
