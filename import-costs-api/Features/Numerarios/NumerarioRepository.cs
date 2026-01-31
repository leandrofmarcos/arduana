namespace ImportCostsApi.Features.Numerarios;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Repository for Numerario Lancamento (Financial Entry) entity
/// Note: This is 1:N relationship with Orcamento (multiple entries per Orcamento)
/// </summary>
public class NumerarioRepository
{
    private static readonly List<NumerarioLancamento> _lancamentos = new();
    private static int _nextId = 1;

    public async Task<NumerarioLancamento?> GetByIdAsync(string id)
    {
        return await Task.FromResult(_lancamentos.FirstOrDefault(n => n.Id == id));
    }

    public async Task<List<NumerarioLancamento>> GetByOrcamentoIdAsync(string orcamentoId)
    {
        return await Task.FromResult(_lancamentos
            .Where(n => n.OrcamentoId == orcamentoId)
            .OrderByDescending(n => n.Data)
            .ToList());
    }

    public async Task<List<NumerarioLancamento>> GetAllAsync()
    {
        return await Task.FromResult(_lancamentos.ToList());
    }

    public async Task<NumerarioLancamento> CreateAsync(NumerarioLancamento lancamento)
    {
        if (string.IsNullOrEmpty(lancamento.Id))
        {
            lancamento.Id = $"NUM-{_nextId:D5}";
            _nextId++;
        }

        lancamento.Data = DateTime.UtcNow;
        lancamento.Status = "Pendente";
        lancamento.Trilha.Add(new TrilhaAuditoria
        {
            DataAlteracao = DateTime.UtcNow,
            Acao = "Criação",
            Usuario = "Sistema"
        });

        _lancamentos.Add(lancamento);
        return await Task.FromResult(lancamento);
    }

    public async Task<NumerarioLancamento> UpdateAsync(string id, NumerarioLancamento lancamento)
    {
        var existing = await GetByIdAsync(id);
        if (existing == null)
            throw new NotFoundException("Numerario Lancamento", id);

        // Track changes in audit trail
        if (existing.Valor != lancamento.Valor && lancamento.Valor > 0)
        {
            existing.Trilha.Add(new TrilhaAuditoria
            {
                DataAlteracao = DateTime.UtcNow,
                Acao = "Atualização de Valor",
                Usuario = "Sistema",
                ValorAnterior = existing.Valor.ToString(),
                ValorNovo = lancamento.Valor.ToString()
            });
            existing.Valor = lancamento.Valor;
        }

        if (!string.IsNullOrEmpty(lancamento.Moeda) && existing.Moeda != lancamento.Moeda)
        {
            existing.Trilha.Add(new TrilhaAuditoria
            {
                DataAlteracao = DateTime.UtcNow,
                Acao = "Atualização de Moeda",
                Usuario = "Sistema",
                ValorAnterior = existing.Moeda,
                ValorNovo = lancamento.Moeda
            });
            existing.Moeda = lancamento.Moeda;
        }

        existing.Tipo = lancamento.Tipo ?? existing.Tipo;
        existing.Status = lancamento.Status ?? existing.Status;
        existing.Responsavel = lancamento.Responsavel ?? existing.Responsavel;
        existing.Observacao = lancamento.Observacao ?? existing.Observacao;

        return await Task.FromResult(existing);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var existing = await GetByIdAsync(id);
        if (existing == null)
            throw new NotFoundException("Numerario Lancamento", id);

        return await Task.FromResult(_lancamentos.Remove(existing));
    }

    /// <summary>
    /// Validates if a Orcamento exists
    /// </summary>
    public async Task<bool> OrcamentoExistsAsync(string orcamentoId)
    {
        // This would be replaced with actual Orcamento repository check
        return await Task.FromResult(true);
    }

    /// <summary>
    /// Gets total of entries (Receita - Despesa) for an Orcamento
    /// </summary>
    public async Task<decimal> GetTotalByOrcamentoIdAsync(string orcamentoId)
    {
        var lancamentos = await GetByOrcamentoIdAsync(orcamentoId);
        var receitas = lancamentos
            .Where(l => l.Tipo == "Receita" && l.Status == "Aprovado")
            .Sum(l => l.Valor);
        var despesas = lancamentos
            .Where(l => l.Tipo == "Despesa" && l.Status == "Aprovado")
            .Sum(l => l.Valor);

        return await Task.FromResult(receitas - despesas);
    }

    public void Clear()
    {
        _lancamentos.Clear();
        _nextId = 1;
    }
}

/// <summary>
/// Numerario Lancamento domain model
/// </summary>
public class NumerarioLancamento
{
    public string Id { get; set; } = string.Empty;
    public string OrcamentoId { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string Moeda { get; set; } = "BRL";
    public DateTime Data { get; set; }
    public string? Responsavel { get; set; }
    public string Status { get; set; } = "Pendente";
    public string? Observacao { get; set; }
    public string? Tipo { get; set; }
    public List<TrilhaAuditoria> Trilha { get; set; } = new();
}

/// <summary>
/// Audit trail for Numerario changes
/// </summary>
public class TrilhaAuditoria
{
    public DateTime DataAlteracao { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public string Acao { get; set; } = string.Empty;
    public string? ValorAnterior { get; set; }
    public string? ValorNovo { get; set; }
}
