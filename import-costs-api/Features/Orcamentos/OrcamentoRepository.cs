namespace ImportCostsApi.Features.Orcamentos;

using ImportCostsApi.Core.Database;
using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Features.Packlists;
using ImportCostsApi.Features.Custos;
using ImportCostsApi.Features.Vendas;
using ImportCostsApi.Features.Aduanas;
using ImportCostsApi.Features.Numerarios;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Repositório para gerenciar Orçamentos (entidade central)
/// Coordena as 4 fases do processo de importação e numerários
/// </summary>
public class OrcamentoRepository
{
    private readonly AppDbContext _context;
    private readonly PacklistRepository _packlistRepository;
    private readonly CustoRepository _custoRepository;
    private readonly VendaRepository _vendaRepository;
    private readonly AduanaRepository _aduanaRepository;
    private readonly NumerarioRepository _numerarioRepository;
    private readonly ILogger<OrcamentoRepository> _logger;

    public OrcamentoRepository(
        AppDbContext context,
        PacklistRepository packlistRepository,
        CustoRepository custoRepository,
        VendaRepository vendaRepository,
        AduanaRepository aduanaRepository,
        NumerarioRepository numerarioRepository,
        ILogger<OrcamentoRepository> logger)
    {
        _context = context;
        _packlistRepository = packlistRepository;
        _custoRepository = custoRepository;
        _vendaRepository = vendaRepository;
        _aduanaRepository = aduanaRepository;
        _numerarioRepository = numerarioRepository;
        _logger = logger;
    }

    /// <summary>
    /// Recupera um orçamento com resumo consolidado de todas as fases
    /// </summary>
    public async Task<OrcamentoLancamento> GetByIdAsync(string id)
    {
        var orcamento = _context.Set<OrcamentoLancamento>()
            .FirstOrDefault(o => o.Id == id);

        if (orcamento == null)
            throw new NotFoundException($"Orçamento {id} não encontrado");

        // Agregar dados das fases para resumo
        await PopularResumo(orcamento);

        return orcamento;
    }

    /// <summary>
    /// Recupera todos os orçamentos com paginação
    /// </summary>
    public async Task<IEnumerable<OrcamentoLancamento>> GetAllAsync(int skip = 0, int take = 50)
    {
        var orcamentos = _context.Set<OrcamentoLancamento>()
            .OrderByDescending(o => o.DataCriacao)
            .Skip(skip)
            .Take(take)
            .ToList();

        foreach (var orcamento in orcamentos)
        {
            await PopularResumo(orcamento);
        }

        return orcamentos;
    }

    /// <summary>
    /// Recupera orçamentos por cliente
    /// </summary>
    public async Task<IEnumerable<OrcamentoLancamento>> GetByClienteIdAsync(string clienteId)
    {
        var orcamentos = _context.Set<OrcamentoLancamento>()
            .Where(o => o.ClienteId == clienteId)
            .OrderByDescending(o => o.DataCriacao)
            .ToList();

        foreach (var orcamento in orcamentos)
        {
            await PopularResumo(orcamento);
        }

        return orcamentos;
    }

    /// <summary>
    /// Cria novo orçamento
    /// Requer cliente existente
    /// </summary>
    public async Task<OrcamentoLancamento> CreateAsync(OrcamentoLancamento orcamento)
    {
        // Validar cliente existe
        if (!await ClienteExistsAsync(orcamento.ClienteId))
            throw new ValidationException("ClienteId", $"Cliente {orcamento.ClienteId} não existe");

        // Validar template se informado
        if (!string.IsNullOrEmpty(orcamento.TemplatePacklistId))
        {
            if (!await TemplateExistsAsync(orcamento.TemplatePacklistId))
                throw new ValidationException("TemplatePacklistId", $"Template {orcamento.TemplatePacklistId} não existe");
        }

        // Gerar ID único (ORC-{timestamp-numerada})
        orcamento.Id = $"ORC-{DateTime.UtcNow.Ticks:D18}";
        orcamento.DataCriacao = DateTime.UtcNow;
        orcamento.DataAtualizacao = DateTime.UtcNow;

        // Inicializar status das fases
        orcamento.StatusFases = new[]
        {
            StatusFase.Pendente, // Orcamento (sempre pendente inicialmente)
            StatusFase.Pendente, // Packlist
            StatusFase.Pendente, // Custo
            StatusFase.Pendente, // Venda
            StatusFase.Pendente  // Aduana
        };

        _context.Set<OrcamentoLancamento>().Add(orcamento);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Orçamento {OrcamentoId} criado para cliente {ClienteId}", orcamento.Id, orcamento.ClienteId);

        return orcamento;
    }

