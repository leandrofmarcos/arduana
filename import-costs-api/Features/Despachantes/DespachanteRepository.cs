using ImportCostsApi.Core.Database;
using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ImportCostsApi.Features.Despachantes;

/// <summary>
/// Repositório para acesso a dados de Despachante
/// </summary>
public class DespachanteRepository
{
    private readonly AppDbContext _context;

    public DespachanteRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obter despachante por ID
    /// </summary>
    public async Task<Despachante?> GetById(string id)
    {
        return await _context.Despachantes
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
    }

    /// <summary>
    /// Obter todos os despachantes com paginação
    /// </summary>
    public async Task<PagedResult<Despachante>> GetAll(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Despachantes
            .Where(d => !d.IsDeleted)
            .OrderBy(d => d.Nome);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Despachante>(items, totalCount, pageNumber, pageSize);
    }

    /// <summary>
    /// Verificar se despachante possui orçamentos vinculados
    /// </summary>
    public async Task<bool> HasOrcamentos(string despachanteId)
    {
        return await _context.Orcamentos
            .AnyAsync(o => o.DespachanteId == despachanteId);
    }

    /// <summary>
    /// Adicionar novo despachante
    /// </summary>
    public async Task Add(Despachante despachante)
    {
        _context.Despachantes.Add(despachante);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Atualizar despachante
    /// </summary>
    public async Task Update(Despachante despachante)
    {
        despachante.UpdatedAt = DateTime.UtcNow;
        _context.Despachantes.Update(despachante);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Deletar despachante (soft delete)
    /// </summary>
    public async Task Delete(Despachante despachante)
    {
        despachante.IsDeleted = true;
        despachante.DeletedAt = DateTime.UtcNow;
        _context.Despachantes.Update(despachante);
        await _context.SaveChangesAsync();
    }
}
