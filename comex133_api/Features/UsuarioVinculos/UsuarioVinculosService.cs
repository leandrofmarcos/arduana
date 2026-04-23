using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.UsuarioVinculos;

public class UsuarioVinculosService
{
    private readonly AppDbContext _db;
    public UsuarioVinculosService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<UsuarioVinculoDto>> GetByUsuarioAsync(int usuarioId)
    {
        _ = await _db.Usuarios.FindAsync(usuarioId)
            ?? throw new NotFoundException("Usuário", usuarioId);

        return await _db.UsuarioVinculos
            .Where(v => v.UsuarioId == usuarioId)
            .OrderBy(v => v.TipoVinculo)
            .Select(v => ToDto(v))
            .ToListAsync();
    }

    public async Task<UsuarioVinculoDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<UsuarioVinculoDto> CreateAsync(CreateUsuarioVinculoRequest request)
    {
        _ = await _db.Usuarios.FindAsync(request.UsuarioId)
            ?? throw new NotFoundException("Usuário", request.UsuarioId);

        var exists = await _db.UsuarioVinculos.AnyAsync(v =>
            v.UsuarioId   == request.UsuarioId &&
            v.TipoVinculo == request.TipoVinculo &&
            v.EntidadeId  == request.EntidadeId);

        if (exists)
            throw new BusinessException("Vínculo já existe para este usuário, tipo e entidade.");

        var entity = new UsuarioVinculo
        {
            UsuarioId   = request.UsuarioId,
            TipoVinculo = request.TipoVinculo.Trim(),
            EntidadeId  = request.EntidadeId,
            Ativo       = true
        };

        _db.UsuarioVinculos.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<UsuarioVinculoDto> SetAtivoAsync(int id, bool ativo)
    {
        var entity = await FindOrThrowAsync(id);
        entity.Ativo = ativo;
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await FindOrThrowAsync(id);
        _db.UsuarioVinculos.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<UsuarioVinculo> FindOrThrowAsync(int id) =>
        await _db.UsuarioVinculos.FindAsync(id)
        ?? throw new NotFoundException("Vínculo de usuário", id);

    private static UsuarioVinculoDto ToDto(UsuarioVinculo v) =>
        new(v.Id, v.UsuarioId, v.TipoVinculo, v.EntidadeId, v.Ativo, v.CriadoEm, v.AtualizadoEm);
}
