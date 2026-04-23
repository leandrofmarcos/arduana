using Comex133Api.Core.Auth;
using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Core.Models;
using Comex133Api.Domain.Entities;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Comex133Api.Features.Navios;

public class NaviosService
{
    private readonly AppDbContext _db;
    private readonly IMemoryCache _cache;
    private readonly ILogger<NaviosService> _logger;
    private readonly ICurrentUserContext _currentUser;
    private const string ControleNaviosCacheKey = "logistica:controle-navios:latest";
    private static readonly TimeSpan ControleNaviosCacheTtl = TimeSpan.FromMinutes(10);

    public NaviosService(AppDbContext db, IMemoryCache cache, ILogger<NaviosService> logger, ICurrentUserContext currentUser)
    {
        _db = db;
        _cache = cache;
        _logger = logger;
        _currentUser = currentUser;
    }

    // ── Navios ────────────────────────────────────────────────────────────────

    public async Task<PagedResult<NavioDto>> GetAllAsync(PaginationQuery pagination, bool? ativo = null)
    {
        var query = _db.Navios.AsQueryable();
        if (ativo.HasValue)
            query = query.Where(x => x.Ativo == ativo.Value);

        return await query
            .OrderBy(x => x.NomeNavio)
            .Select(x => ToDto(x))
            .ToPagedResultAsync(pagination);
    }

    public async Task<NavioComTrajetosDto> GetByIdAsync(int id)
    {
        var entity = await _db.Navios
            .Include(x => x.Trajetos)
                .ThenInclude(t => t.PortoOrigem)
            .Include(x => x.Trajetos)
                .ThenInclude(t => t.PortoDestino)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new NotFoundException("Navio", id);

        return ToDtoComTrajetos(entity);
    }