    /// <summary>
    /// Atualiza informações gerais do orçamento
    /// Não permite mudança de cliente ou fase (use TransicaoFase para isso)
    /// </summary>
    public async Task<OrcamentoLancamento> UpdateAsync(string id, OrcamentoLancamento updates)
    {
        var orcamento = _context.Set<OrcamentoLancamento>()
            .FirstOrDefault(o => o.Id == id);

        if (orcamento == null)
            throw new NotFoundException($"Orçamento {id} não encontrado");

        // Atualizar apenas campos permitidos
        if (!string.IsNullOrEmpty(updates.Numero))
            orcamento.Numero = updates.Numero;

        if (!string.IsNullOrEmpty(updates.Titulo))
            orcamento.Titulo = updates.Titulo;

        if (!string.IsNullOrEmpty(updates.DespachanteId))
        {
            if (!await DespachanteExistsAsync(updates.DespachanteId))
                throw new ValidationException("DespachanteId", $"Despachante {updates.DespachanteId} não existe");
            orcamento.DespachanteId = updates.DespachanteId;
        }

        if (!string.IsNullOrEmpty(updates.MoedaPadrao))
            orcamento.MoedaPadrao = updates.MoedaPadrao;

        if (updates.Aprovado != orcamento.Aprovado)
            orcamento.Aprovado = updates.Aprovado;

        if (updates.AprovadoCliente != orcamento.AprovadoCliente)
            orcamento.AprovadoCliente = updates.AprovadoCliente;

        orcamento.DataAtualizacao = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await PopularResumo(orcamento);

        _logger.LogInformation("Orçamento {OrcamentoId} atualizado", id);

        return orcamento;
    }

    /// <summary>
    /// Deleta um orçamento (soft delete - marca como oficializado)
    /// Cascata: deleta fases associadas também
    /// </summary>
    public async Task DeleteAsync(string id)
    {
        var orcamento = _context.Set<OrcamentoLancamento>()
            .FirstOrDefault(o => o.Id == id);

        if (orcamento == null)
            throw new NotFoundException($"Orçamento {id} não encontrado");

        if (orcamento.Oficializado)
            throw new BusinessException("Não é possível deletar um orçamento oficializado");

        // TODO: Implementar cascata de deleção de fases
        // Por enquanto apenas marca como deletado logicamente

        _context.Set<OrcamentoLancamento>().Remove(orcamento);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Orçamento {OrcamentoId} deletado", id);
    }

    /// <summary>
    /// Transição entre fases - requer validações de conclusão da fase anterior
    /// Regra: Packlist → Custo → Venda → Aduana (sequencial obrigatório)
    /// </summary>
    public async Task<OrcamentoLancamento> TransicionarFaseAsync(string id, FaseOrcamento novaFase)
    {
        var orcamento = _context.Set<OrcamentoLancamento>()
            .FirstOrDefault(o => o.Id == id);

        if (orcamento == null)
            throw new NotFoundException($"Orçamento {id} não encontrado");

        // Validar se é uma transição válida (sequencial)
        if ((int)novaFase != (int)orcamento.FaseAtual + 1)
            throw new BusinessException(
                $"Transição inválida de {orcamento.FaseAtual} para {novaFase}. " +
                $"Deve ser sequencial. Fase atual: {orcamento.FaseAtual}");

        // Validar se fase anterior está concluída
        var indiceAtual = (int)orcamento.FaseAtual;
        if (orcamento.StatusFases[indiceAtual] != StatusFase.Concluida)
            throw new BusinessException(
                $"Não é possível avançar. A fase {orcamento.FaseAtual} não está concluída");

        // Validar requisitos da nova fase
        await ValidarRequisitosNovaFaseAsync(orcamento, novaFase);

        orcamento.FaseAtual = novaFase;
        orcamento.DataAtualizacao = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Orçamento {OrcamentoId} transicionou para fase {NovaFase}", id, novaFase);

        return orcamento;
    }

