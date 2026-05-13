using Comex133Api.Core.Models;
using Comex133Api.Infrastructure.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadsController : ControllerBase
{
    private const long MaxFileSizeBytes = 52_428_800; // 50 MB

    private readonly IStorageService _storage;
    private readonly ILogger<UploadsController> _logger;

    public UploadsController(IStorageService storage, ILogger<UploadsController> logger)
    {
        _storage = storage;
        _logger  = logger;
    }

    /// <summary>
    /// Faz upload de um arquivo (multipart/form-data) e retorna a URL pública.
    /// Query param ?subfolder=packlist (default) organiza os arquivos por categoria.
    /// </summary>
    [HttpPost]
    [RequestSizeLimit(MaxFileSizeBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSizeBytes)]
    public async Task<IActionResult> Upload(
        IFormFile file,
        [FromQuery] string subfolder = "packlist",
        CancellationToken ct = default)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse.ValidationError(new List<ValidationError>
            {
                new() { Field = "file", Message = "Nenhum arquivo enviado." }
            }));

        if (file.Length > MaxFileSizeBytes)
            return BadRequest(ApiResponse.ValidationError(new List<ValidationError>
            {
                new() { Field = "file", Message = "Arquivo excede o limite de 50 MB." }
            }));

        var result = await _storage.SaveAsync(file, subfolder, ct);

        _logger.LogInformation(
            "Upload concluído: {Original} → {Url} ({Bytes} bytes)",
            file.FileName, result.Url, file.Length);

        return Ok(ApiResponse.Ok(new
        {
            url          = result.Url,
            relativePath = result.RelativePath,
            fileName     = result.FileName,
            originalName = file.FileName,
            size         = file.Length
        }));
    }

    /// <summary>Remove um arquivo pelo relativePath (ex: /uploads/packlist/abc_file.pdf).</summary>
    [HttpDelete]
    [Authorize(Roles = "Administrador,Gerente,Analista")]
    public async Task<IActionResult> Delete([FromQuery] string relativePath, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return BadRequest(ApiResponse.Error("relativePath é obrigatório."));

        await _storage.DeleteAsync(relativePath, ct);
        return Ok(ApiResponse.Ok(null, "Arquivo removido."));
    }
}
