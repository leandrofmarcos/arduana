namespace Comex133Api.Infrastructure.Storage;

/// <summary>
/// Implementação de IStorageService que persiste arquivos no sistema de arquivos local
/// dentro de wwwroot/uploads/{subfolder}/.
///
/// Para trocar de provedor (Azure Blob, S3, MinIO) basta criar uma nova classe que
/// implemente IStorageService e alterar o registro no DI — zero impacto no restante do sistema.
/// </summary>
public class LocalStorageService : IStorageService
{
    private readonly string _webRootPath;
    private readonly IHttpContextAccessor _http;

    public LocalStorageService(IWebHostEnvironment env, IHttpContextAccessor http)
    {
        // WebRootPath é null em projetos API sem wwwroot configurado; criamos o caminho manualmente.
        _webRootPath = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        _http = http;
    }

    public async Task<StorageResult> SaveAsync(IFormFile file, string subfolder, CancellationToken ct = default)
    {
        var safeSub  = SanitizeFolderName(subfolder);
        var uploadDir = Path.Combine(_webRootPath, "uploads", safeSub);
        Directory.CreateDirectory(uploadDir);

        var originalName = Path.GetFileName(file.FileName); // evita path traversal no nome
        var uniqueName   = $"{Guid.NewGuid():N}_{originalName}";
        var fullPath     = Path.Combine(uploadDir, uniqueName);

        await using var stream = File.Create(fullPath);
        await file.CopyToAsync(stream, ct);

        var relativePath = $"/uploads/{safeSub}/{uniqueName}";
        var url = $"{BaseUrl()}{relativePath}";

        return new StorageResult(url, relativePath, uniqueName);
    }

    public Task DeleteAsync(string relativePath, CancellationToken ct = default)
    {
        var normalised = relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath   = Path.Combine(_webRootPath, normalised);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
        return Task.CompletedTask;
    }

    private string BaseUrl()
    {
        var req = _http.HttpContext?.Request;
        if (req is null) return string.Empty;
        return $"{req.Scheme}://{req.Host}";
    }

    private static string SanitizeFolderName(string name)
    {
        // aceita apenas alfanuméricos, hífen e underscore — previne path traversal na pasta
        var safe = new System.Text.StringBuilder();
        foreach (var c in name)
            if (char.IsLetterOrDigit(c) || c == '-' || c == '_')
                safe.Append(c);
        return safe.Length > 0 ? safe.ToString() : "geral";
    }
}