    public async Task<NavioDto> CreateAsync(CreateNavioRequest request)
    {
        var entity = new Navio
        {
            NomeNavio  = request.NomeNavio.Trim(),
            CodigoImo  = request.CodigoImo?.Trim(),
            Armador    = request.Armador?.Trim(),
            Observacao = request.Observacao?.Trim(),
            Ativo      = request.Ativo
        };
        _db.Navios.Add(entity);
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<NavioDto> UpdateAsync(int id, UpdateNavioRequest request)
    {
        var entity = await FindOrThrowAsync(id);
        entity.NomeNavio  = request.NomeNavio.Trim();
        entity.CodigoImo  = request.CodigoImo?.Trim();
        entity.Armador    = request.Armador?.Trim();
        entity.Observacao = request.Observacao?.Trim();
        entity.Ativo      = request.Ativo;
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

        var hasVinculo = await _db.EmbarqueNavioVinculos
            .AnyAsync(v => v.NavioId == id && v.Ativo);

        if (hasVinculo)
            throw new InvalidOperationException(
                "Não é possível excluir um navio com vínculos de embarque ativos.");

        _db.Navios.Remove(entity);
        await _db.SaveChangesAsync();
    }

    // ── NavioTrajeto (pernas da viagem) ───────────────────────────────────────

    public async Task<IList<NavioTrajetoDto>> GetTrajetosAsync(int navioId)
    {
        await FindOrThrowAsync(navioId);

        return await _db.NaviosTrajetos
            .Include(t => t.PortoOrigem)
            .Include(t => t.PortoDestino)
            .Where(t => t.NavioId == navioId)
            .OrderBy(t => t.NumeroViagem)
            .ThenBy(t => t.Sequencia)
            .Select(t => ToTrajetoDto(t))
            .ToListAsync();
    }

    public async Task<NavioTrajetoDto> AddTrajetoAsync(int navioId, CreateNavioTrajetoRequest request)
    {
        await FindOrThrowAsync(navioId);
        await ValidatePortosExistAsync(request.PortoOrigemId, request.PortoDestinoId);

        var (etd, eta) = ParseDates(request.Etd, request.Eta);
        var numeroViagem = NormalizeNumeroViagem(request.NumeroViagem);

        // Upsert idempotente por (NavioId + NumeroViagem + Sequencia)
        // evita duplicação quando o cliente reenvia o mesmo POST.
        var existente = await _db.NaviosTrajetos
            .Include(t => t.PortoOrigem)
            .Include(t => t.PortoDestino)
            .FirstOrDefaultAsync(t =>
                t.NavioId == navioId &&
                t.NumeroViagem == numeroViagem &&
                t.Sequencia == request.Sequencia);

        if (existente is not null)
        {
            existente.PortoOrigemId  = request.PortoOrigemId;
            existente.PortoDestinoId = request.PortoDestinoId;
            existente.Etd            = etd;
            existente.Eta            = eta;
            existente.StatusPerna    = request.StatusPerna;
            existente.Observacao     = request.Observacao?.Trim();

            await _db.SaveChangesAsync();
            await _db.Entry(existente).Reference(t => t.PortoOrigem).LoadAsync();
            await _db.Entry(existente).Reference(t => t.PortoDestino).LoadAsync();
            await SyncEtaEmbarquesAsync(existente.Id, eta);

            return ToTrajetoDto(existente);
        }

        var trajeto = new NavioTrajeto
        {
            NavioId       = navioId,
            NumeroViagem  = numeroViagem,
            Sequencia     = request.Sequencia,
            PortoOrigemId = request.PortoOrigemId,
            PortoDestinoId = request.PortoDestinoId,
            Etd           = etd,
            Eta           = eta,
            StatusPerna   = request.StatusPerna,
            Observacao    = request.Observacao?.Trim()
        };
        _db.NaviosTrajetos.Add(trajeto);
        await _db.SaveChangesAsync();

        await _db.Entry(trajeto).Reference(t => t.PortoOrigem).LoadAsync();
        await _db.Entry(trajeto).Reference(t => t.PortoDestino).LoadAsync();

        return ToTrajetoDto(trajeto);
    }

    public async Task<IList<NavioTrajetoDto>> ReplaceTrajetosAsync(int navioId, IList<CreateNavioTrajetoRequest> requests)
    {
        await FindOrThrowAsync(navioId);

        var payload = requests ?? new List<CreateNavioTrajetoRequest>();
        var normalizedRequests = payload
            .Select((req, idx) => req with
            {
                NumeroViagem = NormalizeNumeroViagem(req.NumeroViagem),
                Sequencia = req.Sequencia > 0 ? req.Sequencia : idx + 1,
                Observacao = req.Observacao?.Trim()
            })
            .ToList();

        foreach (var req in normalizedRequests)
        {
            await ValidatePortosExistAsync(req.PortoOrigemId, req.PortoDestinoId);
            ParseDates(req.Etd, req.Eta);
        }

        var existentes = await _db.NaviosTrajetos
            .Where(t => t.NavioId == navioId)
            .ToListAsync();

        var trajetosComVinculoAtivo = await _db.EmbarqueNavioVinculos
            .Where(v => v.NavioId == navioId && v.Ativo && v.NavioTrajetoId.HasValue)
            .Select(v => v.NavioTrajetoId!.Value)
            .Distinct()
            .ToListAsync();
        var idsComVinculoAtivo = trajetosComVinculoAtivo.ToHashSet();

        var existentesPorChave = new Dictionary<string, NavioTrajeto>(StringComparer.OrdinalIgnoreCase);
        foreach (var group in existentes.GroupBy(t => BuildTrajetoKey(t.NumeroViagem, t.Sequencia)))
        {
            var canonical = group
                .OrderByDescending(t => idsComVinculoAtivo.Contains(t.Id))
                .ThenByDescending(t => t.AtualizadoEm)
                .ThenByDescending(t => t.CriadoEm)
                .First();

            existentesPorChave[group.Key] = canonical;

            var duplicadosRemoviveis = group
                .Where(t => t.Id != canonical.Id && !idsComVinculoAtivo.Contains(t.Id))
                .ToList();

            if (duplicadosRemoviveis.Count > 0)
                _db.NaviosTrajetos.RemoveRange(duplicadosRemoviveis);
        }

        var chavesSolicitadas = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var req in normalizedRequests)
        {
            var chave = BuildTrajetoKey(req.NumeroViagem, req.Sequencia);
            chavesSolicitadas.Add(chave);
            var (etd, eta) = ParseDates(req.Etd, req.Eta);

            if (existentesPorChave.TryGetValue(chave, out var existente))
            {
                existente.PortoOrigemId  = req.PortoOrigemId;
                existente.PortoDestinoId = req.PortoDestinoId;
                existente.Etd            = etd;
                existente.Eta            = eta;
                existente.StatusPerna    = req.StatusPerna;
                existente.Observacao     = req.Observacao;
            }
            else
            {
                _db.NaviosTrajetos.Add(new NavioTrajeto
                {
                    NavioId        = navioId,
                    NumeroViagem   = req.NumeroViagem,
                    Sequencia      = req.Sequencia,
                    PortoOrigemId  = req.PortoOrigemId,
                    PortoDestinoId = req.PortoDestinoId,
                    Etd            = etd,
                    Eta            = eta,
                    StatusPerna    = req.StatusPerna,
                    Observacao     = req.Observacao
                });
            }
        }

        var removiveis = existentes
            .Where(t =>
                !idsComVinculoAtivo.Contains(t.Id) &&
                !chavesSolicitadas.Contains(BuildTrajetoKey(t.NumeroViagem, t.Sequencia)))
            .ToList();

        if (removiveis.Count > 0)
            _db.NaviosTrajetos.RemoveRange(removiveis);

        await _db.SaveChangesAsync();
        return await GetTrajetosAsync(navioId);
    }

