using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.Importadores;

public class ImportadoresService
{
    private readonly AppDbContext _db;
    public ImportadoresService(AppDbContext db) => _db = db;

    public async Task<List<ImportadorDto>> GetAllAsync() =>
        await _db.Importadores.OrderBy(x => x.RazaoSocial).Select(x => ToDto(x)).ToListAsync();

    public async Task<ImportadorDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<ImportadorDto> CreateAsync(CreateImportadorRequest request)
    {
        var entity = new Importador
        {
            RazaoSocial = request.RazaoSocial.Trim(),
            Cnpj        = request.Cnpj?.Trim(),
            Email       = request.Email?.Trim().ToLowerInvariant(),
            Telefone    = request.Telefone?.Trim()
        };
        _db.Importadores.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<ImportadorDto> UpdateAsync(int id, UpdateImportadorRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.RazaoSocial = request.RazaoSocial.Trim();
        entity.Cnpj        = request.Cnpj?.Trim();
        entity.Email       = request.Email?.Trim().ToLowerInvariant();
        entity.Telefone    = request.Telefone?.Trim();
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
        _db.Importadores.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<Importador> FindOrThrowAsync(int id) =>
        await _db.Importadores.FindAsync(id) ?? throw new NotFoundException("Importador", id);

    private static ImportadorDto ToDto(Importador x) =>
        new(x.Id, x.RazaoSocial, x.Cnpj, x.Email, x.Telefone, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}
