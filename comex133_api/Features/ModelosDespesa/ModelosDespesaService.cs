using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.ModelosDespesa;

public class ModelosDespesaService
{
    private readonly AppDbContext _db;
    public ModelosDespesaService(AppDbContext db) => _db = db;

    public async Task<List<ModeloDespesaDto>> GetAllAsync() =>
        await _db.ModelosDespesa.OrderBy(x => x.Nome).Select(x => ToDto(x)).ToListAsync();

    public async Task<ModeloDespesaDetalheDto> GetByIdAsync(int id)
    {
        var entity = await _db.ModelosDespesa
            .Include(m => m.Itens)
            .ThenInclude(i => i.DespesaCatalogo)
            .FirstOrDefaultAsync(m => m.Id == id)
            ?? throw new NotFoundException("Modelo de Despesa", id);

        return ToDetalheDto(entity);
    }

    public async Task<ModeloDespesaDto> CreateAsync(CreateModeloDespesaRequest request)
    {
        var entity = new ModeloDespesa
        {
            Nome      = request.Nome.Trim(),
            Descricao = request.Descricao?.Trim()
        };
        _db.ModelosDespesa.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<ModeloDespesaDto> UpdateAsync(int id, UpdateModeloDespesaRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Nome      = request.Nome.Trim();
        entity.Descricao = request.Descricao?.Trim();
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
        var entity = await _db.ModelosDespesa
            .Include(m => m.Itens)
            .FirstOrDefaultAsync(m => m.Id == id)
            ?? throw new NotFoundException("Modelo de Despesa", id);

        _db.ModelosDespesa.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<ModeloDespesaItemDto>> GetItensAsync(int id)
    {
        await FindOrThrowAsync(id);
        return await _db.ModelosDespesaItens
            .Where(i => i.ModeloDespesaId == id)
            .Include(i => i.DespesaCatalogo)
            .OrderBy(i => i.DespesaCatalogo.Categoria)
            .ThenBy(i => i.DespesaCatalogo.Descricao)
            .Select(i => ToItemDto(i))
            .ToListAsync();
    }

    public async Task<ModeloDespesaItemDto> AddItemAsync(int id, AddItemRequest request)
    {
        await FindOrThrowAsync(id);

        var despesa = await _db.DespesasCatalogo.FindAsync(request.DespesaCatalogoId)
            ?? throw new NotFoundException("Despesa Catálogo", request.DespesaCatalogoId);

        var existe = await _db.ModelosDespesaItens
            .AnyAsync(i => i.ModeloDespesaId == id && i.DespesaCatalogoId == request.DespesaCatalogoId);

        if (existe)
            throw new BusinessException("Esta despesa já está incluída no modelo.");

        var item = new ModeloDespesaItem
        {
            ModeloDespesaId   = id,
            DespesaCatalogoId = request.DespesaCatalogoId
        };
        _db.ModelosDespesaItens.Add(item);
        await _db.SaveChangesAsync();

        item.DespesaCatalogo = despesa;
        return ToItemDto(item);
    }

    public async Task RemoveItemAsync(int id, int despesaCatalogoId)
    {
        var item = await _db.ModelosDespesaItens
            .FirstOrDefaultAsync(i => i.ModeloDespesaId == id && i.DespesaCatalogoId == despesaCatalogoId)
            ?? throw new NotFoundException($"Item {despesaCatalogoId} não encontrado no modelo {id}.");

        _db.ModelosDespesaItens.Remove(item);
        await _db.SaveChangesAsync();
    }

    private async Task<ModeloDespesa> FindOrThrowAsync(int id) =>
        await _db.ModelosDespesa.FindAsync(id) ?? throw new NotFoundException("Modelo de Despesa", id);

    private static ModeloDespesaDto ToDto(ModeloDespesa x) =>
        new(x.Id, x.Nome, x.Descricao, x.Ativo, x.CriadoEm, x.AtualizadoEm);

    private static ModeloDespesaDetalheDto ToDetalheDto(ModeloDespesa x) =>
        new(x.Id, x.Nome, x.Descricao, x.Ativo, x.CriadoEm, x.AtualizadoEm, x.Itens.Select(ToItemDto));

    private static ModeloDespesaItemDto ToItemDto(ModeloDespesaItem i) =>
        new(i.DespesaCatalogoId, i.DespesaCatalogo.Descricao, i.DespesaCatalogo.Valor, i.DespesaCatalogo.Categoria, i.AdicionadoEm);
}
