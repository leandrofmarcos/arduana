using ImportCostsApi.Core.Models;
using ImportCostsApi.Core.Database;
using ImportCostsApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ImportCostsApi.Features.Clientes;

/// <summary>
/// Repositório para acesso a dados de Cliente
/// </summary>
public class ClienteRepository
{
    private readonly AppDbContext _context;

    public ClienteRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obter cliente por ID
    /// </summary>
    public async Task<Cliente?> GetById(string id)
    {
        return await _context.Clientes
            .Include(c => c.TemplatePacklist)
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
    }

    /// <summary>
    /// Obter todos os clientes com paginação
    /// </summary>
    public async Task<PagedResult<Cliente>> GetAll(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Clientes
            .Where(c => !c.IsDeleted)
            .Include(c => c.TemplatePacklist)
            .OrderBy(c => c.Nome);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Cliente>(items, totalCount, pageNumber, pageSize);
    }

    /// <summary>
    /// Verificar se cliente com documento já existe
    /// </summary>
    public async Task<bool> ExistsByDocumento(string documento)
    {
        var documentoLimpo = new string(documento.Where(char.IsDigit).ToArray());
        return await _context.Clientes
            .AnyAsync(c => c.Documento == documentoLimpo && !c.IsDeleted);
    }

    /// <summary>
    /// Verificar se cliente possui orçamentos vinculados
    /// </summary>
    public async Task<bool> HasOrcamentos(string clienteId)
    {
        return await _context.Orcamentos
            .AnyAsync(o => o.ClienteId == clienteId);
    }

    /// <summary>
    /// Adicionar novo cliente
    /// </summary>
    public async Task Add(Cliente cliente)
    {
        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Atualizar cliente
    /// </summary>
    public async Task Update(Cliente cliente)
    {
        cliente.UpdatedAt = DateTime.UtcNow;
        _context.Clientes.Update(cliente);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Deletar cliente (soft delete)
    /// </summary>
    public async Task Delete(Cliente cliente)
    {
        cliente.IsDeleted = true;
        cliente.DeletedAt = DateTime.UtcNow;
        _context.Clientes.Update(cliente);
        await _context.SaveChangesAsync();
    }
}
