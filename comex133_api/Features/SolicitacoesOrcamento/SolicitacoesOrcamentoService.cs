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

        if (_currentUser.HasRole("Despachante"))
        {
            var despachanteId = await _currentUser.GetVinculoIdAsync("Despachante");
            if (despachanteId is null || !entity.Despachantes.Any(d => d.DespachanteId == despachanteId.Value))
                throw new ForbiddenException("Acesso negado a esta solicitação.");
        }

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
            Status = "AguardandoDespachante",
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
        entity.Data = request.Data;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(entity.Id);
    }

    public async Task UpdateStatusAsync(int id, string status)
    {
        var normalized = (status ?? string.Empty).Trim();

        if (normalized == "Aprovada")
        {
            await AprovarAsync(id);
            return;
        }

        if (normalized == "Cancelada")
        {
            await CancelarAsync(id);
            return;
        }

        throw new BusinessException("Somente os status 'Aprovada' ou 'Cancelada' podem ser definidos manualmente.");
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await FindSolicitacaoOrThrowAsync(id);

        // Remove dependências com FK Restrict para evitar conflito ao excluir a solicitação.
        var embarqueVinculos = await _db.EmbarqueNavioVinculos
            .Where(x => x.EmbarqueAduanaId == id)
            .ToListAsync();
        if (embarqueVinculos.Count > 0)
            _db.RemoveRange(embarqueVinculos);

        var orcamentoIds = await _db.OrcamentosVenda
            .Where(x => x.SolicitacaoOrcamentoId == id)
            .Select(x => x.Id)
            .ToListAsync();

        var custoIds = await _db.CustosDespachante
            .Where(x => x.SolicitacaoOrcamentoId == id)
            .Select(x => x.Id)
            .ToListAsync();

        // Remove vínculos OrcamentosVendaCustos antes de excluir orçamentos e custos
        var ovCustos = await _db.OrcamentosVendaCustos
            .Where(x => orcamentoIds.Contains(x.OrcamentoVendaId) || custoIds.Contains(x.CustoDespachanteId))
            .ToListAsync();
        if (ovCustos.Count > 0)
            _db.RemoveRange(ovCustos);

        var orcamentos = await _db.OrcamentosVenda
            .Where(x => orcamentoIds.Contains(x.Id))
            .ToListAsync();
        if (orcamentos.Count > 0)
            _db.RemoveRange(orcamentos);

        var custos = await _db.CustosDespachante
            .Where(x => custoIds.Contains(x.Id))
            .ToListAsync();
        if (custos.Count > 0)
            _db.RemoveRange(custos);

        _db.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<SolicitacaoOrcamentoDespachanteDto>> GetDespachantesAsync(int solicitacaoId)
    {
        await EnsureSolicitacaoAccessAsync(solicitacaoId);

        var query = _db.Set<SolicitacaoOrcamentoDespachante>()
            .AsNoTracking()
            .Where(x => x.SolicitacaoOrcamentoId == solicitacaoId);

        // Despachante vê apenas o próprio vínculo
        if (_currentUser.HasRole("Despachante"))
        {
            var despachanteId = await _currentUser.GetVinculoIdAsync("Despachante");
            query = query.Where(x => x.DespachanteId == despachanteId!.Value);
        }

        return await query
            .OrderByDescending(x => x.DataEnvio)
            .Select(x => new SolicitacaoOrcamentoDespachanteDto(
                x.Id,
                x.SolicitacaoOrcamentoId,
                x.DespachanteId,
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

        var solicitacao = await _db.Set<SolicitacaoOrcamento>()
            .AsNoTracking()
            .FirstAsync(x => x.Id == solicitacaoId);

        var entity = new SolicitacaoOrcamentoDespachante
        {
            SolicitacaoOrcamentoId = solicitacaoId,
            DespachanteId = request.DespachanteId,
            Status = "PendenteDespachante",
            DataEnvio = request.DataEnvio
        };

        _db.Add(entity);

        // Auto-cria CustoDespachante somente se ainda não existir custo para a combinação solicitação + despachante.
        var jaExisteCusto = await _db.CustosDespachante
            .AnyAsync(x => x.SolicitacaoOrcamentoId == solicitacaoId && x.DespachanteId == request.DespachanteId);

        if (!jaExisteCusto)
        {
            var custoCodigo = await GerarCodigoCustoInternoAsync();
            var custo = new CustoDespachante
            {
                CodigoInterno          = custoCodigo,
                SolicitacaoOrcamentoId = solicitacaoId,
                DespachanteId          = request.DespachanteId,
                ImportadorId           = solicitacao.ImportadorId,
                PortoOrigemId          = solicitacao.PortoOrigemId,
                PortoDestinoId         = solicitacao.PortoDestinoId,
                Responsavel            = solicitacao.Responsavel ?? string.Empty,
                TamContainer           = solicitacao.TamContainer ?? "LCL",
                Peso                   = solicitacao.Peso,
                FobUsd                 = 0,
                FobReais               = 0,
                CifUsd                 = 0,
                CifReais               = 0,
                SeguroUsd              = 0,
                TaxaUsd                = 1,
                Data                   = request.DataEnvio,
                Status                 = "Pendente",
                Versao                 = 1,
                Imutavel               = false
            };
            _db.Add(custo);
        }

        await _db.SaveChangesAsync();

        return new SolicitacaoOrcamentoDespachanteDto(
            entity.Id,
            entity.SolicitacaoOrcamentoId,
            entity.DespachanteId,
            entity.DataEnvio,
            entity.CriadoEm,
            entity.AtualizadoEm);
    }

    public async Task AprovarAsync(int id)
    {
        var entity = await FindSolicitacaoOrThrowAsync(id);

        if (entity.Status != "AguardandoAprovacaoCliente")
            throw new BusinessException($"A solicitação precisa estar em 'AguardandoAprovacaoCliente' para ser aprovada. Status atual: {entity.Status}");

        entity.Status = "Aprovada";
        await _db.SaveChangesAsync();
    }

    public async Task CancelarAsync(int id)
    {
        var entity = await FindSolicitacaoOrThrowAsync(id);

        if (entity.Status != "AguardandoAprovacaoCliente")
            throw new BusinessException($"A solicitação precisa estar em 'AguardandoAprovacaoCliente' para ser cancelada. Status atual: {entity.Status}");

        entity.Status = "Cancelada";

        // Ao cancelar a solicitação (sem virar embarque), cancela as versões correntes de custos e orçamento.
        var custosCorrentes = await _db.CustosDespachante
            .Where(c => c.SolicitacaoOrcamentoId == id)
            .Where(c => !_db.CustosDespachante.Any(n => n.VersaoAnteriorId == c.Id))
            .ToListAsync();

        foreach (var custo in custosCorrentes)
        {
            if (custo.Status != "CanceladoPeloOV")
                custo.Status = "CanceladoPeloOV";
        }

        var orcamentosCorrentes = await _db.OrcamentosVenda
            .Where(o => o.SolicitacaoOrcamentoId == id)
            .Where(o => !_db.OrcamentosVenda.Any(n => n.VersaoAnteriorId == o.Id))
            .ToListAsync();

        foreach (var ov in orcamentosCorrentes)
        {
            if (ov.Status != "Cancelado")
                ov.Status = "Cancelado";
        }

        await _db.SaveChangesAsync();
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
        await EnsureSolicitacaoAccessAsync(solicitacaoId);

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

    /// <summary>
    /// Verifica existência e, para Despachante, verifica que está vinculado à solicitação.
    /// </summary>
    private async Task EnsureSolicitacaoAccessAsync(int solicitacaoId)
    {
        await EnsureSolicitacaoExistsAsync(solicitacaoId);

        if (!_currentUser.HasRole("Despachante")) return;

        var despachanteId = await _currentUser.GetVinculoIdAsync("Despachante");
        if (despachanteId is null)
            throw new ForbiddenException("Despachante sem vínculo cadastrado.");

        var temAcesso = await _db.Set<SolicitacaoOrcamentoDespachante>()
            .AnyAsync(x => x.SolicitacaoOrcamentoId == solicitacaoId && x.DespachanteId == despachanteId.Value);

        if (!temAcesso)
            throw new ForbiddenException("Acesso negado a esta solicitação.");
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

    private async Task<string> GerarCodigoCustoInternoAsync()
    {
        var year   = DateTime.UtcNow.Year;
        var prefix = $"CD-{year}-";

        var last = await _db.CustosDespachante
            .AsNoTracking()
            .Where(x => x.CodigoInterno.StartsWith(prefix))
            .OrderByDescending(x => x.Id)
            .Select(x => x.CodigoInterno)
            .FirstOrDefaultAsync();

        var next = 1;
        if (!string.IsNullOrWhiteSpace(last) && last.Length >= prefix.Length + 3)
        {
            var suffix = last[prefix.Length..];
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
