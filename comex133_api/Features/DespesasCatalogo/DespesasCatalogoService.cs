using Comex133Api.Core.Database;
using Comex133Api.Core.Models;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.DespesasCatalogo;

public class DespesasCatalogoService
{
    private readonly AppDbContext _db;
    public DespesasCatalogoService(AppDbContext db) => _db = db;

    public async Task<PagedResult<DespesaCatalogoDto>> GetAllAsync(PaginationQuery pagination) =>
        await _db.DespesasCatalogo.OrderBy(x => x.Categoria).ThenBy(x => x.Descricao).Select(x => ToDto(x)).ToPagedResultAsync(pagination);

    public async Task<DespesaCatalogoDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<DespesaCatalogoDto> CreateAsync(CreateDespesaCatalogoRequest request)
    {
        var entity = new DespesaCatalogo
        {
            Descricao = request.Descricao.Trim(),
            Valor     = request.Valor,
            Categoria = request.Categoria
        };
        _db.DespesasCatalogo.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<DespesaCatalogoDto> UpdateAsync(int id, UpdateDespesaCatalogoRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Descricao = request.Descricao.Trim();
        entity.Valor     = request.Valor;
        entity.Categoria = request.Categoria;
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task SetAtivoAsync(int id, bool ativo)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Ativo = ativo;
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await FindOrThrowAsync(id);

        if (await _db.ModelosDespesaItens.AnyAsync(i => i.DespesaCatalogoId == id))
            throw new BusinessException("Despesa está vinculada a um ou mais Modelos de Despesa e não pode ser removida.");

        _db.DespesasCatalogo.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<DespesaCatalogo> FindOrThrowAsync(int id) =>
        await _db.DespesasCatalogo.FindAsync(id) ?? throw new NotFoundException("Despesa Catálogo", id);

    private static DespesaCatalogoDto ToDto(DespesaCatalogo x) =>
        new(x.Id, x.Descricao, x.Valor, x.Categoria, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}


