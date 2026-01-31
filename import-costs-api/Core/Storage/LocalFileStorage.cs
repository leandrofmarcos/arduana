namespace ImportCostsApi.Core.Storage;

/// <summary>
/// Implementação de storage em disco local (temporário)
/// </summary>
public class LocalFileStorage : IStorageService
{
    private readonly string _rootPath;

    public LocalFileStorage()
    {
        _rootPath = Path.Combine(Path.GetTempPath(), "import-costs-storagem");
    }

    public async Task<string> SaveAsync(string relativePath, Stream content, CancellationToken cancellationToken = default)
    {
        var normalized = relativePath.Replace("/", Path.DirectorySeparatorChar.ToString());
        var fullPath = Path.Combine(_rootPath, normalized);

        var directory = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrWhiteSpace(directory))
            Directory.CreateDirectory(directory);

        await using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None);
        await content.CopyToAsync(fileStream, cancellationToken);

        return relativePath.Replace("\\", "/");
    }

    public Task DeleteAsync(string relativePath, CancellationToken cancellationToken = default)
    {
        var normalized = relativePath.Replace("/", Path.DirectorySeparatorChar.ToString());
        var fullPath = Path.Combine(_rootPath, normalized);

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }
}
