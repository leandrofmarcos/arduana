using ImportCostsApi.Core.Database;
using ImportCostsApi.Core.Models;
using ImportCostsApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ImportCostsApi.Features.Portos;

/// <summary>
/// Repositório para acesso a dados de Porto
/// </summary>
public class PortoRepository
{
    private readonly AppDbContext _context;

    public PortoRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obter porto por ID
    /// </summary>
    public async Task<Porto?> GetById(string id)
    {
        return await _context.Portos
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
    }

    /// <summary>
    /// Obter todos os portos com paginação
    /// </summary>
    public async Task<PagedResult<Porto>> GetAll(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Portos
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.Nome);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Porto>(items, totalCount, pageNumber, pageSize);
    }

    /// <summary>
    /// Verificar se porto com código já existe
    /// </summary>
    public async Task<bool> ExistsByCodigo(string codigo, string? ignoreId = null)
    {
        var normalized = codigo.Trim().ToUpperInvariant();
        return await _context.Portos
            .AnyAsync(p => p.Codigo == normalized && !p.IsDeleted && (ignoreId == null || p.Id != ignoreId));
    }

    /// <summary>
    /// Adicionar novo porto
    /// </summary>
    public async Task Add(Porto porto)
    {
        _context.Portos.Add(porto);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Atualizar porto
    /// </summary>
    public async Task Update(Porto porto)
    {
        porto.UpdatedAt = DateTime.UtcNow;
        _context.Portos.Update(porto);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Deletar porto (soft delete)
    /// </summary>
    public async Task Delete(Porto porto)
    {
        porto.IsDeleted = true;
        porto.DeletedAt = DateTime.UtcNow;
        _context.Portos.Update(porto);
        await _context.SaveChangesAsync();
    }
}
