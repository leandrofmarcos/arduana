namespace ImportCostsApi.Core.Storage;

/// <summary>
/// Abstração para armazenamento de arquivos
/// </summary>
public interface IStorageService
{
    /// <summary>
    /// Salva um arquivo e retorna o caminho relativo salvo
    /// </summary>
    Task<string> SaveAsync(string relativePath, Stream content, CancellationToken cancellationToken = default);

    /// <summary>
    /// Remove um arquivo pelo caminho relativo
    /// </summary>
    Task DeleteAsync(string relativePath, CancellationToken cancellationToken = default);
}
