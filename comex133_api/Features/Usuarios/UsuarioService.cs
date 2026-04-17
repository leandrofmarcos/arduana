using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Core.Models;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.Usuarios;

public class UsuarioService
{
    private readonly AppDbContext _db;

    public UsuarioService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<UsuarioDto>> GetAllAsync(PaginationQuery pagination)
    {
        var query = _db.Usuarios
            .Include(u => u.UsuarioRoles).ThenInclude(ur => ur.Role)
            .OrderBy(u => u.NomeCompleto)
            .Select(u => ToDto(u));

        return await query.ToPagedResultAsync(pagination);
    }

    public async Task<UsuarioDto> GetByIdAsync(int id)
    {
        var usuario = await FindOrThrowAsync(id);
        return ToDto(usuario);
    }

    public async Task<UsuarioDto> CreateAsync(CreateUsuarioRequest request)
    {
        var emailNorm = request.Email.Trim().ToLower();

        if (await _db.Usuarios.AnyAsync(u => u.Email == emailNorm))
            throw new BusinessException($"E-mail '{request.Email}' já está em uso.");

        var usuario = new Usuario
        {
            Email         = emailNorm,
            NomeCompleto  = request.NomeCompleto.Trim(),
            PasswordHash  = BCrypt.Net.BCrypt.HashPassword(request.Senha, workFactor: 12),
            Ativo         = true,
            CriadoEm     = DateTime.UtcNow,
            AtualizadoEm = DateTime.UtcNow
        };

        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        if (request.RoleIds?.Any() == true)
        {
            foreach (var roleId in request.RoleIds.Distinct())
            {
                if (!await _db.Roles.AnyAsync(r => r.Id == roleId))
                    throw new NotFoundException($"Role {roleId} não encontrada.");

                _db.UsuarioRoles.Add(new UsuarioRole
                {
                    UsuarioId   = usuario.Id,
                    RoleId      = roleId,
                    AtribuidoEm = DateTime.UtcNow
                });
            }
            await _db.SaveChangesAsync();
        }

        return await GetByIdAsync(usuario.Id);
    }

    public async Task<UsuarioDto> UpdateAsync(int id, UpdateUsuarioRequest request)
    {
        var usuario = await FindOrThrowAsync(id);
        usuario.NomeCompleto = request.NomeCompleto.Trim();
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task AlterarSenhaAsync(int id, AlterarSenhaRequest request)
    {
        var usuario = await FindOrThrowAsync(id);

        if (!BCrypt.Net.BCrypt.Verify(request.SenhaAtual, usuario.PasswordHash))
            throw new BusinessException("Senha atual incorreta.");

        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha, workFactor: 12);
        await _db.SaveChangesAsync();
    }

    public async Task AlterarSenhaAdminAsync(int id, AlterarSenhaAdminRequest request)
    {
        var usuario = await FindOrThrowAsync(id);
        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha, workFactor: 12);
        await _db.SaveChangesAsync();
    }

    public async Task SetAtivoAsync(int id, bool ativo)
    {
        var usuario = await FindOrThrowAsync(id);
        usuario.Ativo = ativo;
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var usuario = await FindOrThrowAsync(id);
        _db.Usuarios.Remove(usuario);
        await _db.SaveChangesAsync();
    }

    public async Task<UsuarioDto> AtribuirRolesAsync(int id, AtribuirRolesRequest request)
    {
        var usuario = await FindOrThrowAsync(id);

        // Remover roles existentes
        var rolesExistentes = await _db.UsuarioRoles
            .Where(ur => ur.UsuarioId == id)
            .ToListAsync();
        _db.UsuarioRoles.RemoveRange(rolesExistentes);

        // Adicionar novas roles
        foreach (var roleId in request.RoleIds.Distinct())
        {
            if (!await _db.Roles.AnyAsync(r => r.Id == roleId))
                throw new NotFoundException($"Role {roleId} não encontrada.");

            _db.UsuarioRoles.Add(new UsuarioRole
            {
                UsuarioId   = id,
                RoleId      = roleId,
                AtribuidoEm = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    // ─── helpers ────────────────────────────────────────────────────────────────

    private async Task<Usuario> FindOrThrowAsync(int id)
    {
        var usuario = await _db.Usuarios
            .Include(u => u.UsuarioRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        return usuario ?? throw new NotFoundException($"Usuário {id} não encontrado.");
    }

    private static UsuarioDto ToDto(Usuario u) => new(
        u.Id,
        u.Email,
        u.NomeCompleto,
        u.Ativo,
        u.CriadoEm,
        u.AtualizadoEm,
        u.UltimoLoginEm,
        u.UsuarioRoles.Select(ur => ur.Role.Nome));
}
