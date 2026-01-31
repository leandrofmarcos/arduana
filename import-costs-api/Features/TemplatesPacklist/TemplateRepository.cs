using ImportCostsApi.Core.Database;
using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ImportCostsApi.Features.TemplatesPacklist;

/// <summary>
/// Repositório para acesso a dados de TemplatePacklist
/// </summary>
public class TemplateRepository
{
    private readonly AppDbContext _context;

    public TemplateRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TemplatePacklist?> GetById(string id)
    {
        return await _context.TemplatesPacklist
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
    }

    public async Task<PagedResult<TemplatePacklist>> GetAll(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.TemplatesPacklist
            .Where(t => !t.IsDeleted)
            .OrderBy(t => t.Nome);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<TemplatePacklist>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<bool> HasClientesOrOrcamentos(string templateId)
    {
        var hasClientes = await _context.Clientes
            .AnyAsync(c => c.TemplatePacklistId == templateId && !c.IsDeleted);

        var hasOrcamentos = await _context.Orcamentos
            .AnyAsync(o => o.TemplatePacklistId == templateId);

        return hasClientes || hasOrcamentos;
    }

    public async Task Add(TemplatePacklist template)
    {
        _context.TemplatesPacklist.Add(template);
        await _context.SaveChangesAsync();
    }

    public async Task Update(TemplatePacklist template)
    {
        _context.TemplatesPacklist.Update(template);
        await _context.SaveChangesAsync();
    }

    public async Task Delete(TemplatePacklist template)
    {
        template.IsDeleted = true;
        template.DeletedAt = DateTime.UtcNow;
        _context.TemplatesPacklist.Update(template);
        await _context.SaveChangesAsync();
    }
}
