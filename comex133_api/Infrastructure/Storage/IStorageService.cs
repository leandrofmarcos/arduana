namespace Comex133Api.Infrastructure.Storage;

public interface IStorageService
{
    /// <summary>Persiste o arquivo e retorna URL pública + metadados.</summary>
    Task<StorageResult> SaveAsync(IFormFile file, string subfolder, CancellationToken ct = default);

    /// <summary>Remove o arquivo a partir do relativePath retornado pelo SaveAsync.</summary>
    Task DeleteAsync(string relativePath, CancellationToken ct = default);
}
