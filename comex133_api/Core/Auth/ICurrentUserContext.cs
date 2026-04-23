namespace Comex133Api.Core.Auth;

public interface ICurrentUserContext
{
    int UsuarioId { get; }
    IReadOnlyList<string> Roles { get; }
    bool IsAdmin { get; }
    bool HasRole(string role);

    /// <summary>
    /// Retorna o EntidadeId do vínculo ativo do tipo especificado, ou null se não tiver.
    /// Ex: tipoVinculo = "Despachante"
    /// </summary>
    Task<int?> GetVinculoIdAsync(string tipoVinculo, CancellationToken ct = default);
}