    /// <summary>
    /// Atualiza o status de uma fase específica
    /// Usado por handlers das fases para indicar mudanças de status
    /// </summary>
    public async Task<OrcamentoLancamento> AtualizarStatusFaseAsync(
        string orcamentoId,
        FaseOrcamento fase,
        StatusFase novoStatus)
    {
        var orcamento = _context.Set<OrcamentoLancamento>()
            .FirstOrDefault(o => o.Id == orcamentoId);

        if (orcamento == null)
            throw new NotFoundException($"Orçamento {orcamentoId} não encontrado");

        var indice = (int)fase;
        if (indice < 0 || indice >= orcamento.StatusFases.Length)
            throw new ValidationException("Fase", $"Índice de fase inválido: {indice}");

        orcamento.StatusFases[indice] = novoStatus;
        orcamento.DataAtualizacao = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Orçamento {OrcamentoId} - Fase {Fase} atualizada para {Status}",
            orcamentoId, fase, novoStatus);

        return orcamento;
    }

    /// <summary>
    /// Recupera resumo consolidado do orçamento (todas as fases)
    /// </summary>
    public async Task<OrcamentoResumoFases> GetResumoAsync(string orcamentoId)
    {
        var orcamento = await GetByIdAsync(orcamentoId);
        return orcamento.Resumo ?? new OrcamentoResumoFases();
    }

    /// <summary>
    /// Popula o resumo do orçamento com dados de todas as fases
    /// (agregação de dados para visão única)
    /// </summary>
    private async Task PopularResumo(OrcamentoLancamento orcamento)
    {
        var resumo = new OrcamentoResumoFases();

        try
        {
            // Resumo Packlist
            // TODO: Implementar agregação de dados do Packlist

            // Resumo Custo
            // TODO: Implementar agregação de dados do Custo

            // Resumo Venda
            // TODO: Implementar agregação de dados da Venda

            // Resumo Aduana
            // TODO: Implementar agregação de dados da Aduana

            // Resumo Numerários
            var totalNumerarios = await _numerarioRepository.GetTotalByOrcamentoIdAsync(orcamento.Id);
            var numerariosLista = await _numerarioRepository.GetByOrcamentoIdAsync(orcamento.Id);

            resumo.Numerarios = new OrcamentoResumoNumerarios
            {
                Saldo = totalNumerarios,
                TotalLancamentos = numerariosLista.Count(),
                TotalReceita = numerariosLista
                    .Where(n => n.Tipo == "Receita" && n.Status == "Aprovado")
                    .Sum(n => n.Valor),
                TotalDespesa = numerariosLista
                    .Where(n => n.Tipo == "Despesa" && n.Status == "Aprovado")
                    .Sum(n => n.Valor)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao popular resumo do orçamento {OrcamentoId}", orcamento.Id);
        }

        orcamento.Resumo = resumo;
    }

    /// <summary>
    /// Validar se fase anterior está concluída antes de permitir transição
    /// </summary>
    private async Task ValidarRequisitosNovaFaseAsync(OrcamentoLancamento orcamento, FaseOrcamento novaFase)
    {
        switch (novaFase)
        {
            case FaseOrcamento.Packlist:
                // Sem requisitos especiais
                break;

            case FaseOrcamento.Custo:
                // Packlist deve estar concluído
                if (orcamento.StatusFases[(int)FaseOrcamento.Packlist] != StatusFase.Concluida)
                    throw new BusinessException("Packlist deve estar concluído para avançar para Custo");
                break;

            case FaseOrcamento.Venda:
                // Custo deve estar concluído
                if (orcamento.StatusFases[(int)FaseOrcamento.Custo] != StatusFase.Concluida)
                    throw new BusinessException("Custo deve estar concluído para avançar para Venda");
                break;

            case FaseOrcamento.Aduana:
                // Venda deve estar concluída e Despachante obrigatório
                if (orcamento.StatusFases[(int)FaseOrcamento.Venda] != StatusFase.Concluida)
                    throw new BusinessException("Venda deve estar concluída para avançar para Aduana");

                if (string.IsNullOrEmpty(orcamento.DespachanteId))
                    throw new ValidationException("DespachanteId", "Despachante é obrigatório para fase de Aduana");

                if (!await DespachanteExistsAsync(orcamento.DespachanteId))
                    throw new ValidationException("DespachanteId", $"Despachante {orcamento.DespachanteId} não existe");
                break;
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// Validações de existência de entidades relacionadas
    /// </summary>
    private async Task<bool> ClienteExistsAsync(string clienteId)
    {
        // TODO: Implementar validação contra Cliente repository
        return await Task.FromResult(true);
    }

    private async Task<bool> DespachanteExistsAsync(string despachanteId)
    {
        // TODO: Implementar validação contra Despachante repository
        return await Task.FromResult(true);
    }

    private async Task<bool> TemplateExistsAsync(string templateId)
    {
        // TODO: Implementar validação contra Template repository
        return await Task.FromResult(true);
    }
}