    public async Task<NavioTrajetoDto> UpdateTrajetoAsync(int navioId, int trajetoId, UpdateNavioTrajetoRequest request)
    {
        await FindOrThrowAsync(navioId);
        await ValidatePortosExistAsync(request.PortoOrigemId, request.PortoDestinoId);

        var trajeto = await _db.NaviosTrajetos
            .Include(t => t.PortoOrigem)
            .Include(t => t.PortoDestino)
            .FirstOrDefaultAsync(t => t.Id == trajetoId && t.NavioId == navioId)
            ?? throw new NotFoundException("Trajeto", trajetoId);

        var (etd, eta) = ParseDates(request.Etd, request.Eta);

        trajeto.NumeroViagem   = request.NumeroViagem.Trim();
        trajeto.Sequencia      = request.Sequencia;
        trajeto.PortoOrigemId  = request.PortoOrigemId;
        trajeto.PortoDestinoId = request.PortoDestinoId;
        trajeto.Etd            = etd;
        trajeto.Eta            = eta;
        trajeto.StatusPerna    = request.StatusPerna;
        trajeto.Observacao     = request.Observacao?.Trim();

        await _db.SaveChangesAsync();

        await _db.Entry(trajeto).Reference(t => t.PortoOrigem).LoadAsync();
        await _db.Entry(trajeto).Reference(t => t.PortoDestino).LoadAsync();

        // Sincronizar ETA nos embarques vinculados a esta perna
        await SyncEtaEmbarquesAsync(trajetoId, eta);

        return ToTrajetoDto(trajeto);
    }

    public async Task<NavioTrajetoDto> UpdateTrajetoStatusAsync(int navioId, int trajetoId, StatusPerna status)
    {
        await FindOrThrowAsync(navioId);

        var trajeto = await _db.NaviosTrajetos
            .Include(t => t.PortoOrigem)
            .Include(t => t.PortoDestino)
            .FirstOrDefaultAsync(t => t.Id == trajetoId && t.NavioId == navioId)
            ?? throw new NotFoundException("Trajeto", trajetoId);

        trajeto.StatusPerna = status;
        await _db.SaveChangesAsync();

        return ToTrajetoDto(trajeto);
    }

