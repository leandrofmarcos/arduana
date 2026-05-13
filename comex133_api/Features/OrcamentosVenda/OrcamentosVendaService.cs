using Comex133Api.Core.Auth;
using Comex133Api.Core.Database;
using Comex133Api.Core.Exceptions;
using Comex133Api.Core.Models;
using Comex133Api.Domain.Entities;
using Comex133Api.Features.CustosDespachante;
using Microsoft.EntityFrameworkCore;

namespace Comex133Api.Features.OrcamentosVenda;

public class OrcamentosVendaService
{
    private static readonly HashSet<string> StatusEditaveis = new() { "Aguardando", "EmAndamento" };

    private readonly AppDbContext _db;
    private readonly ICurrentUserContext _currentUser;
    private readonly CustosDespachanteService _custosService;

    public OrcamentosVendaService(AppDbContext db, ICurrentUserContext currentUser, CustosDespachanteService custosService)
    {
        _db = db;
        _currentUser = currentUser;
        _custosService = custosService;
    }

    // ── Listagem ──────────────────────────────────────────────────────────────

    public async Task<PagedResult<OrcamentoVendaListDto>> GetAllAsync(PaginationQuery pagination, int? solicitacaoOrcamentoId = null)
    {
        var query = _db.OrcamentosVenda.AsNoTracking();

        if (solicitacaoOrcamentoId.HasValue)
            query = query.Where(x => x.SolicitacaoOrcamentoId == solicitacaoOrcamentoId.Value);

        return await query
            .OrderByDescending(x => x.Data)
            .ThenByDescending(x => x.Id)
            .Select(x => new OrcamentoVendaListDto(
                x.Id, x.CodigoInterno, x.ClienteId, x.SolicitacaoOrcamentoId,
                x.Data, x.TamContainer, x.PesoBruto, x.PesoLiquido,
                x.TotalGeral, x.Status, x.Versao, x.VersaoAnteriorId, x.Imutavel,
                x.CustoInternoId, x.CriadoEm, x.AtualizadoEm))
            .ToPagedResultAsync(pagination);
    }

    // ── Detalhe ───────────────────────────────────────────────────────────────

    public async Task<OrcamentoVendaDto> GetByIdAsync(int id)
    {
        var entity = await LoadFullOrThrowAsync(id);
        return ToDto(entity);
    }

    // ── Criar ─────────────────────────────────────────────────────────────────

    public async Task<OrcamentoVendaDto> CreateAsync(CreateOrcamentoVendaRequest request)
    {
        if (request.ClienteId.HasValue && !await _db.Clientes.AnyAsync(x => x.Id == request.ClienteId.Value))
            throw new NotFoundException("Cliente", request.ClienteId.Value);

        if (request.SolicitacaoOrcamentoId.HasValue)
        {
            var sol = await _db.SolicitacoesOrcamento
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.SolicitacaoOrcamentoId.Value)
                ?? throw new NotFoundException("SolicitacaoOrcamento", request.SolicitacaoOrcamentoId.Value);
        }

        var entity = new OrcamentoVenda
        {
            CodigoInterno          = await GerarCodigoInternoAsync(),
            ClienteId              = request.ClienteId,
            SolicitacaoOrcamentoId = request.SolicitacaoOrcamentoId,
            Data                   = request.Data,
            TamContainer           = request.TamContainer.Trim().ToUpperInvariant(),
            PesoBruto              = request.PesoBruto,
            PesoLiquido            = request.PesoLiquido,
            FreteInternacional     = request.FreteInternacional,
            CifReais               = request.CifReais,
            CifUsd                 = request.CifUsd,
            FobReais               = request.FobReais,
            FobUsd                 = request.FobUsd,
            TaxaUsd                = request.TaxaUsd,
            Honorarios             = request.Honorarios,
            TotalImpostos          = request.TotalImpostos,
            TotalDespesas          = request.TotalDespesas,
            TotalExtras            = request.TotalExtras,
            TotalGeral             = request.TotalGeral,
            Observacao             = request.Observacao?.Trim(),
            Status                 = "Aguardando"
        };

