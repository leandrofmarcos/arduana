using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.Roles;

public class RoleService
{
    private readonly AppDbContext _db;

    public RoleService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<RoleDto>> GetAllAsync()
    {
        var roles = await _db.Roles
            .OrderBy(r => r.Nome)
            .ToListAsync();
        return roles.Select(ToDto);
    }

    public async Task<RoleDto> GetByIdAsync(int id)
    {
        var role = await FindOrThrowAsync(id);
        return ToDto(role);
    }

    public async Task<RoleDto> CreateAsync(CreateRoleRequest request)
    {
        var nomeNorm = request.Nome.Trim();

        if (await _db.Roles.AnyAsync(r => r.Nome == nomeNorm))
            throw new BusinessException($"Role '{nomeNorm}' já existe.");

        var role = new Role
        {
            Nome      = nomeNorm,
            Descricao = request.Descricao?.Trim()
        };
        _db.Roles.Add(role);
        await _db.SaveChangesAsync();
        return ToDto(role);
    }

    public async Task<RoleDto> UpdateAsync(int id, UpdateRoleRequest request)
    {
        var role     = await FindOrThrowAsync(id);
        var nomeNorm = request.Nome.Trim();

        if (await _db.Roles.AnyAsync(r => r.Nome == nomeNorm && r.Id != id))
            throw new BusinessException($"Role '{nomeNorm}' já existe.");

        role.Nome      = nomeNorm;
        role.Descricao = request.Descricao?.Trim();

        await _db.SaveChangesAsync();
        return ToDto(role);
    }

    public async Task DeleteAsync(int id)
    {
        var role = await FindOrThrowAsync(id);

        if (await _db.UsuarioRoles.AnyAsync(ur => ur.RoleId == id))
            throw new BusinessException("Role está em uso por um ou mais usuários e não pode ser removida.");

        _db.Roles.Remove(role);
        await _db.SaveChangesAsync();
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private async Task<Role> FindOrThrowAsync(int id)
    {
        var role = await _db.Roles.FindAsync(id);
        return role ?? throw new NotFoundException($"Role {id} não encontrada.");
    }

    private static RoleDto ToDto(Role r) => new(r.Id, r.Nome, r.Descricao, r.CriadoEm, r.AtualizadoEm);
}
