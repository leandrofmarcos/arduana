using Comex133Api.Core.Auth;
using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Core.Models;
using Comex133Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.CustosDespachante;

public class CustosDespachanteService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserContext _currentUser;

    private static readonly HashSet<string> StatusEditaveis = new() { "Pendente", "EmAndamento", "ReabertoPeloOV" };

    public CustosDespachanteService(AppDbContext db, ICurrentUserContext currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    // ── Listagem ──────────────────────────────────────────────────────────────

    public async Task<PagedResult<CustoDespachanteListDto>> GetAllAsync(PaginationQuery pagination, int? solicitacaoOrcamentoId = null)
    {
        var query = _db.CustosDespachante.AsNoTracking();

        if (solicitacaoOrcamentoId.HasValue)
            query = query.Where(x => x.SolicitacaoOrcamentoId == solicitacaoOrcamentoId.Value);

        // Despachante só vê os próprios custos
        if (_currentUser.HasRole("Despachante"))
        {
            var despachanteId = await _currentUser.GetVinculoIdAsync("Despachante");
            if (despachanteId is null)
                return PagedResult<CustoDespachanteListDto>.Empty(pagination);

            query = query.Where(x => x.DespachanteId == despachanteId.Value);
        }

        return await query
            .OrderByDescending(x => x.Data)
            .ThenByDescending(x => x.Id)
            .Select(x => ToListDto(x))
            .ToPagedResultAsync(pagination);
    }

    // ── Detalhe ───────────────────────────────────────────────────────────────

    public async Task<CustoDespachanteDto> GetByIdAsync(int id)
    {
        var entity = await LoadFullOrThrowAsync(id);
        await EnsureDespachanteAccessAsync(entity);
        return ToDto(entity);
    }

    // ── Criar ─────────────────────────────────────────────────────────────────

    public async Task<CustoDespachanteDto> CreateAsync(CreateCustoDespachanteRequest request)
    {
        await ValidarReferencesAsync(request.DespachanteId, request.ImportadorId, request.PortoOrigemId, request.PortoDestinoId);

        if (request.SolicitacaoOrcamentoId.HasValue)
        {
            var solExists = await _db.SolicitacoesOrcamento.AnyAsync(x => x.Id == request.SolicitacaoOrcamentoId.Value);
            if (!solExists)
                throw new NotFoundException("SolicitacaoOrcamento", request.SolicitacaoOrcamentoId.Value);
        }

        var entity = new Domain.Entities.CustoDespachante
        {
            CodigoInterno      = await GerarCodigoInternoAsync(),
            SolicitacaoOrcamentoId = request.SolicitacaoOrcamentoId,
            DespachanteId      = request.DespachanteId,
            ImportadorId       = request.ImportadorId,
            PortoOrigemId      = request.PortoOrigemId,
            PortoDestinoId     = request.PortoDestinoId,
            Responsavel        = request.Responsavel.Trim(),
            TamContainer       = request.TamContainer.Trim().ToUpperInvariant(),
            Peso               = request.Peso,
            FobUsd             = request.FobUsd,
            FobReais           = request.FobReais,
            CifUsd             = request.CifUsd,
            CifReais           = request.CifReais,
            SeguroUsd          = request.SeguroUsd,
            FreteInternacionalUsd = request.FreteInternacionalUsd,
            TaxaUsd            = request.TaxaUsd,
            TaxaUsdAgente      = request.TaxaUsdAgente,
            Observacao         = request.Observacao?.Trim(),
            Data               = request.Data,
            Status             = "Pendente",
            Versao             = 1,
            Imutavel           = false
        };

        _db.Add(entity);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(entity.Id);
    }

    // ── Editar ────────────────────────────────────────────────────────────────

    public async Task<CustoDespachanteDto> UpdateAsync(int id, UpdateCustoDespachanteRequest request)
    {
        var entity = await LoadFullOrThrowAsync(id);
        await EnsureDespachanteAccessAsync(entity);
        EnsureEditavel(entity);

        await ValidarReferencesAsync(entity.DespachanteId, request.ImportadorId, request.PortoOrigemId, request.PortoDestinoId);

        entity.ImportadorId  = request.ImportadorId;
        entity.PortoOrigemId = request.PortoOrigemId;
        entity.PortoDestinoId = request.PortoDestinoId;
        entity.Responsavel   = request.Responsavel.Trim();
        entity.TamContainer  = request.TamContainer.Trim().ToUpperInvariant();
        entity.Peso          = request.Peso;
        entity.FobUsd        = request.FobUsd;
        entity.FobReais      = request.FobReais;
        entity.CifUsd        = request.CifUsd;
        entity.CifReais      = request.CifReais;
        entity.SeguroUsd     = request.SeguroUsd;
        entity.FreteInternacionalUsd = request.FreteInternacionalUsd;
        entity.TaxaUsd       = request.TaxaUsd;
        entity.TaxaUsdAgente = request.TaxaUsdAgente;
        entity.Observacao    = request.Observacao?.Trim();
        entity.Data          = request.Data;

        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    // ── Transições de status ──────────────────────────────────────────────────

    /// <summary>Despachante inicia o trabalho: Pendente → EmAndamento</summary>
    public async Task<CustoDespachanteDto> IniciarAsync(int id)
    {
        var entity = await LoadFullOrThrowAsync(id);
        await EnsureDespachanteAccessAsync(entity);

        if (entity.Status != "Pendente")
            throw new BusinessException($"O custo precisa estar em 'Pendente' para ser iniciado. Status atual: {entity.Status}");

        entity.Status = "EmAndamento";
        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    /// <summary>Despachante finaliza o custo: EmAndamento → Finalizado.
    /// Disparata recalculo do status da solicitação vinculada.</summary>
    public async Task<CustoDespachanteDto> FinalizarAsync(int id)
    {
        var entity = await LoadFullOrThrowAsync(id);
        await EnsureDespachanteAccessAsync(entity);

        if (entity.Status != "EmAndamento" && entity.Status != "ReabertoPeloOV")
            throw new BusinessException($"O custo precisa estar em 'EmAndamento' ou 'Reaberto' para ser finalizado. Status atual: {entity.Status}");

        entity.Status   = "Finalizado";
        entity.Imutavel = true;

        if (entity.SolicitacaoOrcamentoId.HasValue)
            await EnsureOrcamentoVendaGeradoAsync(entity);

        await _db.SaveChangesAsync();

        if (entity.SolicitacaoOrcamentoId.HasValue)
            await RecalcularStatusSolicitacaoAsync(entity.SolicitacaoOrcamentoId.Value);

        return await GetByIdAsync(entity.Id);
    }

    /// <summary>Reabre um custo finalizado criando nova versão corrente.
    /// Guarda: deve estar Finalizado, ser a versão mais recente
    /// e a solicitação vinculada NÃO pode estar Aprovada.</summary>
    public async Task<CustoDespachanteDto> ReabrirAsync(int id)
    {
        var entity = await LoadFullOrThrowAsync(id);
        await EnsureDespachanteAccessAsync(entity);

        if (entity.Status != "Finalizado")
            throw new BusinessException($"Apenas custos finalizados podem ser reabertos. Status atual: {entity.Status}");

        var possuiVersaoMaisNova = await _db.CustosDespachante
            .AsNoTracking()
            .AnyAsync(x => x.VersaoAnteriorId == entity.Id);

        if (possuiVersaoMaisNova)
            throw new BusinessException("Este custo já possui uma versão mais nova e não pode ser reaberto diretamente.");

        if (entity.SolicitacaoOrcamentoId.HasValue)
        {
            var solStatus = await _db.SolicitacoesOrcamento
                .AsNoTracking()
                .Where(x => x.Id == entity.SolicitacaoOrcamentoId.Value)
                .Select(x => x.Status)
                .FirstOrDefaultAsync();

            if (solStatus == "Aprovada")
                throw new BusinessException("Não é possível reabrir um custo de uma solicitação já aprovada (embarque gerado).");
        }

        entity.Imutavel = true;

        var novaVersao = new Domain.Entities.CustoDespachante
        {
            CodigoInterno          = await GerarCodigoInternoAsync(),
            SolicitacaoOrcamentoId = entity.SolicitacaoOrcamentoId,
            DespachanteId          = entity.DespachanteId,
            ImportadorId           = entity.ImportadorId,
            PortoOrigemId          = entity.PortoOrigemId,
            PortoDestinoId         = entity.PortoDestinoId,
            Responsavel            = entity.Responsavel,
            TamContainer           = entity.TamContainer,
            Peso                   = entity.Peso,
            FobUsd                 = entity.FobUsd,
            FobReais               = entity.FobReais,
            CifUsd                 = entity.CifUsd,
            CifReais               = entity.CifReais,
            SeguroUsd              = entity.SeguroUsd,
            FreteInternacionalUsd  = entity.FreteInternacionalUsd,
            TaxaUsd                = entity.TaxaUsd,
            TaxaUsdAgente          = entity.TaxaUsdAgente,
            Observacao             = entity.Observacao,
            Data                   = entity.Data,
            Status                 = "ReabertoPeloOV",
            Versao                 = entity.Versao + 1,
            VersaoAnteriorId       = entity.Id,
            Imutavel               = false
        };

        _db.Add(novaVersao);
        await _db.SaveChangesAsync();

        if (entity.Lis.Any())
        {
            var lis = entity.Lis.Select(li => new CustoDespachanteLi
            {
                CustoDespachanteId = novaVersao.Id,
                Ncm = li.Ncm,
                Descricao = li.Descricao,
                Valor = li.Valor,
                Data = li.Data
            }).ToList();
            _db.CustosDespachantelis.AddRange(lis);
        }

        if (entity.Despesas.Any())
        {
            var despesas = entity.Despesas.Select(d => new CustoDespachanteDespesa
            {
                CustoDespachanteId = novaVersao.Id,
                Descricao = d.Descricao,
                Valor = d.Valor,
                Data = d.Data,
                EntraBaseIcms = d.EntraBaseIcms
            }).ToList();
            _db.CustosDepesas.AddRange(despesas);
        }

        await _db.SaveChangesAsync();

        foreach (var ncm in entity.Ncms)
        {
            var novoNcm = new NcmVinculadoCusto
            {
                CustoDespachanteId = novaVersao.Id,
                NcmId = ncm.NcmId,
                NumeroNcm = ncm.NumeroNcm,
                Descricao = ncm.Descricao,
                AliIi = ncm.AliIi,
                AliIpi = ncm.AliIpi,
                AliPis = ncm.AliPis,
                AliCofins = ncm.AliCofins,
                AliIcms = ncm.AliIcms,
                BaseCalculo = ncm.BaseCalculo
            };
            _db.NcmsVinculadosCusto.Add(novoNcm);
            await _db.SaveChangesAsync();

            if (ncm.ValoresImposto.Any())
            {
                var valores = ncm.ValoresImposto.Select(v => new ValorImpostoCusto
                {
                    NcmVinculadoCustoId = novoNcm.Id,
                    AliIi = v.AliIi,
                    ValorIi = v.ValorIi,
                    AliIpi = v.AliIpi,
                    ValorIpi = v.ValorIpi,
                    AliPis = v.AliPis,
                    ValorPis = v.ValorPis,
                    AliCofins = v.AliCofins,
                    ValorCofins = v.ValorCofins,
                    AliIcms = v.AliIcms,
                    ValorIcms = v.ValorIcms,
                    TotalImpostos = v.TotalImpostos
                }).ToList();
                _db.ValoresImpostoCusto.AddRange(valores);
                await _db.SaveChangesAsync();
            }
        }

        var vinculosOv = await _db.OrcamentosVendaCustos
            .Include(v => v.OrcamentoVenda)
            .Where(v => v.CustoDespachanteId == entity.Id)
            .ToListAsync();

        foreach (var vinculo in vinculosOv)
        {
            vinculo.CustoDespachanteId = novaVersao.Id;
            if (vinculo.OrcamentoVenda.Status == "Finalizado")
                vinculo.OrcamentoVenda.Status = "EmAndamento";
        }

        await _db.SaveChangesAsync();

        if (entity.SolicitacaoOrcamentoId.HasValue)
            await RecalcularStatusSolicitacaoAsync(entity.SolicitacaoOrcamentoId.Value);

        return await GetByIdAsync(novaVersao.Id);
    }

    // ── Excluir ───────────────────────────────────────────────────────────────

    public async Task DeleteAsync(int id)
    {
        var entity = await LoadFullOrThrowAsync(id);
        await EnsureDespachanteAccessAsync(entity);

        // Remove vínculos OrcamentosVendaCustos antes de excluir o custo
        var ovCustos = await _db.OrcamentosVendaCustos
            .Where(x => x.CustoDespachanteId == id)
            .ToListAsync();
        if (ovCustos.Count > 0)
            _db.RemoveRange(ovCustos);

        _db.Remove(entity);
        await _db.SaveChangesAsync();
    }

    // ── LIs ───────────────────────────────────────────────────────────────────

    public async Task<CustoDespachanteLiDto> AddLiAsync(int custoId, UpsertCustoDespachanteLiRequest request)
    {
        var custo = await LoadOrThrowAsync(custoId);
        await EnsureDespachanteAccessAsync(custo);
        EnsureEditavel(custo);

        var li = new CustoDespachanteLi
        {
            CustoDespachanteId = custoId,
            Ncm       = request.Ncm.Trim(),
            Descricao = request.Descricao.Trim(),
            Valor     = request.Valor,
            Data      = request.Data
        };
        _db.Add(li);
        await _db.SaveChangesAsync();
        return ToLiDto(li);
    }

    public async Task<CustoDespachanteLiDto> UpdateLiAsync(int custoId, int liId, UpsertCustoDespachanteLiRequest request)
    {
        var li = await LoadLiOrThrowAsync(custoId, liId);
        EnsureEditavel(li.CustoDespachante!);

        li.Ncm       = request.Ncm.Trim();
        li.Descricao = request.Descricao.Trim();
        li.Valor     = request.Valor;
        li.Data      = request.Data;

        await _db.SaveChangesAsync();
        return ToLiDto(li);
    }

    public async Task DeleteLiAsync(int custoId, int liId)
    {
        var li = await LoadLiOrThrowAsync(custoId, liId);
        EnsureEditavel(li.CustoDespachante!);
        _db.Remove(li);
        await _db.SaveChangesAsync();
    }

    // ── Despesas ──────────────────────────────────────────────────────────────

    public async Task<CustoDespachanteDespesaDto> AddDespesaAsync(int custoId, UpsertCustoDespachanteDespesaRequest request)
    {
        var custo = await LoadOrThrowAsync(custoId);
        await EnsureDespachanteAccessAsync(custo);
        EnsureEditavel(custo);

        var despesa = new CustoDespachanteDespesa
        {
            CustoDespachanteId = custoId,
            Descricao     = request.Descricao.Trim(),
            Valor         = request.Valor,
            Data          = request.Data,
            EntraBaseIcms = request.EntraBaseIcms
        };
        _db.Add(despesa);
        await _db.SaveChangesAsync();
        return ToDespesaDto(despesa);
    }

    public async Task<CustoDespachanteDespesaDto> UpdateDespesaAsync(int custoId, int despesaId, UpsertCustoDespachanteDespesaRequest request)
    {
        var despesa = await LoadDespesaOrThrowAsync(custoId, despesaId);
        EnsureEditavel(despesa.CustoDespachante!);

        despesa.Descricao     = request.Descricao.Trim();
        despesa.Valor         = request.Valor;
        despesa.Data          = request.Data;
        despesa.EntraBaseIcms = request.EntraBaseIcms;

        await _db.SaveChangesAsync();
        return ToDespesaDto(despesa);
    }

    public async Task DeleteDespesaAsync(int custoId, int despesaId)
    {
        var despesa = await LoadDespesaOrThrowAsync(custoId, despesaId);
        EnsureEditavel(despesa.CustoDespachante!);
        _db.Remove(despesa);
        await _db.SaveChangesAsync();
    }

    // ── NCMs vinculados ───────────────────────────────────────────────────────

    public async Task<NcmVinculadoCustoDto> AddNcmAsync(int custoId, UpsertNcmVinculadoCustoRequest request)
    {
        var custo = await LoadOrThrowAsync(custoId);
        await EnsureDespachanteAccessAsync(custo);
        EnsureEditavel(custo);

        var ncm = new NcmVinculadoCusto
        {
            CustoDespachanteId = custoId,
            NcmId       = request.NcmId,
            NumeroNcm   = request.NumeroNcm.Trim(),
            Descricao   = request.Descricao.Trim(),
            AliIi       = request.AliIi,
            AliIpi      = request.AliIpi,
            AliPis      = request.AliPis,
            AliCofins   = request.AliCofins,
            AliIcms     = request.AliIcms,
            BaseCalculo = request.BaseCalculo
        };
        _db.Add(ncm);
        await _db.SaveChangesAsync();
        return ToNcmDto(ncm);
    }

    public async Task<NcmVinculadoCustoDto> UpdateNcmAsync(int custoId, int ncmId, UpsertNcmVinculadoCustoRequest request)
    {
        var ncm = await LoadNcmOrThrowAsync(custoId, ncmId);
        EnsureEditavel(ncm.CustoDespachante!);

        if (request.NcmId.HasValue && !await _db.Ncms.AnyAsync(x => x.Id == request.NcmId.Value))
            throw new NotFoundException("Ncm", request.NcmId.Value);

        ncm.NcmId       = request.NcmId;
        ncm.NumeroNcm   = request.NumeroNcm.Trim();
        ncm.Descricao   = request.Descricao.Trim();
        ncm.AliIi       = request.AliIi;
        ncm.AliIpi      = request.AliIpi;
        ncm.AliPis      = request.AliPis;
        ncm.AliCofins   = request.AliCofins;
        ncm.AliIcms     = request.AliIcms;
        ncm.BaseCalculo = request.BaseCalculo;

        await _db.SaveChangesAsync();
        return ToNcmDto(ncm);
    }

    public async Task DeleteNcmAsync(int custoId, int ncmId)
    {
        var ncm = await LoadNcmOrThrowAsync(custoId, ncmId);
        EnsureEditavel(ncm.CustoDespachante!);
        _db.Remove(ncm);
        await _db.SaveChangesAsync();
    }

    // ── Valores de imposto ────────────────────────────────────────────────────

    public async Task<ValorImpostoCustoDto> AddValorImpostoAsync(int custoId, int ncmId, UpsertValorImpostoCustoRequest request)
    {
        var ncm = await LoadNcmOrThrowAsync(custoId, ncmId);
        EnsureEditavel(ncm.CustoDespachante!);

        var valor = new ValorImpostoCusto
        {
            NcmVinculadoCustoId = ncmId,
            AliIi      = request.AliIi,
            ValorIi    = request.ValorIi,
            AliIpi     = request.AliIpi,
            ValorIpi   = request.ValorIpi,
            AliPis     = request.AliPis,
            ValorPis   = request.ValorPis,
            AliCofins  = request.AliCofins,
            ValorCofins= request.ValorCofins,
            AliIcms    = request.AliIcms,
            ValorIcms  = request.ValorIcms,
            TotalImpostos = request.TotalImpostos
        };
        _db.Add(valor);
        await _db.SaveChangesAsync();
        return ToValorDto(valor);
    }

    public async Task DeleteValorImpostoAsync(int custoId, int ncmId, int valorId)
    {
        var ncm = await LoadNcmOrThrowAsync(custoId, ncmId);
        EnsureEditavel(ncm.CustoDespachante!);

        var valor = await _db.ValoresImpostoCusto
            .FirstOrDefaultAsync(x => x.Id == valorId && x.NcmVinculadoCustoId == ncmId)
            ?? throw new NotFoundException("ValorImpostoCusto", valorId);

        _db.Remove(valor);
        await _db.SaveChangesAsync();
    }

    // ── Recalcular status da Solicitação ──────────────────────────────────────

    /// <summary>
    /// Recalcula automaticamente o status da SolicitacaoOrcamento com base nos
    /// status de todos os CustosDespachante vinculados, seguindo as regras de prioridade
    /// definidas no FLUXO_OPERACIONAL.md.
    /// </summary>
    public async Task RecalcularStatusSolicitacaoAsync(int solicitacaoId)
    {
        var solicitacao = await _db.SolicitacoesOrcamento
            .FirstOrDefaultAsync(x => x.Id == solicitacaoId);
        if (solicitacao is null) return;

        // Regra 1: Aprovada ou Cancelada nunca são recalculadas automaticamente
        if (solicitacao.Status is "Aprovada" or "Cancelada") return;

        var custos = await _db.CustosDespachante
            .AsNoTracking()
            .Where(x => x.SolicitacaoOrcamentoId == solicitacaoId)
            .Select(x => new { x.Status })
            .ToListAsync();

        // Regra 6: sem despachantes vinculados → Rascunho
        if (custos.Count == 0)
        {
            solicitacao.Status = "Rascunho";
            await _db.SaveChangesAsync();
            return;
        }

        var statusList = custos.Select(c => c.Status).ToList();

        // Regra 2: qualquer custo ReabertoPeloOV → AguardandoReabertura
        if (statusList.Contains("ReabertoPeloOV"))
        {
            solicitacao.Status = "AguardandoReabertura";
            await _db.SaveChangesAsync();
            return;
        }

        var statusFinais = new HashSet<string> { "Finalizado", "CanceladoPeloOV" };
        var todosFinalizados = statusList.All(s => statusFinais.Contains(s));
        var algumFinalizado  = statusList.Any(s => s == "Finalizado");

        if (todosFinalizados && algumFinalizado)
        {
            // Verifica se há OrcamentoVenda Finalizado vinculado
            var ovFinalizado = await _db.OrcamentosVenda
                .AnyAsync(x => x.SolicitacaoOrcamentoId == solicitacaoId && x.Status == "Finalizado");

            // Regra 3: todos finalizados + OV Finalizado → AguardandoAprovacaoCliente
            if (ovFinalizado)
            {
                solicitacao.Status = "AguardandoAprovacaoCliente";
                await _db.SaveChangesAsync();
                return;
            }

            // Regra 4: todos finalizados, mas OV não finalizado → AguardandoOrcamentoVenda
            solicitacao.Status = "AguardandoOrcamentoVenda";
            await _db.SaveChangesAsync();
            return;
        }

        // Regra 5: algum custo ainda não está no estado final
        solicitacao.Status = "AguardandoDespachante";
        await _db.SaveChangesAsync();
    }

    // ── Helpers privados ──────────────────────────────────────────────────────

    private void EnsureEditavel(Domain.Entities.CustoDespachante entity)
    {
        if (entity.Imutavel)
            throw new BusinessException("Este custo está finalizado e não pode ser editado.");
        if (!StatusEditaveis.Contains(entity.Status))
            throw new BusinessException($"O custo não pode ser editado no status '{entity.Status}'.");
    }

    private async Task EnsureOrcamentoVendaGeradoAsync(Domain.Entities.CustoDespachante custo)
    {
        if (!custo.SolicitacaoOrcamentoId.HasValue)
            return;

        var solicitacaoId = custo.SolicitacaoOrcamentoId.Value;

        var existente = await _db.OrcamentosVenda
            .Include(x => x.Custos)
            .FirstOrDefaultAsync(x => x.SolicitacaoOrcamentoId == solicitacaoId);

        if (existente is not null)
        {
            var jaVinculado = existente.Custos.Any(x => x.CustoDespachanteId == custo.Id);
            if (!jaVinculado && (existente.Status == "Aguardando" || existente.Status == "EmAndamento"))
            {
                existente.Custos.Add(new OrcamentoVendaCusto
                {
                    CustoDespachanteId = custo.Id
                });
            }
            return;
        }

        var solicitacao = await _db.SolicitacoesOrcamento
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == solicitacaoId)
            ?? throw new NotFoundException("SolicitacaoOrcamento", solicitacaoId);

        var orcamento = new OrcamentoVenda
        {
            CodigoInterno          = await GerarCodigoOrcamentoVendaInternoAsync(),
            ClienteId              = solicitacao.ClienteId,
            SolicitacaoOrcamentoId = solicitacao.Id,
            Data                   = custo.Data,
            TamContainer           = custo.TamContainer,
            PesoBruto              = custo.Peso,
            PesoLiquido            = 0,
            FreteInternacional     = 0,
            CifReais               = 0,
            CifUsd                 = 0,
            FobReais               = 0,
            FobUsd                 = 0,
            TaxaUsd                = 0,
            Honorarios             = 0,
            TotalImpostos          = 0,
            TotalDespesas          = 0,
            TotalExtras            = 0,
            TotalGeral             = 0,
            Observacao             = solicitacao.Observacao?.Trim(),
            Status                 = "Aguardando",
            Custos = new List<OrcamentoVendaCusto>
            {
                new()
                {
                    CustoDespachanteId = custo.Id
                }
            }
        };

        _db.OrcamentosVenda.Add(orcamento);
    }

    private async Task<string> GerarCodigoOrcamentoVendaInternoAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"OV-{year}-";

        var last = await _db.OrcamentosVenda
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

    private async Task EnsureDespachanteAccessAsync(Domain.Entities.CustoDespachante entity)
    {
        if (!_currentUser.HasRole("Despachante")) return;
        var despachanteId = await _currentUser.GetVinculoIdAsync("Despachante");
        if (despachanteId is null || entity.DespachanteId != despachanteId.Value)
            throw new ForbiddenException("Acesso negado a este custo.");
    }

    private async Task<Domain.Entities.CustoDespachante> LoadOrThrowAsync(int id)
    {
        return await _db.CustosDespachante
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new NotFoundException("CustoDespachante", id);
    }

    private async Task<Domain.Entities.CustoDespachante> LoadFullOrThrowAsync(int id)
    {
        return await _db.CustosDespachante
            .Include(x => x.Lis)
            .Include(x => x.Despesas)
            .Include(x => x.Ncms).ThenInclude(n => n.ValoresImposto)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new NotFoundException("CustoDespachante", id);
    }

    private async Task<CustoDespachanteLi> LoadLiOrThrowAsync(int custoId, int liId)
    {
        return await _db.CustosDespachantelis
            .Include(x => x.CustoDespachante)
            .FirstOrDefaultAsync(x => x.Id == liId && x.CustoDespachanteId == custoId)
            ?? throw new NotFoundException("CustoDespachanteLi", liId);
    }

    private async Task<CustoDespachanteDespesa> LoadDespesaOrThrowAsync(int custoId, int despesaId)
    {
        return await _db.CustosDepesas
            .Include(x => x.CustoDespachante)
            .FirstOrDefaultAsync(x => x.Id == despesaId && x.CustoDespachanteId == custoId)
            ?? throw new NotFoundException("CustoDespachanteDespesa", despesaId);
    }

    private async Task<NcmVinculadoCusto> LoadNcmOrThrowAsync(int custoId, int ncmId)
    {
        return await _db.NcmsVinculadosCusto
            .Include(x => x.CustoDespachante)
            .FirstOrDefaultAsync(x => x.Id == ncmId && x.CustoDespachanteId == custoId)
            ?? throw new NotFoundException("NcmVinculadoCusto", ncmId);
    }

    private async Task ValidarReferencesAsync(int despachanteId, int? importadorId, int portoOrigemId, int portoDestinoId)
    {
        if (!await _db.Despachantes.AnyAsync(x => x.Id == despachanteId))
            throw new NotFoundException("Despachante", despachanteId);

        if (importadorId.HasValue && !await _db.Importadores.AnyAsync(x => x.Id == importadorId.Value))
            throw new NotFoundException("Importador", importadorId.Value);

        if (!await _db.PortosOrigem.AnyAsync(x => x.Id == portoOrigemId))
            throw new NotFoundException("PortoOrigem", portoOrigemId);

        if (!await _db.PortosDestino.AnyAsync(x => x.Id == portoDestinoId))
            throw new NotFoundException("PortoDestino", portoDestinoId);
    }

    private async Task<string> GerarCodigoInternoAsync()
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

    // ── Mapeamentos ───────────────────────────────────────────────────────────

    private static CustoDespachanteListDto ToListDto(Domain.Entities.CustoDespachante x) =>
        new(x.Id, x.CodigoInterno, x.SolicitacaoOrcamentoId, x.DespachanteId, x.ImportadorId,
            x.PortoOrigemId, x.PortoDestinoId, x.Responsavel, x.TamContainer,
            x.Peso, x.FobUsd, x.FobReais, x.CifUsd, x.CifReais, x.SeguroUsd, x.FreteInternacionalUsd,
            x.TaxaUsd, x.TaxaUsdAgente, x.Observacao, x.Data, x.Status,
            x.Versao, x.VersaoAnteriorId, x.Imutavel, x.CriadoEm, x.AtualizadoEm);

    private static CustoDespachanteDto ToDto(Domain.Entities.CustoDespachante x) =>
        new(x.Id, x.CodigoInterno, x.SolicitacaoOrcamentoId, x.DespachanteId, x.ImportadorId,
            x.PortoOrigemId, x.PortoDestinoId, x.Responsavel, x.TamContainer,
            x.Peso, x.FobUsd, x.FobReais, x.CifUsd, x.CifReais, x.SeguroUsd, x.FreteInternacionalUsd,
            x.TaxaUsd, x.TaxaUsdAgente, x.Observacao, x.Data, x.Status,
            x.Versao, x.VersaoAnteriorId, x.Imutavel, x.CriadoEm, x.AtualizadoEm,
            x.Lis.Select(l => ToLiDto(l)).ToList(),
            x.Despesas.Select(d => ToDespesaDto(d)).ToList(),
            x.Ncms.Select(n => ToNcmDto(n)).ToList());

    private static CustoDespachanteLiDto ToLiDto(CustoDespachanteLi x) =>
        new(x.Id, x.CustoDespachanteId, x.Ncm, x.Descricao, x.Valor, x.Data, x.CriadoEm, x.AtualizadoEm);

    private static CustoDespachanteDespesaDto ToDespesaDto(CustoDespachanteDespesa x) =>
        new(x.Id, x.CustoDespachanteId, x.Descricao, x.Valor, x.Data, x.EntraBaseIcms, x.CriadoEm, x.AtualizadoEm);

    private static NcmVinculadoCustoDto ToNcmDto(NcmVinculadoCusto x) =>
        new(x.Id, x.CustoDespachanteId, x.NcmId, x.NumeroNcm, x.Descricao,
            x.AliIi, x.AliIpi, x.AliPis, x.AliCofins, x.AliIcms, x.BaseCalculo,
            x.CriadoEm, x.AtualizadoEm,
            x.ValoresImposto.Select(v => ToValorDto(v)).ToList());

    private static ValorImpostoCustoDto ToValorDto(ValorImpostoCusto x) =>
        new(x.Id, x.NcmVinculadoCustoId,
            x.AliIi, x.ValorIi, x.AliIpi, x.ValorIpi,
            x.AliPis, x.ValorPis, x.AliCofins, x.ValorCofins,
            x.AliIcms, x.ValorIcms, x.TotalImpostos,
            x.CriadoEm, x.AtualizadoEm);
}
