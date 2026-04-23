using System.Security.Claims;
using Comex133Api.Core.Database;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Core.Auth;

public class CurrentUserContext : ICurrentUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly AppDbContext _db;

    public CurrentUserContext(IHttpContextAccessor httpContextAccessor, AppDbContext db)
    {
        _httpContextAccessor = httpContextAccessor;
        _db = db;
    }

    private ClaimsPrincipal User =>
        _httpContextAccessor.HttpContext?.User ?? throw new InvalidOperationException("HTTP context não disponível.");

    public int UsuarioId
    {
        get
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;
            if (claim is null || !int.TryParse(claim, out var id))
                throw new InvalidOperationException("Claim de ID do usuário não encontrada.");
            return id;
        }
    }

    public IReadOnlyList<string> Roles =>
        User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

    public bool IsAdmin =>
        Roles.Any(r => r.Equals("Administrador", StringComparison.OrdinalIgnoreCase));

    public bool HasRole(string role) =>
        Roles.Any(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));

    public async Task<int?> GetVinculoIdAsync(string tipoVinculo, CancellationToken ct = default)
    {
        var vinculo = await _db.UsuarioVinculos
            .Where(v => v.UsuarioId == UsuarioId
                     && v.TipoVinculo == tipoVinculo
                     && v.Ativo)
            .FirstOrDefaultAsync(ct);

        return vinculo?.EntidadeId;
    }
}
