using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.Fabricantes;

public class FabricantesService
{
    private readonly AppDbContext _db;
    public FabricantesService(AppDbContext db) => _db = db;

    public async Task<List<FabricanteDto>> GetAllAsync() =>
        await _db.Fabricantes.OrderBy(x => x.Nome).Select(x => ToDto(x)).ToListAsync();

    public async Task<FabricanteDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<FabricanteDto> CreateAsync(CreateFabricanteRequest request)
    {
        var entity = new Fabricante
        {
            Nome    = request.Nome.Trim(),
            Pais    = request.Pais.Trim(),
            Cidade  = request.Cidade?.Trim(),
            Contato = request.Contato?.Trim()
        };
        _db.Fabricantes.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<FabricanteDto> UpdateAsync(int id, UpdateFabricanteRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Nome    = request.Nome.Trim();
        entity.Pais    = request.Pais.Trim();
        entity.Cidade  = request.Cidade?.Trim();
        entity.Contato = request.Contato?.Trim();
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
        _db.Fabricantes.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<Fabricante> FindOrThrowAsync(int id) =>
        await _db.Fabricantes.FindAsync(id) ?? throw new NotFoundException("Fabricante", id);

    private static FabricanteDto ToDto(Fabricante x) =>
        new(x.Id, x.Nome, x.Pais, x.Cidade, x.Contato, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}
