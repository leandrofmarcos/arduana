using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.Exportadores;

public class ExportadoresService
{
    private readonly AppDbContext _db;
    public ExportadoresService(AppDbContext db) => _db = db;

    public async Task<List<ExportadorDto>> GetAllAsync() =>
        await _db.Exportadores.OrderBy(x => x.Nome).Select(x => ToDto(x)).ToListAsync();

    public async Task<ExportadorDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<ExportadorDto> CreateAsync(CreateExportadorRequest request)
    {
        var entity = new Exportador
        {
            Nome      = request.Nome.Trim(),
            Documento = request.Documento?.Trim(),
            Pais      = request.Pais.Trim(),
            Cidade    = request.Cidade?.Trim()
        };
        _db.Exportadores.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<ExportadorDto> UpdateAsync(int id, UpdateExportadorRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Nome      = request.Nome.Trim();
        entity.Documento = request.Documento?.Trim();
        entity.Pais      = request.Pais.Trim();
        entity.Cidade    = request.Cidade?.Trim();
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
        _db.Exportadores.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<Exportador> FindOrThrowAsync(int id) =>
        await _db.Exportadores.FindAsync(id) ?? throw new NotFoundException("Exportador", id);

    private static ExportadorDto ToDto(Exportador x) =>
        new(x.Id, x.Nome, x.Documento, x.Pais, x.Cidade, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}
