using ImportCostsApi.Core.Models;
using ImportCostsApi.Core.Storage;
using Microsoft.AspNetCore.Mvc;

namespace ImportCostsApi.Features.TemplatesPacklist.UploadFile;

[ApiController]
[Route("api/templates-packlist")]
public class UploadFileController : ControllerBase
{
    private readonly IStorageService _storage;
    private readonly ILogger<UploadFileController> _logger;

    public UploadFileController(IStorageService storage, ILogger<UploadFileController> logger)
    {
        _storage = storage;
        _logger = logger;
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<UploadFileResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse.Error("Arquivo é obrigatório", 400));
        }

        var fileName = Path.GetFileName(file.FileName);
        var fileId = Guid.NewGuid().ToString();
        var relativePath = $"templates-packlist/{fileId}/{fileName}";

        await using var stream = file.OpenReadStream();
        await _storage.SaveAsync(relativePath, stream, cancellationToken);

        _logger.LogInformation("Arquivo de template uploaded: {FilePath}", relativePath);

        var response = new UploadFileResponseDto
        {
            FileUrl = relativePath,
            FileName = fileName
        };

        return Ok(ApiResponse<UploadFileResponseDto>.Ok(response, "Arquivo enviado com sucesso"));
    }
}

public class UploadFileResponseDto
{
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
