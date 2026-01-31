using ImportCostsApi.Core.Database;
using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ImportCostsApi.Features.Aliquotas;

/// <summary>
/// Repositório para acesso a dados de AliquotaPerfil
/// </summary>
public class AliquotaRepository
{
    private readonly AppDbContext _context;

    public AliquotaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AliquotaPerfil?> GetById(string id)
    {
        return await _context.AliquotasPerfis
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
    }

    public async Task<PagedResult<AliquotaPerfil>> GetAll(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.AliquotasPerfis
            .Where(a => !a.IsDeleted)
            .OrderBy(a => a.Nome);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<AliquotaPerfil>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<AliquotaPerfil?> GetPadrao()
    {
        return await _context.AliquotasPerfis
            .FirstOrDefaultAsync(a => a.Padrao && !a.IsDeleted);
    }

    public async Task ClearPadrao()
    {
        var perfis = await _context.AliquotasPerfis
            .Where(a => a.Padrao && !a.IsDeleted)
            .ToListAsync();

        if (perfis.Count == 0)
            return;

        foreach (var perfil in perfis)
            perfil.Padrao = false;

        _context.AliquotasPerfis.UpdateRange(perfis);
        await _context.SaveChangesAsync();
    }

    public async Task Add(AliquotaPerfil perfil)
    {
        _context.AliquotasPerfis.Add(perfil);
        await _context.SaveChangesAsync();
    }

    public async Task Update(AliquotaPerfil perfil)
    {
        perfil.UpdatedAt = DateTime.UtcNow;
        _context.AliquotasPerfis.Update(perfil);
        await _context.SaveChangesAsync();
    }

    public async Task Delete(AliquotaPerfil perfil)
    {
        perfil.IsDeleted = true;
        perfil.DeletedAt = DateTime.UtcNow;
        _context.AliquotasPerfis.Update(perfil);
        await _context.SaveChangesAsync();
    }
}
