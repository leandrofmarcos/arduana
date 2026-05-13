using Comex133Api.Core.Database;
using Comex133Api.Core.Models;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.Despachantes;

public class DespachantesService
{
    private readonly AppDbContext _db;
    public DespachantesService(AppDbContext db) => _db = db;

    public async Task<PagedResult<DespachantDto>> GetAllAsync(PaginationQuery pagination) =>
        await _db.Despachantes
            .OrderBy(x => x.Nome)
            .Select(x => new DespachantDto(
                x.Id,
                x.Nome ?? string.Empty,
                x.Crn,
                x.Email,
                x.Telefone,
                x.PrefixoReferencia,
                x.Ativo,
                EF.Property<DateTime?>(x, nameof(Despachante.CriadoEm)) ?? DateTime.UnixEpoch,
                EF.Property<DateTime?>(x, nameof(Despachante.AtualizadoEm)) ?? DateTime.UnixEpoch
            ))
            .ToPagedResultAsync(pagination);

    public async Task<DespachantDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<DespachantDto> CreateAsync(CreateDespachantRequest request)
    {
        var entity = new Despachante
        {
            Nome               = request.Nome.Trim(),
            Crn                = request.Crn?.Trim(),
            Email              = request.Email?.Trim().ToLowerInvariant(),
            Telefone           = request.Telefone?.Trim(),
            PrefixoReferencia  = NormalizarPrefixo(request.PrefixoReferencia)
        };
        _db.Despachantes.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<DespachantDto> UpdateAsync(int id, UpdateDespachantRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Nome              = request.Nome.Trim();
        entity.Crn               = request.Crn?.Trim();
        entity.Email             = request.Email?.Trim().ToLowerInvariant();
        entity.Telefone          = request.Telefone?.Trim();
        entity.PrefixoReferencia = NormalizarPrefixo(request.PrefixoReferencia);
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
        _db.Despachantes.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<Despachante> FindOrThrowAsync(int id) =>
        await _db.Despachantes.FindAsync(id) ?? throw new NotFoundException("Despachante", id);

    private static string? NormalizarPrefixo(string? prefixo) =>
        string.IsNullOrWhiteSpace(prefixo) ? null : prefixo.Trim().ToUpperInvariant();

    private static DespachantDto ToDto(Despachante x) =>
        new(x.Id, x.Nome, x.Crn, x.Email, x.Telefone, x.PrefixoReferencia, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}


