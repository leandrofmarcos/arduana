using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Core.Models;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.ControleNavios;

public class ControleNaviosService
{
    private readonly AppDbContext _db;

    public ControleNaviosService(AppDbContext db) => _db = db;

    // ── Navios ──────────────────────────────────────────────────────────

    public async Task<PagedResult<ControleNavioDto>> GetAllAsync(PaginationQuery pagination) =>
        await _db.ControleNavios
            .OrderBy(x => x.NomeNavio)
            .Select(x => ToDto(x))
            .ToPagedResultAsync(pagination);

    public async Task<ControleNavioComTrajetosDto> GetByIdAsync(int id)
    {
        var entity = await _db.ControleNavios
            .Include(x => x.Trajetos)
                .ThenInclude(t => t.PortoOrigem)
            .Include(x => x.Trajetos)
                .ThenInclude(t => t.PortoDestino)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new NotFoundException("Controle de Navio", id);

        return ToDtoComTrajetos(entity);
    }

    public async Task<ControleNavioDto> CreateAsync(CreateControleNavioRequest request)
    {
        var entity = new ControleNavio
        {
            NumeroViagem = request.NumeroViagem.Trim(),
            NomeNavio    = request.NomeNavio.Trim(),
            Observacao   = request.Observacao?.Trim(),
            Ativo        = request.Ativo
        };
        _db.ControleNavios.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<ControleNavioDto> UpdateAsync(int id, UpdateControleNavioRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.NumeroViagem = request.NumeroViagem.Trim();
        entity.NomeNavio    = request.NomeNavio.Trim();
        entity.Observacao   = request.Observacao?.Trim();
        entity.Ativo        = request.Ativo;
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
        _db.ControleNavios.Remove(entity);
        await _db.SaveChangesAsync();
    }

    // ── Trajetos ─────────────────────────────────────────────────────────

    public async Task<PagedResult<ControleNavioTrajetoDto>> GetAllTrajetosAsync(PaginationQuery pagination) =>
        await _db.ControleNaviosTrajetos
            .Include(t => t.PortoOrigem)
            .Include(t => t.PortoDestino)
            .OrderBy(t => t.Etd)
            .Select(t => ToTrajetoDto(t))
            .ToPagedResultAsync(pagination);

    public async Task<IList<ControleNavioTrajetoDto>> GetTrajetosByNavioAsync(int navioId)
    {
        await FindOrThrowAsync(navioId);
        return await _db.ControleNaviosTrajetos
            .Include(t => t.PortoOrigem)
            .Include(t => t.PortoDestino)
            .Where(t => t.ControleNavioId == navioId)
            .OrderBy(t => t.Etd)
            .Select(t => ToTrajetoDto(t))
            .ToListAsync();
    }

    public async Task<ControleNavioTrajetoDto> AddTrajetoAsync(int navioId, UpsertControleNavioTrajetoRequest request)
    {
        await FindOrThrowAsync(navioId);
        await ValidatePortosExistAsync(request.PortoOrigemId, request.PortoDestinoId);

        var (etd, eta) = ParseDates(request.Etd, request.Eta);

        var trajeto = new ControleNavioTrajeto
        {
            ControleNavioId  = navioId,
            PortoOrigemId    = request.PortoOrigemId,
            PortoDestinoId   = request.PortoDestinoId,
            Etd              = etd,
            Eta              = eta,
            TrajetoDescricao = request.TrajetoDescricao?.Trim()
        };
        _db.ControleNaviosTrajetos.Add(trajeto);
        await _db.SaveChangesAsync();

        await _db.Entry(trajeto).Reference(t => t.PortoOrigem).LoadAsync();
        await _db.Entry(trajeto).Reference(t => t.PortoDestino).LoadAsync();

        return ToTrajetoDto(trajeto);
    }

    public async Task<IList<ControleNavioTrajetoDto>> ReplaceTrajetosAsync(int navioId, IList<UpsertControleNavioTrajetoRequest> requests)
    {
        await FindOrThrowAsync(navioId);

        var existing = await _db.ControleNaviosTrajetos
            .Where(t => t.ControleNavioId == navioId)
            .ToListAsync();

        _db.ControleNaviosTrajetos.RemoveRange(existing);

        foreach (var req in requests)
        {
            await ValidatePortosExistAsync(req.PortoOrigemId, req.PortoDestinoId);
            var (etd, eta) = ParseDates(req.Etd, req.Eta);
            _db.ControleNaviosTrajetos.Add(new ControleNavioTrajeto
            {
                ControleNavioId  = navioId,
                PortoOrigemId    = req.PortoOrigemId,
                PortoDestinoId   = req.PortoDestinoId,
                Etd              = etd,
                Eta              = eta,
                TrajetoDescricao = req.TrajetoDescricao?.Trim()
            });
        }

        await _db.SaveChangesAsync();
        return await GetTrajetosByNavioAsync(navioId);
    }

    public async Task DeleteTrajetoAsync(int navioId, int trajetoId)
    {
        await FindOrThrowAsync(navioId);
        var trajeto = await _db.ControleNaviosTrajetos
            .FirstOrDefaultAsync(t => t.Id == trajetoId && t.ControleNavioId == navioId)
            ?? throw new NotFoundException("Trajeto", trajetoId);

        _db.ControleNaviosTrajetos.Remove(trajeto);
        await _db.SaveChangesAsync();
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private async Task<ControleNavio> FindOrThrowAsync(int id) =>
        await _db.ControleNavios.FindAsync(id)
            ?? throw new NotFoundException("Controle de Navio", id);

    private async Task ValidatePortosExistAsync(int origemId, int destinoId)
    {
        if (!await _db.PortosOrigem.AnyAsync(p => p.Id == origemId))
            throw new NotFoundException("Porto de Origem", origemId);
        if (!await _db.PortosDestino.AnyAsync(p => p.Id == destinoId))
            throw new NotFoundException("Porto de Destino", destinoId);
    }

    private static (DateTime etd, DateTime eta) ParseDates(string etdStr, string etaStr)
    {
        var etd = DateTime.Parse(etdStr, null, System.Globalization.DateTimeStyles.RoundtripKind);
        var eta = DateTime.Parse(etaStr, null, System.Globalization.DateTimeStyles.RoundtripKind);
        return (etd, eta);
    }

    private static ControleNavioDto ToDto(ControleNavio x) =>
        new(x.Id, x.NumeroViagem, x.NomeNavio, x.Observacao, x.Ativo, x.CriadoEm, x.AtualizadoEm);

    private static ControleNavioComTrajetosDto ToDtoComTrajetos(ControleNavio x) =>
        new(x.Id, x.NumeroViagem, x.NomeNavio, x.Observacao, x.Ativo, x.CriadoEm, x.AtualizadoEm,
            x.Trajetos.Select(t => ToTrajetoDto(t)).ToList());

    private static ControleNavioTrajetoDto ToTrajetoDto(ControleNavioTrajeto t) =>
        new(t.Id,
            t.ControleNavioId,
            t.PortoOrigemId,
            t.PortoOrigem?.Nome ?? string.Empty,
            t.PortoDestinoId,
            t.PortoDestino?.Nome ?? string.Empty,
            t.Etd.ToString("o"),
            t.Eta.ToString("o"),
            t.TrajetoDescricao,
            t.CriadoEm,
            t.AtualizadoEm);
}
