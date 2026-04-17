using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.ListaPrecoLcl;

public class ListaPrecoLclService
{
    private readonly AppDbContext _db;
    public ListaPrecoLclService(AppDbContext db) => _db = db;

    public async Task<List<ListaPrecoLclDto>> GetAllAsync() =>
        await _db.ListaPrecoLcl.OrderBy(x => x.Categoria).ThenBy(x => x.Descricao).Select(x => ToDto(x)).ToListAsync();

    public async Task<ListaPrecoLclDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<ListaPrecoLclDto> CreateAsync(CreateListaPrecoLclRequest request)
    {
        var entity = new Domain.Entities.ListaPrecoLcl
        {
            Categoria      = request.Categoria.Trim(),
            Descricao      = request.Descricao.Trim(),
            NomeChines     = request.NomeChines?.Trim(),
            PrecoUsdPorCbm = request.PrecoUsdPorCbm,
            PrecoUsdPorKg  = request.PrecoUsdPorKg,
            DataVigencia   = request.DataVigencia.ToUniversalTime()
        };
        _db.ListaPrecoLcl.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<ListaPrecoLclDto> UpdateAsync(int id, UpdateListaPrecoLclRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Categoria      = request.Categoria.Trim();
        entity.Descricao      = request.Descricao.Trim();
        entity.NomeChines     = request.NomeChines?.Trim();
        entity.PrecoUsdPorCbm = request.PrecoUsdPorCbm;
        entity.PrecoUsdPorKg  = request.PrecoUsdPorKg;
        entity.DataVigencia   = request.DataVigencia.ToUniversalTime();
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
        _db.ListaPrecoLcl.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<Domain.Entities.ListaPrecoLcl> FindOrThrowAsync(int id) =>
        await _db.ListaPrecoLcl.FindAsync(id) ?? throw new NotFoundException("Lista de Preço LCL", id);

    private static ListaPrecoLclDto ToDto(Domain.Entities.ListaPrecoLcl x) =>
        new(x.Id, x.Categoria, x.Descricao, x.NomeChines, x.PrecoUsdPorCbm, x.PrecoUsdPorKg, x.DataVigencia, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}
