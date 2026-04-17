using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.PortosDestino;

public class PortosDestinoService
{
    private readonly AppDbContext _db;
    public PortosDestinoService(AppDbContext db) => _db = db;

    public async Task<List<PortoDestinoDto>> GetAllAsync() =>
        await _db.PortosDestino.OrderBy(x => x.Nome).Select(x => ToDto(x)).ToListAsync();

    public async Task<PortoDestinoDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<PortoDestinoDto> CreateAsync(CreatePortoDestinoRequest request)
    {
        var entity = new PortoDestino
        {
            Nome   = request.Nome.Trim(),
            Codigo = request.Codigo.Trim().ToUpperInvariant(),
            Estado = request.Estado?.Trim(),
            Pais   = request.Pais.Trim()
        };
        _db.PortosDestino.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<PortoDestinoDto> UpdateAsync(int id, UpdatePortoDestinoRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Nome   = request.Nome.Trim();
        entity.Codigo = request.Codigo.Trim().ToUpperInvariant();
        entity.Estado = request.Estado?.Trim();
        entity.Pais   = request.Pais.Trim();
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
        _db.PortosDestino.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<PortoDestino> FindOrThrowAsync(int id) =>
        await _db.PortosDestino.FindAsync(id) ?? throw new NotFoundException("Porto de Destino", id);

    private static PortoDestinoDto ToDto(PortoDestino x) =>
        new(x.Id, x.Nome, x.Codigo, x.Estado, x.Pais, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}
