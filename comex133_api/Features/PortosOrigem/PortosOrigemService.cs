using Comex133Api.Core.Database;
using Comex133Api.Core.Models;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.PortosOrigem;

public class PortosOrigemService
{
    private readonly AppDbContext _db;
    public PortosOrigemService(AppDbContext db) => _db = db;

    public async Task<PagedResult<PortoOrigemDto>> GetAllAsync(PaginationQuery pagination) =>
        await _db.PortosOrigem.OrderBy(x => x.Nome).Select(x => ToDto(x)).ToPagedResultAsync(pagination);

    public async Task<PortoOrigemDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<PortoOrigemDto> CreateAsync(CreatePortoOrigemRequest request)
    {
        var entity = new PortoOrigem
        {
            Nome   = request.Nome.Trim(),
            Codigo = request.Codigo.Trim().ToUpperInvariant(),
            Pais   = request.Pais.Trim()
        };
        _db.PortosOrigem.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<PortoOrigemDto> UpdateAsync(int id, UpdatePortoOrigemRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Nome   = request.Nome.Trim();
        entity.Codigo = request.Codigo.Trim().ToUpperInvariant();
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
        _db.PortosOrigem.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<PortoOrigem> FindOrThrowAsync(int id) =>
        await _db.PortosOrigem.FindAsync(id) ?? throw new NotFoundException("Porto de Origem", id);

    private static PortoOrigemDto ToDto(PortoOrigem x) =>
        new(x.Id, x.Nome, x.Codigo, x.Pais, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}