        _db.Add(entity);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(entity.Id);
    }

    // ── Editar ────────────────────────────────────────────────────────────────

    public async Task<OrcamentoVendaDto> UpdateAsync(int id, UpdateOrcamentoVendaRequest request)
    {
        var entity = await LoadFullOrThrowAsync(id);
        EnsureEditavel(entity);

        if (request.ClienteId.HasValue && !await _db.Clientes.AnyAsync(x => x.Id == request.ClienteId.Value))
            throw new NotFoundException("Cliente", request.ClienteId.Value);

        entity.ClienteId          = request.ClienteId;
        entity.Data               = request.Data;
        entity.TamContainer       = request.TamContainer.Trim().ToUpperInvariant();
        entity.PesoBruto          = request.PesoBruto;
        entity.PesoLiquido        = request.PesoLiquido;
        entity.FreteInternacional = request.FreteInternacional;
        entity.CifReais           = request.CifReais;
        entity.CifUsd             = request.CifUsd;
        entity.FobReais           = request.FobReais;
        entity.FobUsd             = request.FobUsd;
        entity.TaxaUsd            = request.TaxaUsd;
        entity.Honorarios         = request.Honorarios;
        entity.TotalImpostos      = request.TotalImpostos;
        entity.TotalDespesas      = request.TotalDespesas;
        entity.TotalExtras        = request.TotalExtras;
        entity.TotalGeral         = request.TotalGeral;
        entity.Observacao         = request.Observacao?.Trim();

        PromoteToEmAndamentoIfNeeded(entity);

        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    // ── Finalizar OV ─────────────────────────────────────────────────────────

    /// <summary>
    /// Finaliza o OrcamentoVenda. Requer pelo menos 1 CustoDespachante vinculado
    /// com Status = "Finalizado". Dispara recalculo da Solicitação.
    /// </summary>
    public async Task<OrcamentoVendaDto> FinalizarAsync(int id)
    {
        var entity = await LoadFullOrThrowAsync(id);
        EnsureEditavel(entity);

        var custoIds = entity.Custos.Select(c => c.CustoDespachanteId).ToList();
        var algumFinalizado = await _db.CustosDespachante
            .AnyAsync(x => custoIds.Contains(x.Id) && x.Status == "Finalizado");

        if (!algumFinalizado)
            throw new BusinessException("É necessário pelo menos um custo de despachante finalizado para finalizar o orçamento.");

        entity.Status = "Finalizado";
        await _db.SaveChangesAsync();

        if (entity.SolicitacaoOrcamentoId.HasValue)
            await _custosService.RecalcularStatusSolicitacaoAsync(entity.SolicitacaoOrcamentoId.Value);

        return await GetByIdAsync(entity.Id);
    }

    // ── Cancelar OV ──────────────────────────────────────────────────────────

    public async Task<OrcamentoVendaDto> CancelarAsync(int id)
    {
        var entity = await LoadFullOrThrowAsync(id);

        if (entity.Status == "Cancelado")
            throw new BusinessException("Orçamento de venda já está cancelado.");

        // Não cancela se a solicitação já foi aprovada
        if (entity.SolicitacaoOrcamentoId.HasValue)
        {
            var solStatus = await _db.SolicitacoesOrcamento
                .AsNoTracking()
                .Where(x => x.Id == entity.SolicitacaoOrcamentoId.Value)
                .Select(x => x.Status)
                .FirstOrDefaultAsync();

            if (solStatus == "Aprovada")
                throw new BusinessException("Não é possível cancelar o orçamento de uma solicitação já aprovada.");
        }

        entity.Status = "Cancelado";
        await _db.SaveChangesAsync();

        if (entity.SolicitacaoOrcamentoId.HasValue)
            await _custosService.RecalcularStatusSolicitacaoAsync(entity.SolicitacaoOrcamentoId.Value);

        return await GetByIdAsync(entity.Id);
    }

    // ── Reabrir OV (nova versão) ────────────────────────────────────────────

    public async Task<OrcamentoVendaDto> ReabrirAsync(int id)
    {
        var original = await LoadFullOrThrowAsync(id);

        if (original.Status != "Finalizado")
            throw new BusinessException($"Apenas orçamentos finalizados podem ser reabertos. Status atual: {original.Status}");

        var possuiVersaoMaisNova = await _db.OrcamentosVenda
            .AsNoTracking()
            .AnyAsync(x => x.VersaoAnteriorId == original.Id);

        if (possuiVersaoMaisNova)
            throw new BusinessException("Este orçamento já possui uma versão mais nova e não pode ser reaberto diretamente.");

        if (original.SolicitacaoOrcamentoId.HasValue)
        {
            var solStatus = await _db.SolicitacoesOrcamento
                .AsNoTracking()
                .Where(x => x.Id == original.SolicitacaoOrcamentoId.Value)
                .Select(x => x.Status)
                .FirstOrDefaultAsync();

            if (solStatus is "Aprovada" or "Cancelada")
                throw new BusinessException("Não é possível reabrir um orçamento quando a solicitação está aprovada ou cancelada.");
        }

        original.Imutavel = true;

        var novaVersao = new OrcamentoVenda
        {
            CodigoInterno          = await GerarCodigoInternoAsync(),
            ClienteId              = original.ClienteId,
            SolicitacaoOrcamentoId = original.SolicitacaoOrcamentoId,
            Data                   = original.Data,
            TamContainer           = original.TamContainer,
            PesoBruto              = original.PesoBruto,
            PesoLiquido            = original.PesoLiquido,
            FreteInternacional     = original.FreteInternacional,
            CifReais               = original.CifReais,
            CifUsd                 = original.CifUsd,
            FobReais               = original.FobReais,
            FobUsd                 = original.FobUsd,
            TaxaUsd                = original.TaxaUsd,
            Honorarios             = original.Honorarios,
            TotalImpostos          = original.TotalImpostos,
            TotalDespesas          = original.TotalDespesas,
            TotalExtras            = original.TotalExtras,
            TotalGeral             = original.TotalGeral,
            Observacao             = original.Observacao,
            Status                 = "EmAndamento",
            Versao                 = original.Versao + 1,
            VersaoAnteriorId       = original.Id,
            Imutavel               = false
        };

        _db.OrcamentosVenda.Add(novaVersao);
        await _db.SaveChangesAsync();

        if (original.Despesas.Any())
        {
            var despesas = original.Despesas.Select(d => new OrcamentoVendaDespesa
            {
                OrcamentoVendaId = novaVersao.Id,
                Descricao = d.Descricao,
                Valor = d.Valor
            }).ToList();
            _db.OrcamentosVendaDespesas.AddRange(despesas);
        }

        if (original.Extras.Any())
        {
            var extras = original.Extras.Select(e => new OrcamentoVendaDespesaExtra
            {
                OrcamentoVendaId = novaVersao.Id,
                Descricao = e.Descricao,
                Valor = e.Valor
            }).ToList();
            _db.OrcamentosVendaExtras.AddRange(extras);
        }

        if (original.Custos.Any())
        {
            var custos = original.Custos.Select(c => new OrcamentoVendaCusto
            {
                OrcamentoVendaId = novaVersao.Id,
                CustoDespachanteId = c.CustoDespachanteId
            }).ToList();
            _db.OrcamentosVendaCustos.AddRange(custos);
        }

        await _db.SaveChangesAsync();

        if (novaVersao.SolicitacaoOrcamentoId.HasValue)
            await _custosService.RecalcularStatusSolicitacaoAsync(novaVersao.SolicitacaoOrcamentoId.Value);

        return await GetByIdAsync(novaVersao.Id);
    }

    // ── Vincular/desvincular custos ───────────────────────────────────────────

    public async Task<OrcamentoVendaCustoDto> VincularCustoAsync(int ovId, VincularCustoRequest request)
    {
        var ov = await LoadFullOrThrowAsync(ovId);
        EnsureEditavel(ov);

        var custo = await _db.CustosDespachante
            .FirstOrDefaultAsync(x => x.Id == request.CustoDespachanteId)
            ?? throw new NotFoundException("CustoDespachante", request.CustoDespachanteId);

        if (custo.Status != "Finalizado")
            throw new BusinessException("Apenas custos finalizados podem ser vinculados ao orçamento de venda.");

        var jaVinculado = ov.Custos.Any(c => c.CustoDespachanteId == request.CustoDespachanteId);
        if (jaVinculado)
            throw new BusinessException("Este custo já está vinculado ao orçamento de venda.");

        var vinculo = new OrcamentoVendaCusto
        {
            OrcamentoVendaId   = ovId,
            CustoDespachanteId = request.CustoDespachanteId
        };
        _db.Add(vinculo);
        PromoteToEmAndamentoIfNeeded(ov);
        await _db.SaveChangesAsync();

        return new OrcamentoVendaCustoDto(
            vinculo.Id, ovId, custo.Id, custo.CodigoInterno, custo.Status,
            vinculo.CriadoEm, vinculo.AtualizadoEm);
    }

    public async Task DesvincularCustoAsync(int ovId, int vinculoId)
    {
        var ov = await LoadFullOrThrowAsync(ovId);
        EnsureEditavel(ov);

        var vinculo = ov.Custos.FirstOrDefault(c => c.Id == vinculoId)
            ?? throw new NotFoundException("OrcamentoVendaCusto", vinculoId);

        // Garante que após remoção ainda reste pelo menos 1 Finalizado vinculado
        var custoIds = ov.Custos
            .Where(c => c.Id != vinculoId)
            .Select(c => c.CustoDespachanteId)
            .ToList();

        if (custoIds.Count > 0)
        {
            var algumFinalizado = await _db.CustosDespachante
                .AnyAsync(x => custoIds.Contains(x.Id) && x.Status == "Finalizado");

            if (!algumFinalizado)
                throw new BusinessException("Não é possível remover o único custo finalizado do orçamento.");
        }

        _db.Remove(vinculo);
        PromoteToEmAndamentoIfNeeded(ov);
        await _db.SaveChangesAsync();
    }

    // ── Cancelar custo individual dentro do OV ────────────────────────────────

    public async Task CancelarCustoAsync(int ovId, int custoId)
    {
        var ov = await LoadFullOrThrowAsync(ovId);
        EnsureEditavel(ov);

        // Garante que restará pelo menos 1 Finalizado após cancelamento
        var outrosFinalizado = await _db.CustosDespachante
            .AnyAsync(x =>
                ov.Custos.Where(c => c.CustoDespachanteId != custoId)
                         .Select(c => c.CustoDespachanteId)
                         .Contains(x.Id)
                && x.Status == "Finalizado");

        if (!outrosFinalizado)
            throw new BusinessException("Não é possível cancelar o único custo finalizado do orçamento.");

        var custo = await _db.CustosDespachante
            .FirstOrDefaultAsync(x => x.Id == custoId)
            ?? throw new NotFoundException("CustoDespachante", custoId);

        if (custo.Status == "CanceladoPeloOV")
            throw new BusinessException("Este custo já está cancelado pelo orçamento.");

        PromoteToEmAndamentoIfNeeded(ov);
        custo.Status = "CanceladoPeloOV";
        await _db.SaveChangesAsync();

        if (ov.SolicitacaoOrcamentoId.HasValue)
            await _custosService.RecalcularStatusSolicitacaoAsync(ov.SolicitacaoOrcamentoId.Value);
    }

    // ── Solicitar reabertura de custo (nova versão) ───────────────────────────

    /// <summary>
    /// Cria uma nova versão do CustoDespachante, marcando o original como Imutavel
    /// e colocando a nova versão em status ReabertoPeloOV.
    /// </summary>
    public async Task<OrcamentoVendaDto> SolicitarReaberturaCustoAsync(int ovId, int custoId, SolicitarReaberturaRequest request)
    {
        var ov = await LoadFullOrThrowAsync(ovId);

        // OV só pode solicitar reabertura se não estiver finalizado/cancelado
        if (ov.Status == "Finalizado")
            throw new BusinessException("Não é possível solicitar reabertura em um orçamento finalizado.");

        if (ov.Status == "Cancelado")
            throw new BusinessException("Não é possível solicitar reabertura em um orçamento cancelado.");

        // Verifica que a solicitação não está aprovada
        if (ov.SolicitacaoOrcamentoId.HasValue)
        {
            var solStatus = await _db.SolicitacoesOrcamento
                .AsNoTracking()
                .Where(x => x.Id == ov.SolicitacaoOrcamentoId.Value)
                .Select(x => x.Status)
                .FirstOrDefaultAsync();

            if (solStatus == "Aprovada")
                throw new BusinessException("Não é possível solicitar reabertura de custo em uma solicitação aprovada.");
        }

        var original = await _db.CustosDespachante
            .FirstOrDefaultAsync(x => x.Id == custoId)
            ?? throw new NotFoundException("CustoDespachante", custoId);

        if (!ov.Custos.Any(c => c.CustoDespachanteId == custoId))
            throw new BusinessException("Este custo não está vinculado a este orçamento de venda.");

        if (original.Status != "Finalizado")
            throw new BusinessException("Apenas custos finalizados podem ser reabertos.");

        // Imutabiliza o original
        original.Imutavel = true;

        // Cria nova versão
        var novaVersao = new Domain.Entities.CustoDespachante
        {
            CodigoInterno          = await GerarCodigoCustoInternoAsync(),
            SolicitacaoOrcamentoId = original.SolicitacaoOrcamentoId,
            DespachanteId          = original.DespachanteId,
            ImportadorId           = original.ImportadorId,
            PortoOrigemId          = original.PortoOrigemId,
            PortoDestinoId         = original.PortoDestinoId,
            Responsavel            = original.Responsavel,
            TamContainer           = original.TamContainer,
            Peso                   = original.Peso,
            FobUsd                 = original.FobUsd,
            FobReais               = original.FobReais,
            CifUsd                 = original.CifUsd,
            CifReais               = original.CifReais,
            SeguroUsd              = original.SeguroUsd,
            TaxaUsd                = original.TaxaUsd,
            TaxaUsdAgente          = original.TaxaUsdAgente,
            Observacao             = string.IsNullOrWhiteSpace(request.Motivo)
                                        ? original.Observacao
                                        : $"[Reabertura: {request.Motivo}]\n{original.Observacao}",
            Data                   = original.Data,
            Status                 = "ReabertoPeloOV",
            Versao                 = original.Versao + 1,
            VersaoAnteriorId       = original.Id,
            Imutavel               = false
        };
        _db.Add(novaVersao);

        // Substitui o vínculo no OV
        var vinculo = ov.Custos.First(c => c.CustoDespachanteId == custoId);
        _db.Remove(vinculo);
        PromoteToEmAndamentoIfNeeded(ov);

        await _db.SaveChangesAsync();

        var novoVinculo = new OrcamentoVendaCusto
        {
            OrcamentoVendaId   = ovId,
            CustoDespachanteId = novaVersao.Id
        };
        _db.Add(novoVinculo);
        await _db.SaveChangesAsync();

        if (ov.SolicitacaoOrcamentoId.HasValue)
            await _custosService.RecalcularStatusSolicitacaoAsync(ov.SolicitacaoOrcamentoId.Value);

        return await GetByIdAsync(ovId);
    }

    // ── Despesas do OV ────────────────────────────────────────────────────────

    public async Task<OrcamentoVendaDespesaDto> AddDespesaAsync(int ovId, UpsertOrcamentoVendaDespesaRequest request)
    {
        var ov = await LoadOrThrowAsync(ovId);
        EnsureEditavel(ov);

        var despesa = new OrcamentoVendaDespesa
        {
            OrcamentoVendaId = ovId,
            Descricao        = request.Descricao.Trim(),
            Valor            = request.Valor
        };
        _db.Add(despesa);
        PromoteToEmAndamentoIfNeeded(ov);
        await _db.SaveChangesAsync();
        return ToDespesaDto(despesa);
    }

    public async Task<OrcamentoVendaDespesaDto> UpdateDespesaAsync(int ovId, int despesaId, UpsertOrcamentoVendaDespesaRequest request)
    {
        var ov = await LoadOrThrowAsync(ovId);
        EnsureEditavel(ov);

        var despesa = await _db.OrcamentosVendaDespesas
            .FirstOrDefaultAsync(x => x.Id == despesaId && x.OrcamentoVendaId == ovId)
            ?? throw new NotFoundException("OrcamentoVendaDespesa", despesaId);

        despesa.Descricao = request.Descricao.Trim();
        despesa.Valor     = request.Valor;
        PromoteToEmAndamentoIfNeeded(ov);
        await _db.SaveChangesAsync();
        return ToDespesaDto(despesa);
    }

    public async Task DeleteDespesaAsync(int ovId, int despesaId)
    {
        var ov = await LoadOrThrowAsync(ovId);
        EnsureEditavel(ov);

        var despesa = await _db.OrcamentosVendaDespesas
            .FirstOrDefaultAsync(x => x.Id == despesaId && x.OrcamentoVendaId == ovId)
            ?? throw new NotFoundException("OrcamentoVendaDespesa", despesaId);

        _db.Remove(despesa);
        PromoteToEmAndamentoIfNeeded(ov);
        await _db.SaveChangesAsync();
    }

    // ── Despesas extras do OV ─────────────────────────────────────────────────

    public async Task<OrcamentoVendaDespesaDto> AddExtraAsync(int ovId, UpsertOrcamentoVendaDespesaRequest request)
    {
        var ov = await LoadOrThrowAsync(ovId);
        EnsureEditavel(ov);

        var extra = new OrcamentoVendaDespesaExtra
        {
            OrcamentoVendaId = ovId,
            Descricao        = request.Descricao.Trim(),
            Valor            = request.Valor
        };
        _db.Add(extra);
        PromoteToEmAndamentoIfNeeded(ov);
        await _db.SaveChangesAsync();
        return new OrcamentoVendaDespesaDto(extra.Id, extra.OrcamentoVendaId, extra.Descricao, extra.Valor, extra.CriadoEm, extra.AtualizadoEm);
    }

    public async Task<OrcamentoVendaDespesaDto> UpdateExtraAsync(int ovId, int extraId, UpsertOrcamentoVendaDespesaRequest request)
    {
        var ov = await LoadOrThrowAsync(ovId);
        EnsureEditavel(ov);

        var extra = await _db.OrcamentosVendaExtras
            .FirstOrDefaultAsync(x => x.Id == extraId && x.OrcamentoVendaId == ovId)
            ?? throw new NotFoundException("OrcamentoVendaDespesaExtra", extraId);

        extra.Descricao = request.Descricao.Trim();
        extra.Valor     = request.Valor;
        PromoteToEmAndamentoIfNeeded(ov);
        await _db.SaveChangesAsync();
        return new OrcamentoVendaDespesaDto(extra.Id, extra.OrcamentoVendaId, extra.Descricao, extra.Valor, extra.CriadoEm, extra.AtualizadoEm);
    }

    public async Task DeleteExtraAsync(int ovId, int extraId)
    {
        var ov = await LoadOrThrowAsync(ovId);
        EnsureEditavel(ov);

        var extra = await _db.OrcamentosVendaExtras
            .FirstOrDefaultAsync(x => x.Id == extraId && x.OrcamentoVendaId == ovId)
            ?? throw new NotFoundException("OrcamentoVendaDespesaExtra", extraId);

        _db.Remove(extra);
        PromoteToEmAndamentoIfNeeded(ov);
        await _db.SaveChangesAsync();
    }

    // ── Custo interno alternativo ─────────────────────────────────────────────

    /// <summary>
    /// Vincula (ou remove) um CustoDespachante como custo interno da OV após aprovação.
    /// Não altera o que foi enviado ao cliente — apenas adiciona referência interna.
    /// </summary>
    public async Task<OrcamentoVendaDto> SetCustoInternoAsync(int ovId, SetCustoInternoRequest request)
    {
        var ov = await LoadFullOrThrowAsync(ovId);

        if (request.CustoDespachanteId.HasValue)
        {
            var custo = await _db.CustosDespachante
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.CustoDespachanteId.Value)
                ?? throw new NotFoundException("CustoDespachante", request.CustoDespachanteId.Value);

            if (custo.Status != "Finalizado")
                throw new BusinessException("Apenas custos finalizados podem ser definidos como custo interno.");
        }

        ov.CustoInternoId = request.CustoDespachanteId;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(ovId);
    }

    // ── Excluir ────────────────────────────────────────────────────────────────

    public async Task DeleteAsync(int id)
    {
        var entity = await LoadFullOrThrowAsync(id);

        // Remove vínculos OrcamentosVendaCustos antes de excluir o orçamento
        var ovCustos = await _db.OrcamentosVendaCustos
            .Where(x => x.OrcamentoVendaId == id)
            .ToListAsync();
        if (ovCustos.Count > 0)
            _db.RemoveRange(ovCustos);

        _db.Remove(entity);
        await _db.SaveChangesAsync();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void EnsureEditavel(OrcamentoVenda entity)
    {
        if (entity.Imutavel)
            throw new BusinessException("Este orçamento está em uma versão histórica e não pode ser editado.");
        if (!StatusEditaveis.Contains(entity.Status))
            throw new BusinessException($"O orçamento de venda não pode ser editado no status '{entity.Status}'.");
    }

    private static void PromoteToEmAndamentoIfNeeded(OrcamentoVenda entity)
    {
        if (entity.Status == "Aguardando")
            entity.Status = "EmAndamento";
    }

    private async Task<OrcamentoVenda> LoadOrThrowAsync(int id)
    {
        return await _db.OrcamentosVenda
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new NotFoundException("OrcamentoVenda", id);
    }

    private async Task<OrcamentoVenda> LoadFullOrThrowAsync(int id)
    {
        return await _db.OrcamentosVenda
            .Include(x => x.Despesas)
            .Include(x => x.Extras)
            .Include(x => x.Custos).ThenInclude(c => c.CustoDespachante)
            .Include(x => x.CustoInterno)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new NotFoundException("OrcamentoVenda", id);
    }

    private async Task<string> GerarCodigoInternoAsync()
    {
        var year   = DateTime.UtcNow.Year;
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

    // ── Mapeamentos ───────────────────────────────────────────────────────────

    private static OrcamentoVendaDto ToDto(OrcamentoVenda x) =>
        new(x.Id, x.CodigoInterno, x.ClienteId, x.SolicitacaoOrcamentoId,
            x.Data, x.TamContainer, x.PesoBruto, x.PesoLiquido,
            x.FreteInternacional, x.CifReais, x.CifUsd, x.FobReais, x.FobUsd,
            x.TaxaUsd, x.Honorarios, x.TotalImpostos, x.TotalDespesas,
            x.TotalExtras, x.TotalGeral, x.Observacao, x.Status, x.Versao, x.VersaoAnteriorId, x.Imutavel,
            x.CustoInternoId, x.CustoInterno?.CodigoInterno,
            x.CriadoEm, x.AtualizadoEm,
            x.Despesas.Select(d => ToDespesaDto(d)).ToList(),
            x.Extras.Select(e => new OrcamentoVendaDespesaDto(e.Id, e.OrcamentoVendaId, e.Descricao, e.Valor, e.CriadoEm, e.AtualizadoEm)).ToList(),
            x.Custos.Select(c => new OrcamentoVendaCustoDto(
                c.Id, c.OrcamentoVendaId, c.CustoDespachanteId,
                c.CustoDespachante?.CodigoInterno ?? string.Empty,
                c.CustoDespachante?.Status ?? string.Empty,
                c.CriadoEm, c.AtualizadoEm)).ToList());

    private static OrcamentoVendaDespesaDto ToDespesaDto(OrcamentoVendaDespesa x) =>
        new(x.Id, x.OrcamentoVendaId, x.Descricao, x.Valor, x.CriadoEm, x.AtualizadoEm);
}