    public async Task DeleteTrajetoAsync(int navioId, int trajetoId)
    {
        await FindOrThrowAsync(navioId);

        var trajeto = await _db.NaviosTrajetos
            .FirstOrDefaultAsync(t => t.Id == trajetoId && t.NavioId == navioId)
            ?? throw new NotFoundException("Trajeto", trajetoId);

        var hasVinculo = await _db.EmbarqueNavioVinculos
            .AnyAsync(v => v.NavioTrajetoId == trajetoId && v.Ativo);

        if (hasVinculo)
            throw new InvalidOperationException(
                "Não é possível excluir uma perna com vínculos de embarque ativos.");

        _db.NaviosTrajetos.Remove(trajeto);
        await _db.SaveChangesAsync();
    }

    // ── EmbarqueNavioVinculo ──────────────────────────────────────────────────

    public async Task<EmbarqueNavioVinculoDto?> GetVinculoAsync(int embarqueId)
    {
        // Despachante pode ver apenas o vinculo de embarques seus
        if (_currentUser.HasRole("Despachante"))
        {
            var despachanteId = await _currentUser.GetVinculoIdAsync("Despachante");
            if (despachanteId is null)
                throw new ForbiddenException("Despachante sem vínculo cadastrado.");

            var temAcesso = await _db.Set<SolicitacaoOrcamentoDespachante>()
                .AnyAsync(x => x.SolicitacaoOrcamentoId == embarqueId && x.DespachanteId == despachanteId.Value);

            if (!temAcesso)
                throw new ForbiddenException("Acesso negado a este embarque.");
        }

        var vinculo = await _db.EmbarqueNavioVinculos
            .Include(v => v.Navio)
            .Include(v => v.NavioTrajeto)
                .ThenInclude(t => t!.PortoOrigem)
            .Include(v => v.NavioTrajeto)
                .ThenInclude(t => t!.PortoDestino)
            .FirstOrDefaultAsync(v => v.EmbarqueAduanaId == embarqueId && v.Ativo);

        return vinculo is null ? null : ToVinculoDto(vinculo);
    }

    public async Task<EmbarqueNavioVinculoDto> CreateVinculoAsync(int embarqueId, CreateEmbarqueNavioVinculoRequest request)
    {
        // Verificar embarque existe
        var embarque = await _db.SolicitacoesOrcamento.FindAsync(embarqueId)
            ?? throw new NotFoundException("Embarque", embarqueId);

        // Verificar navio existe e está ativo
        var navio = await _db.Navios.FindAsync(request.NavioId)
            ?? throw new NotFoundException("Navio", request.NavioId);

        if (!navio.Ativo)
            throw new InvalidOperationException("Não é possível vincular a um navio inativo.");

        // Desativar vínculo anterior se existir
        var vinculoAtivo = await _db.EmbarqueNavioVinculos
            .FirstOrDefaultAsync(v => v.EmbarqueAduanaId == embarqueId && v.Ativo);

        if (vinculoAtivo is not null)
        {
            vinculoAtivo.Ativo          = false;
            vinculoAtivo.DesvinculadoEm = DateTime.UtcNow;
        }

        // Criar novo vínculo
        var vinculo = new EmbarqueNavioVinculo
        {
            EmbarqueAduanaId = embarqueId,
            NavioId          = request.NavioId,
            NavioTrajetoId   = request.NavioTrajetoId,
            NumeroViagem     = request.NumeroViagem?.Trim(),
            Ativo            = true,
            VinculadoEm      = DateTime.UtcNow,
            Observacao       = request.Observacao?.Trim()
        };
        _db.EmbarqueNavioVinculos.Add(vinculo);
        await _db.SaveChangesAsync();

        await _db.Entry(vinculo).Reference(v => v.Navio).LoadAsync();

        return ToVinculoDto(vinculo);
    }

    public async Task<EmbarqueNavioVinculoDto> UpdateVinculoAsync(int embarqueId, UpdateEmbarqueNavioVinculoRequest request)
    {
        var vinculo = await _db.EmbarqueNavioVinculos
            .Include(v => v.Navio)
            .FirstOrDefaultAsync(v => v.EmbarqueAduanaId == embarqueId && v.Ativo)
            ?? throw new NotFoundException($"Vínculo ativo para o embarque {embarqueId} não encontrado.");

        vinculo.NavioTrajetoId = request.NavioTrajetoId;
        vinculo.NumeroViagem   = request.NumeroViagem?.Trim();
        vinculo.Observacao     = request.Observacao?.Trim();

        await _db.SaveChangesAsync();

        return ToVinculoDto(vinculo);
    }

