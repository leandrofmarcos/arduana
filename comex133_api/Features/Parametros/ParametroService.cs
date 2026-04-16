using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.Parametros;

public class ParametroService
{
    private readonly AppDbContext _db;

    public ParametroService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ParametroDto>> GetAllAsync()
    {
        return await _db.ParametrosSistema
            .OrderBy(p => p.Chave)
            .Select(p => ToDto(p))
            .ToListAsync();
    }

    public async Task<ParametroDto> GetByIdAsync(int id)
    {
        var entity = await _db.ParametrosSistema.FindAsync(id)
            ?? throw new NotFoundException("ParametroSistema", id);
        return ToDto(entity);
    }

    public async Task<ParametroDto> CreateAsync(CreateParametroRequest request)
    {
        var chaveExiste = await _db.ParametrosSistema
            .AnyAsync(p => p.Chave == request.Chave);

        if (chaveExiste)
            throw new BusinessException($"Já existe um parâmetro com a chave '{request.Chave}'.");

        var entity = new ParametroSistema
        {
            Chave = request.Chave.Trim(),
            Valor = request.Valor.Trim(),
            Descricao = request.Descricao?.Trim()
        };

        _db.ParametrosSistema.Add(entity);
        await _db.SaveChangesAsync();

        return ToDto(entity);
    }

    public async Task<ParametroDto> UpdateAsync(int id, UpdateParametroRequest request)
    {
        var entity = await _db.ParametrosSistema.FindAsync(id)
            ?? throw new NotFoundException("ParametroSistema", id);

        var chaveExiste = await _db.ParametrosSistema
            .AnyAsync(p => p.Chave == request.Chave && p.Id != id);

        if (chaveExiste)
            throw new BusinessException($"Já existe outro parâmetro com a chave '{request.Chave}'.");

        entity.Chave = request.Chave.Trim();
        entity.Valor = request.Valor.Trim();
        entity.Descricao = request.Descricao?.Trim();

        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.ParametrosSistema.FindAsync(id)
            ?? throw new NotFoundException("ParametroSistema", id);

        _db.ParametrosSistema.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private static ParametroDto ToDto(ParametroSistema p) =>
        new(p.Id, p.Chave, p.Valor, p.Descricao, p.CriadoEm, p.AtualizadoEm);
}
