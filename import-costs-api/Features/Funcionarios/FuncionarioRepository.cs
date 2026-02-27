using ImportCostsApi.Core.Models;
using ImportCostsApi.Core.Database;
using ImportCostsApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ImportCostsApi.Features.Funcionarios;

/// <summary>
/// Repositório para acesso a dados de Funcionário
/// </summary>
public class FuncionarioRepository
{
    private readonly AppDbContext _context;

    public FuncionarioRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obter funcionário por ID
    /// </summary>
    public async Task<Funcionario?> GetById(string id)
    {
        return await _context.Funcionarios
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted);
    }

    /// <summary>
    /// Obter todos os funcionários com paginação
    /// </summary>
    public async Task<PagedResult<Funcionario>> GetAll(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Funcionarios
            .Where(f => !f.IsDeleted)
            .OrderBy(f => f.NomeCompleto);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Funcionario>(items, totalCount, pageNumber, pageSize);
    }

    /// <summary>
    /// Verificar se funcionário com username já existe
    /// </summary>
    public async Task<bool> ExistsByUsername(string username)
    {
        return await _context.Funcionarios
            .AnyAsync(f => f.Username.ToLower() == username.ToLower() && !f.IsDeleted);
    }

    /// <summary>
    /// Verificar se funcionário com email já existe
    /// </summary>
    public async Task<bool> ExistsByEmail(string email)
    {
        return await _context.Funcionarios
            .AnyAsync(f => f.Email.ToLower() == email.ToLower() && !f.IsDeleted);
    }

    /// <summary>
    /// Adicionar novo funcionário
    /// </summary>
    public async Task Add(Funcionario funcionario)
    {
        _context.Funcionarios.Add(funcionario);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Atualizar funcionário
    /// </summary>
    public async Task Update(Funcionario funcionario)
    {
        funcionario.UpdatedAt = DateTime.UtcNow;
        _context.Funcionarios.Update(funcionario);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Deletar funcionário (soft delete)
    /// </summary>
    public async Task Delete(Funcionario funcionario)
    {
        funcionario.IsDeleted = true;
        funcionario.DeletedAt = DateTime.UtcNow;
        _context.Funcionarios.Update(funcionario);
        await _context.SaveChangesAsync();
    }
}