    public async Task DeleteVinculoAsync(int embarqueId)
    {
        var vinculo = await _db.EmbarqueNavioVinculos
            .FirstOrDefaultAsync(v => v.EmbarqueAduanaId == embarqueId && v.Ativo)
            ?? throw new NotFoundException($"Vínculo ativo para o embarque {embarqueId} não encontrado.");

        vinculo.Ativo          = false;
        vinculo.DesvinculadoEm = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    // ── Logística — visão operacional ─────────────────────────────────────────

    public async Task<IList<NavioOperacionalDto>> GetControleNaviosOperacionalAsync()
    {
        // Determina filtro de despachante (null = sem filtro = Admin)
        int? despachanteIdFiltro = null;
        if (_currentUser.HasRole("Despachante"))
        {
            despachanteIdFiltro = await _currentUser.GetVinculoIdAsync("Despachante");
            if (despachanteIdFiltro is null)
                return new List<NavioOperacionalDto>();
        }

        try
        {
            var result = await GetControleNaviosOperacionalCoreAsync(despachanteIdFiltro);

            _cache.Set(ControleNaviosCacheKey, result, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ControleNaviosCacheTtl
            });

            return result;
        }
        catch (Exception ex) when (IsTransientSqlFailure(ex))
        {
            if (_cache.TryGetValue(ControleNaviosCacheKey, out IList<NavioOperacionalDto>? cached) && cached is not null)
            {
                _logger.LogWarning(ex,
                    "Falha SQL transitória em controle-navios. Retornando snapshot em cache com {Count} navios.",
                    cached.Count);
                return cached;
            }

            _logger.LogWarning(ex,
                "Falha SQL transitória em controle-navios sem snapshot em cache disponível.");
            throw;
        }
    }

