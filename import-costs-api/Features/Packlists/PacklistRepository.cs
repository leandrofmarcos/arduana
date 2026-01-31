using ImportCostsApi.Core.Database;
using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ImportCostsApi.Features.Packlists;

/// <summary>
/// Repositório para acesso a dados de Packlist
/// </summary>
public class PacklistRepository
{
    private readonly AppDbContext _context;

    public PacklistRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> OrcamentoExists(string orcamentoId)
    {
        return await _context.Orcamentos.AnyAsync(o => o.Id == orcamentoId);
    }

    public async Task<bool> HasPacklist(string orcamentoId)
    {
        return await _context.Packlists.AnyAsync(p => p.OrcamentoId == orcamentoId && !p.IsDeleted);
    }

    public async Task<Packlist?> GetByOrcamentoId(string orcamentoId)
    {
        return await _context.Packlists
            .Include(p => p.Items.Where(i => !i.IsDeleted))
            .FirstOrDefaultAsync(p => p.OrcamentoId == orcamentoId && !p.IsDeleted);
    }

    public async Task<PacklistItem?> GetItemById(string itemId)
    {
        return await _context.PacklistItems
            .FirstOrDefaultAsync(i => i.Id == itemId && !i.IsDeleted);
    }

    public async Task<PagedResult<PacklistItem>> GetItems(string packlistId, int pageNumber, int pageSize)
    {
        var query = _context.PacklistItems
            .Where(i => i.PacklistId == packlistId && !i.IsDeleted)
            .OrderBy(i => i.Codigo);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<PacklistItem>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<bool> ItemCodeExists(string packlistId, string codigo, string? ignoreItemId = null)
    {
        return await _context.PacklistItems
            .AnyAsync(i => i.PacklistId == packlistId
                && i.Codigo == codigo
                && !i.IsDeleted
                && (ignoreItemId == null || i.Id != ignoreItemId));
    }

    public async Task Add(Packlist packlist)
    {
        _context.Packlists.Add(packlist);
        await _context.SaveChangesAsync();
    }

    public async Task Update(Packlist packlist)
    {
        packlist.UpdatedAt = DateTime.UtcNow;
        _context.Packlists.Update(packlist);
        await _context.SaveChangesAsync();
    }

    public async Task AddItem(PacklistItem item)
    {
        _context.PacklistItems.Add(item);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateItem(PacklistItem item)
    {
        item.UpdatedAt = DateTime.UtcNow;
        _context.PacklistItems.Update(item);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteItem(PacklistItem item)
    {
        item.IsDeleted = true;
        item.DeletedAt = DateTime.UtcNow;
        _context.PacklistItems.Update(item);
        await _context.SaveChangesAsync();
    }
}
