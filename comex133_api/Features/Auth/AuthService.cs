using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.Auth;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly JwtService   _jwt;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext db, JwtService jwt, IConfiguration configuration)
    {
        _db            = db;
        _jwt           = jwt;
        _configuration = configuration;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var usuario = await _db.Usuarios
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLower());

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Senha, usuario.PasswordHash))
            throw new UnauthorizedException("Credenciais inválidas.");

        if (!usuario.Ativo)
            throw new UnauthorizedException("Usuário inativo.");

        var roles = usuario.UsuarioRoles.Select(ur => ur.Role.Nome).ToList();
        var (accessToken, expiresAt) = _jwt.GenerateAccessToken(usuario, roles);
        var refreshToken             = await CreateRefreshTokenAsync(usuario.Id);

        usuario.UltimoLoginEm = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new LoginResponse(
            accessToken,
            refreshToken,
            expiresAt,
            new MeResponse(usuario.Id, usuario.Email, usuario.NomeCompleto, roles));
    }

    public async Task<RefreshResponse> RefreshAsync(RefreshRequest request)
    {
        var stored = await _db.RefreshTokens
            .Include(rt => rt.Usuario)
                .ThenInclude(u => u.UsuarioRoles)
                    .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

        if (stored == null || !stored.IsActive)
        {
            // Detecção de roubo: se o token já foi usado, revogar toda a família
            if (stored != null && stored.UsedAt != null)
                await RevokeAllUserRefreshTokensAsync(stored.UsuarioId);

            throw new UnauthorizedException("Refresh token inválido ou expirado.");
        }

        if (!stored.Usuario.Ativo)
            throw new UnauthorizedException("Usuário inativo.");

        // Marcar o token atual como usado
        stored.UsedAt = DateTime.UtcNow;

        var roles = stored.Usuario.UsuarioRoles.Select(ur => ur.Role.Nome).ToList();
        var (accessToken, expiresAt) = _jwt.GenerateAccessToken(stored.Usuario, roles);
        var newRefreshToken          = await CreateRefreshTokenAsync(stored.UsuarioId);

        await _db.SaveChangesAsync();

        return new RefreshResponse(accessToken, newRefreshToken, expiresAt);
    }

    public async Task LogoutAsync(LogoutRequest request)
    {
        var stored = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

        if (stored != null && stored.RevokedAt == null)
        {
            stored.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<MeResponse> GetMeAsync(int usuarioId)
    {
        var usuario = await _db.Usuarios
            .Include(u => u.UsuarioRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == usuarioId);

        if (usuario == null || !usuario.Ativo)
            throw new UnauthorizedException("Usuário não encontrado ou inativo.");

        var roles = usuario.UsuarioRoles.Select(ur => ur.Role.Nome).ToList();
        return new MeResponse(usuario.Id, usuario.Email, usuario.NomeCompleto, roles);
    }

    public async Task CleanupExpiredTokensAsync()
    {
        var cutoff = DateTime.UtcNow;
        var expired = await _db.RefreshTokens
            .Where(rt => rt.ExpiresAt < cutoff && rt.RevokedAt == null)
            .ToListAsync();

        foreach (var t in expired)
            t.RevokedAt = cutoff;

        if (expired.Count > 0)
            await _db.SaveChangesAsync();
    }

    // ───── helpers ─────────────────────────────────────────────────────────────

    private async Task<string> CreateRefreshTokenAsync(int usuarioId)
    {
        var days = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"]!);

        var entity = new RefreshToken
        {
            Token     = _jwt.GenerateRefreshToken(),
            UsuarioId = usuarioId,
            ExpiresAt = DateTime.UtcNow.AddDays(days),
            CriadoEm  = DateTime.UtcNow
        };
        _db.RefreshTokens.Add(entity);
        return await Task.FromResult(entity.Token);
    }

    private async Task RevokeAllUserRefreshTokensAsync(int usuarioId)
    {
        var tokens = await _db.RefreshTokens
            .Where(rt => rt.UsuarioId == usuarioId && rt.RevokedAt == null)
            .ToListAsync();

        var now = DateTime.UtcNow;
        foreach (var t in tokens)
            t.RevokedAt = now;
    }
}
