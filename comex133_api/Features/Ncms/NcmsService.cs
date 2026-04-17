using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.Ncms;

public class NcmsService
{
    private readonly AppDbContext _db;
    public NcmsService(AppDbContext db) => _db = db;

    public async Task<List<NcmDto>> GetAllAsync() =>
        await _db.Ncms.OrderBy(x => x.CodigoNcm).Select(x => ToDto(x)).ToListAsync();

    public async Task<NcmDto> GetByIdAsync(int id) =>
        ToDto(await FindOrThrowAsync(id));

    public async Task<NcmDto> CreateAsync(CreateNcmRequest request)
    {
        if (await _db.Ncms.AnyAsync(x => x.CodigoNcm == request.CodigoNcm))
            throw new BusinessException($"Já existe um NCM com o código '{request.CodigoNcm}'.");

        var entity = new Ncm
        {
            CodigoNcm   = request.CodigoNcm,
            Descricao   = request.Descricao.Trim(),
            AliqII      = request.AliqII,
            AliqIPI     = request.AliqIPI,
            AliqPIS     = request.AliqPIS,
            AliqCOFINS  = request.AliqCOFINS,
            AliqICMS    = request.AliqICMS
        };
        _db.Ncms.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<NcmDto> UpdateAsync(int id, UpdateNcmRequest request)
    {
        var entity = await FindOrThrowAsync(id);

        if (await _db.Ncms.AnyAsync(x => x.CodigoNcm == request.CodigoNcm && x.Id != id))
            throw new BusinessException($"Já existe outro NCM com o código '{request.CodigoNcm}'.");

        entity.CodigoNcm  = request.CodigoNcm;
        entity.Descricao  = request.Descricao.Trim();
        entity.AliqII     = request.AliqII;
        entity.AliqIPI    = request.AliqIPI;
        entity.AliqPIS    = request.AliqPIS;
        entity.AliqCOFINS = request.AliqCOFINS;
        entity.AliqICMS   = request.AliqICMS;
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
        _db.Ncms.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<Ncm> FindOrThrowAsync(int id) =>
        await _db.Ncms.FindAsync(id) ?? throw new NotFoundException("NCM", id);

    private static NcmDto ToDto(Ncm x) =>
        new(x.Id, x.CodigoNcm, x.Descricao, x.AliqII, x.AliqIPI, x.AliqPIS, x.AliqCOFINS, x.AliqICMS, x.Ativo, x.CriadoEm, x.AtualizadoEm);
}
