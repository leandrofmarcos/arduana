using Comex133Api.Core.Auth;
using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Core.Models;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.SolicitacoesOrcamento;

public class SolicitacoesOrcamentoService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserContext _currentUser;

    public SolicitacoesOrcamentoService(AppDbContext db, ICurrentUserContext currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<SolicitacaoOrcamentoDto>> GetAllAsync(PaginationQuery pagination)
    {
        var query = _db.Set<SolicitacaoOrcamento>()
            .AsNoTracking();

        // Despachante only sees solicitações linked to them
        if (_currentUser.HasRole("Despachante"))
        {
            var despachanteId = await _currentUser.GetVinculoIdAsync("Despachante");
            if (despachanteId is null)
                return PagedResult<SolicitacaoOrcamentoDto>.Empty(pagination);

            query = query.Where(x => x.Despachantes.Any(d => d.DespachanteId == despachanteId.Value));
        }

        return await query
            .OrderByDescending(x => x.Data)
            .ThenByDescending(x => x.Id)
            .Select(x => new SolicitacaoOrcamentoDto(
                x.Id,
                x.CodigoInterno ?? string.Empty,
                x.ClienteId,
                x.ImportadorId,
                x.PortoOrigemId,
                x.PortoDestinoId,
                x.Responsavel ?? string.Empty,
                x.TamContainer ?? string.Empty,
                x.Peso,
                x.Observacao,
                x.Status ?? string.Empty,
                EF.Property<DateTime?>(x, nameof(SolicitacaoOrcamento.Data)) ?? DateTime.UnixEpoch,
                EF.Property<DateTime?>(x, nameof(SolicitacaoOrcamento.CriadoEm)) ?? DateTime.UnixEpoch,
                EF.Property<DateTime?>(x, nameof(SolicitacaoOrcamento.AtualizadoEm)) ?? DateTime.UnixEpoch,
                x.Despachantes.Count,
                x.Documentos.Count))
            .ToPagedResultAsync(pagination);
    }

    public async Task<SolicitacaoOrcamentoDto> GetByIdAsync(int id)
    {
        var entity = await FindSolicitacaoOrThrowAsync(id);
        return ToDto(entity);
    }

    public async Task<SolicitacaoOrcamentoDto> CreateAsync(CreateSolicitacaoOrcamentoRequest request)
    {
        await ValidateReferencesAsync(request.ClienteId, request.ImportadorId, request.PortoOrigemId, request.PortoDestinoId);

        var entity = new SolicitacaoOrcamento
        {
            CodigoInterno = await GenerateCodigoInternoAsync(),
            ClienteId = request.ClienteId,
            ImportadorId = request.ImportadorId,
            PortoOrigemId = request.PortoOrigemId,
            PortoDestinoId = request.PortoDestinoId,
            Responsavel = request.Responsavel.Trim(),
            TamContainer = request.TamContainer.Trim().ToUpperInvariant(),
            Peso = request.Peso,
            Observacao = request.Observacao?.Trim(),
            Status = request.Status.Trim(),
            Data = request.Data
        };

        _db.Add(entity);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(entity.Id);
    }

    public async Task<SolicitacaoOrcamentoDto> UpdateAsync(int id, UpdateSolicitacaoOrcamentoRequest request)
    {
        await ValidateReferencesAsync(request.ClienteId, request.ImportadorId, request.PortoOrigemId, request.PortoDestinoId);

        var entity = await FindSolicitacaoOrThrowAsync(id);
        entity.ClienteId = request.ClienteId;
        entity.ImportadorId = request.ImportadorId;
        entity.PortoOrigemId = request.PortoOrigemId;
        entity.PortoDestinoId = request.PortoDestinoId;
        entity.Responsavel = request.Responsavel.Trim();
        entity.TamContainer = request.TamContainer.Trim().ToUpperInvariant();
        entity.Peso = request.Peso;
        entity.Observacao = request.Observacao?.Trim();
        entity.Status = request.Status.Trim();
        entity.Data = request.Data;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(entity.Id);
    }

    public async Task UpdateStatusAsync(int id, string status)
    {
        var entity = await FindSolicitacaoOrThrowAsync(id);
        entity.Status = status.Trim();
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await FindSolicitacaoOrThrowAsync(id);
        _db.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<SolicitacaoOrcamentoDespachanteDto>> GetDespachantesAsync(int solicitacaoId)
    {
        await EnsureSolicitacaoExistsAsync(solicitacaoId);

        return await _db.Set<SolicitacaoOrcamentoDespachante>()
            .AsNoTracking()
            .Where(x => x.SolicitacaoOrcamentoId == solicitacaoId)
            .OrderByDescending(x => x.DataEnvio)
            .Select(x => new SolicitacaoOrcamentoDespachanteDto(
                x.Id,
                x.SolicitacaoOrcamentoId,
                x.DespachanteId,
                x.Status,
                x.DataEnvio,
                x.CriadoEm,
                x.AtualizadoEm))
            .ToListAsync();
    }

    public async Task<SolicitacaoOrcamentoDespachanteDto> AddDespachanteAsync(int solicitacaoId, AddSolicitacaoDespachanteRequest request)
    {
        await EnsureSolicitacaoExistsAsync(solicitacaoId);

        var despachanteExists = await _db.Despachantes.AnyAsync(x => x.Id == request.DespachanteId);
        if (!despachanteExists)
            throw new NotFoundException("Despachante", request.DespachanteId);

        var exists = await _db.Set<SolicitacaoOrcamentoDespachante>()
            .AnyAsync(x => x.SolicitacaoOrcamentoId == solicitacaoId && x.DespachanteId == request.DespachanteId);
        if (exists)
            throw new BusinessException("Despachante já vinculado a esta solicitação.");

        var entity = new SolicitacaoOrcamentoDespachante
        {
            SolicitacaoOrcamentoId = solicitacaoId,
            DespachanteId = request.DespachanteId,
            Status = request.Status.Trim(),
            DataEnvio = request.DataEnvio
        };

        _db.Add(entity);
        await _db.SaveChangesAsync();

        return new SolicitacaoOrcamentoDespachanteDto(
            entity.Id,
            entity.SolicitacaoOrcamentoId,
            entity.DespachanteId,
            entity.Status,
            entity.DataEnvio,
            entity.CriadoEm,
            entity.AtualizadoEm);
    }

    public async Task RemoveDespachanteAsync(int solicitacaoId, int solicitacaoDespachanteId)
    {
        await EnsureSolicitacaoExistsAsync(solicitacaoId);

        var entity = await _db.Set<SolicitacaoOrcamentoDespachante>()
            .FirstOrDefaultAsync(x => x.Id == solicitacaoDespachanteId && x.SolicitacaoOrcamentoId == solicitacaoId);

        if (entity is null)
            throw new NotFoundException("SolicitacaoOrcamentoDespachante", solicitacaoDespachanteId);

        _db.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<SolicitacaoOrcamentoDocumentoDto>> GetDocumentosAsync(int solicitacaoId)
    {
        await EnsureSolicitacaoExistsAsync(solicitacaoId);

        return await _db.Set<SolicitacaoOrcamentoDocumento>()
            .AsNoTracking()
            .Where(x => x.SolicitacaoOrcamentoId == solicitacaoId)
            .OrderByDescending(x => x.DataUpload)
            .Select(x => new SolicitacaoOrcamentoDocumentoDto(
                x.Id,
                x.SolicitacaoOrcamentoId,
                x.NomeArquivo,
                x.LinkDocumento,
                x.DataUpload,
                x.Observacao,
                x.CriadoEm,
                x.AtualizadoEm))
            .ToListAsync();
    }

    public async Task<SolicitacaoOrcamentoDocumentoDto> AddDocumentoAsync(int solicitacaoId, AddSolicitacaoDocumentoRequest request)
    {
        await EnsureSolicitacaoExistsAsync(solicitacaoId);

        var entity = new SolicitacaoOrcamentoDocumento
        {
            SolicitacaoOrcamentoId = solicitacaoId,
            NomeArquivo = request.NomeArquivo.Trim(),
            LinkDocumento = request.LinkDocumento.Trim(),
            DataUpload = request.DataUpload,
            Observacao = request.Observacao?.Trim()
        };

        _db.Add(entity);
        await _db.SaveChangesAsync();

        return new SolicitacaoOrcamentoDocumentoDto(
            entity.Id,
            entity.SolicitacaoOrcamentoId,
            entity.NomeArquivo,
            entity.LinkDocumento,
            entity.DataUpload,
            entity.Observacao,
            entity.CriadoEm,
            entity.AtualizadoEm);
    }

    public async Task RemoveDocumentoAsync(int solicitacaoId, int documentoId)
    {
        await EnsureSolicitacaoExistsAsync(solicitacaoId);

        var entity = await _db.Set<SolicitacaoOrcamentoDocumento>()
            .FirstOrDefaultAsync(x => x.Id == documentoId && x.SolicitacaoOrcamentoId == solicitacaoId);

        if (entity is null)
            throw new NotFoundException("SolicitacaoOrcamentoDocumento", documentoId);

        _db.Remove(entity);
        await _db.SaveChangesAsync();
    }

    private async Task<SolicitacaoOrcamento> FindSolicitacaoOrThrowAsync(int id)
    {
        return await _db.Set<SolicitacaoOrcamento>()
            .AsNoTracking()
            .Include(x => x.Despachantes)
            .Include(x => x.Documentos)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new NotFoundException("SolicitacaoOrcamento", id);
    }

    private async Task EnsureSolicitacaoExistsAsync(int solicitacaoId)
    {
        var exists = await _db.Set<SolicitacaoOrcamento>().AnyAsync(x => x.Id == solicitacaoId);
        if (!exists)
            throw new NotFoundException("SolicitacaoOrcamento", solicitacaoId);
    }

    private async Task ValidateReferencesAsync(int? clienteId, int? importadorId, int portoOrigemId, int portoDestinoId)
    {
        if (clienteId.HasValue && !await _db.Clientes.AnyAsync(x => x.Id == clienteId.Value))
            throw new NotFoundException("Cliente", clienteId.Value);

        if (importadorId.HasValue && !await _db.Importadores.AnyAsync(x => x.Id == importadorId.Value))
            throw new NotFoundException("Importador", importadorId.Value);

        if (!await _db.PortosOrigem.AnyAsync(x => x.Id == portoOrigemId))
            throw new NotFoundException("PortoOrigem", portoOrigemId);

        if (!await _db.PortosDestino.AnyAsync(x => x.Id == portoDestinoId))
            throw new NotFoundException("PortoDestino", portoDestinoId);
    }

    private async Task<string> GenerateCodigoInternoAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"SOL-{year}-";

        var lastCode = await _db.Set<SolicitacaoOrcamento>()
            .AsNoTracking()
            .Where(x => x.CodigoInterno.StartsWith(prefix))
            .OrderByDescending(x => x.Id)
            .Select(x => x.CodigoInterno)
            .FirstOrDefaultAsync();

        var next = 1;
        if (!string.IsNullOrWhiteSpace(lastCode) && lastCode.Length >= prefix.Length + 3)
        {
            var suffix = lastCode.Substring(prefix.Length);
            if (int.TryParse(suffix, out var parsed))
                next = parsed + 1;
        }

        return $"{prefix}{next:000}";
    }

    private static SolicitacaoOrcamentoDto ToDto(SolicitacaoOrcamento x) =>
        new(
            x.Id,
            x.CodigoInterno,
            x.ClienteId,
            x.ImportadorId,
            x.PortoOrigemId,
            x.PortoDestinoId,
            x.Responsavel,
            x.TamContainer,
            x.Peso,
            x.Observacao,
            x.Status,
            x.Data,
            x.CriadoEm,
            x.AtualizadoEm,
            x.Despachantes.Count,
            x.Documentos.Count);
}