    private async Task<IList<NavioOperacionalDto>> GetControleNaviosOperacionalCoreAsync(int? despachanteId = null)
    {
        // Buscar vínculos de embarque ativos para compor contagem operacional
        var vinculosQuery = _db.EmbarqueNavioVinculos
            .Include(v => v.Navio)
            .Include(v => v.NavioTrajeto)
                .ThenInclude(t => t!.PortoOrigem)
            .Include(v => v.NavioTrajeto)
                .ThenInclude(t => t!.PortoDestino)
            .Include(v => v.EmbarqueAduana)
                .ThenInclude(e => e.Cliente)
            .Include(v => v.EmbarqueAduana)
                .ThenInclude(e => e.Despachantes)
            .Where(v => v.Ativo);

        // Filtrar pelo despachante quando fornecido
        if (despachanteId.HasValue)
            vinculosQuery = vinculosQuery.Where(v =>
                v.EmbarqueAduana.Despachantes.Any(d => d.DespachanteId == despachanteId.Value));

        var vinculos = await vinculosQuery.ToListAsync();

        // Filtrar embarques ativos (status diferente de Entregue/Finalizado)
        var statusFinais = new[] { "Entregue", "Finalizado", "Cancelado" };
        var vinculosAtivos = vinculos
            .Where(v =>
                v.Navio is not null &&
                v.EmbarqueAduana is not null &&
                !statusFinais.Contains(v.EmbarqueAduana.Status ?? string.Empty, StringComparer.OrdinalIgnoreCase))
            .ToList();

        // Agrupar vínculos ativos por navio
        var grupos = vinculosAtivos
            .GroupBy(v => v.NavioId)
            .ToDictionary(g => g.Key, g => g.ToList());

        // Buscar todos os trajetos cadastrados para navios ativos.
        // Isso garante que um trajeto recém salvo apareça no controle,
        // mesmo quando ainda não existem embarques vinculados.
        var trajetos = await _db.NaviosTrajetos
            .Include(t => t.Navio)
            .Include(t => t.PortoOrigem)
            .Include(t => t.PortoDestino)
            .Where(t => t.Navio != null && t.Navio.Ativo)
            .OrderBy(t => t.NumeroViagem)
            .ThenBy(t => t.Sequencia)
            .ToListAsync();

        // União dos navios com vínculos ativos + navios que possuem trajetos
        var navioIds = grupos.Keys
            .Union(trajetos.Select(t => t.NavioId))
            .Distinct()
            .ToList();

        if (!navioIds.Any())
            return new List<NavioOperacionalDto>();

        var navios = await _db.Navios
            .Where(n => navioIds.Contains(n.Id) && n.Ativo)
            .ToDictionaryAsync(n => n.Id, n => n);

        var trajetosPorNavio = trajetos.GroupBy(t => t.NavioId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var result = new List<NavioOperacionalDto>();

        foreach (var navioId in navioIds)
        {
            if (!navios.TryGetValue(navioId, out var navio))
                continue;

            var grupo = grupos.TryGetValue(navioId, out var grupoAtivo)
                ? grupoAtivo
                : new List<EmbarqueNavioVinculo>();

            var trajetosDoNavio = trajetosPorNavio.TryGetValue(navioId, out var tj) ? tj : new();

            // Porto atual: perna Atracado mais recente ou Em Transito
            var pernaAtual = trajetosDoNavio
                .Where(t => t.StatusPerna == StatusPerna.Atracado || t.StatusPerna == StatusPerna.EmTransito)
                .OrderByDescending(t => t.Sequencia)
                .FirstOrDefault();

            var portoAtual = pernaAtual is not null
                ? (pernaAtual.StatusPerna == StatusPerna.Atracado
                    ? pernaAtual.PortoDestino?.Nome
                    : pernaAtual.PortoOrigem?.Nome)
                : null;

            // Montar trajetos com embarques vinculados em cada perna
            var trajetosDtos = trajetosDoNavio.Select(t =>
            {
                var embarquesDaPerna = grupo
                    .Where(v => v.NavioTrajetoId == t.Id && v.EmbarqueAduana is not null)
                    .Select(v => new EmbarqueResumoDto(
                        v.EmbarqueAduanaId,
                        v.EmbarqueAduana.CodigoInterno ?? string.Empty,
                        v.EmbarqueAduana.Status ?? string.Empty,
                        v.NumeroViagem,
                        v.EmbarqueAduana.Cliente?.RazaoSocial,
                        v.EmbarqueAduana.TamContainer,
                        ToDateOnly(t.Eta)
                    )).ToList();

                return new NavioTrajetoOperacionalDto(
                    t.Id,
                    t.NumeroViagem,
                    t.Sequencia,
                    t.PortoOrigemId,
                    t.PortoOrigem?.Nome ?? string.Empty,
                    t.PortoDestinoId,
                    t.PortoDestino?.Nome ?? string.Empty,
                    ToDateOnly(t.Etd),
                    ToDateOnly(t.Eta),
                    t.StatusPerna,
                    embarquesDaPerna
                );
            }).ToList();

            result.Add(new NavioOperacionalDto(
                navio.Id,
                navio.NomeNavio,
                navio.CodigoImo,
                navio.Armador,
                grupo.Count(),
                portoAtual,
                trajetosDtos
            ));
        }

        return result.OrderBy(x => x.NomeNavio).ToList();
    }

    private static bool IsTransientSqlFailure(Exception ex)
    {
        var sqlEx = ex as SqlException ?? ex.InnerException as SqlException;
        if (sqlEx is null)
            return false;

        foreach (SqlError error in sqlEx.Errors)
        {
            if (error.Number is 17892 or 18456 or 233)
                return true;
        }

        return false;
    }

    // ── Auxiliares ────────────────────────────────────────────────────────────

    private async Task<Navio> FindOrThrowAsync(int id) =>
        await _db.Navios.FindAsync(id)
        ?? throw new NotFoundException("Navio", id);

    private async Task ValidatePortosExistAsync(int origemId, int destinoId)
    {
        if (!await _db.PortosOrigem.AnyAsync(p => p.Id == origemId))
            throw new NotFoundException("Porto de Origem", origemId);
        if (!await _db.PortosDestino.AnyAsync(p => p.Id == destinoId))
            throw new NotFoundException("Porto de Destino", destinoId);
    }

    private async Task SyncEtaEmbarquesAsync(int trajetoId, DateTime novaEta)
    {
        // Futura extensão: atualizar campo de ETA esperado nos embarques vinculados
        // Atualmente apenas registra — implementar conforme o campo for adicionado ao SolicitacaoOrcamento
        await Task.CompletedTask;
    }

    private static (DateTime etd, DateTime eta) ParseDates(string etdStr, string etaStr)
    {
        if (!DateTime.TryParse(etdStr, out var etd))
            throw new ArgumentException($"ETD inválido: {etdStr}");
        if (!DateTime.TryParse(etaStr, out var eta))
            throw new ArgumentException($"ETA inválido: {etaStr}");
        return (etd.Date, eta.Date);
    }

    private static string NormalizeNumeroViagem(string? numeroViagem)
    {
        var value = (numeroViagem ?? string.Empty).Trim();
        return string.IsNullOrWhiteSpace(value) ? "SEM-VIAGEM" : value;
    }

    private static string BuildTrajetoKey(string numeroViagem, int sequencia) =>
        $"{NormalizeNumeroViagem(numeroViagem)}::{sequencia}";

    private static string ToDateOnly(DateTime dt) => dt.ToString("yyyy-MM-dd");

    // ── Mapeamento ────────────────────────────────────────────────────────────

    private static NavioDto ToDto(Navio x) => new(
        x.Id, x.NomeNavio, x.CodigoImo, x.Armador, x.Observacao, x.Ativo,
        x.CriadoEm, x.AtualizadoEm);

    private static NavioComTrajetosDto ToDtoComTrajetos(Navio x) => new(
        x.Id, x.NomeNavio, x.CodigoImo, x.Armador, x.Observacao, x.Ativo,
        x.CriadoEm, x.AtualizadoEm,
        x.Trajetos.OrderBy(t => t.NumeroViagem).ThenBy(t => t.Sequencia)
            .Select(ToTrajetoDto).ToList());

    private static NavioTrajetoDto ToTrajetoDto(NavioTrajeto t) => new(
        t.Id, t.NavioId, t.NumeroViagem, t.Sequencia,
        t.PortoOrigemId,  t.PortoOrigem?.Nome  ?? "",
        t.PortoDestinoId, t.PortoDestino?.Nome ?? "",
        ToDateOnly(t.Etd), ToDateOnly(t.Eta),
        t.StatusPerna, t.Observacao,
        t.CriadoEm, t.AtualizadoEm);

    private static EmbarqueNavioVinculoDto ToVinculoDto(EmbarqueNavioVinculo v) => new(
        v.Id, v.EmbarqueAduanaId, v.NavioId,
        v.Navio?.NomeNavio ?? "",
        v.NavioTrajetoId, v.NumeroViagem, v.Ativo,
        v.VinculadoEm, v.DesvinculadoEm, v.Observacao,
        v.CriadoEm, v.AtualizadoEm);
}

// ── DTOs da visão operacional ─────────────────────────────────────────────────

public record NavioOperacionalDto(
    int     NavioId,
    string  NomeNavio,
    string? CodigoImo,
    string? Armador,
    int     EmbarquesAtivos,
    string? PortoAtualNome,
    IList<NavioTrajetoOperacionalDto> Trajetos
);

public record NavioTrajetoOperacionalDto(
    int         Id,
    string      NumeroViagem,
    int         Sequencia,
    int         PortoOrigemId,
    string      PortoOrigemNome,
    int         PortoDestinoId,
    string      PortoDestinoNome,
    string      Etd,
    string      Eta,
    StatusPerna StatusPerna,
    IList<EmbarqueResumoDto> Embarques
);

public record EmbarqueResumoDto(
    int     EmbarqueId,
    string  CodigoInterno,
    string  Status,
    string? NumeroViagem,
    string? ClienteNome,
    string? ContainerBl,
    string? Eta
);
