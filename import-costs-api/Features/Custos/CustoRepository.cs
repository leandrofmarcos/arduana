namespace ImportCostsApi.Features.Custos;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Repository for Custo (Cost) entity with relationship validation to Orcamento
/// </summary>
public class CustoRepository
{
    private static readonly List<Custo> _custos = new();
    private static int _nextId = 1;

    public async Task<Custo?> GetByIdAsync(string id)
    {
        return await Task.FromResult(_custos.FirstOrDefault(c => c.Id == id));
    }

    public async Task<Custo?> GetByOrcamentoIdAsync(string orcamentoId)
    {
        return await Task.FromResult(_custos.FirstOrDefault(c => c.OrcamentoId == orcamentoId));
    }

    public async Task<List<Custo>> GetAllAsync()
    {
        return await Task.FromResult(_custos.ToList());
    }

    public async Task<Custo> CreateAsync(Custo custo)
    {
        if (string.IsNullOrEmpty(custo.Id))
        {
            custo.Id = $"CUSTO-{_nextId:D5}";
            _nextId++;
        }

        custo.CriadoEm = DateTime.UtcNow;
        custo.Status = "Rascunho";
        
        _custos.Add(custo);
        return await Task.FromResult(custo);
    }

    public async Task<Custo> UpdateAsync(string id, Custo custo)
    {
        var existing = await GetByIdAsync(id);
        if (existing == null)
            throw new NotFoundException("Custo", id);

        existing.Codigo = custo.Codigo ?? existing.Codigo;
        existing.Premissas = custo.Premissas ?? existing.Premissas;
        existing.Taxas = custo.Taxas ?? existing.Taxas;
        existing.Resumo = custo.Resumo ?? existing.Resumo;
        existing.Status = custo.Status ?? existing.Status;

        // Update expenses
        if (custo.Despesas != null && custo.Despesas.Any())
        {
            existing.Despesas = custo.Despesas;
        }

        return await Task.FromResult(existing);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var existing = await GetByIdAsync(id);
        if (existing == null)
            throw new NotFoundException("Custo", id);

        return await Task.FromResult(_custos.Remove(existing));
    }

    /// <summary>
    /// Validates if a Orcamento exists
    /// </summary>
    public async Task<bool> OrcamentoExistsAsync(string orcamentoId)
    {
        // This would be replaced with actual Orcamento repository check
        // For now, returning true as Orcamento feature will be created next
        return await Task.FromResult(true);
    }

    /// <summary>
    /// Checks if a Custo already exists for the given Orcamento (1:1 relationship)
    /// </summary>
    public async Task<bool> HasCustoAsync(string orcamentoId)
    {
        return await Task.FromResult(_custos.Any(c => c.OrcamentoId == orcamentoId));
    }

    public void Clear()
    {
        _custos.Clear();
        _nextId = 1;
    }
}

/// <summary>
/// Custo domain model
/// </summary>
public class Custo
{
    public string Id { get; set; } = string.Empty;
    public string OrcamentoId { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Cliente { get; set; } = string.Empty;
    public string Despachante { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
    public Dictionary<string, object> Premissas { get; set; } = new();
    public Dictionary<string, decimal> Taxas { get; set; } = new();
    public Dictionary<string, decimal> Resumo { get; set; } = new();
    public List<Despesa> Despesas { get; set; } = new();
    public string Status { get; set; } = "Rascunho";
}

/// <summary>
/// Despesa domain model (operational expense)
/// </summary>
public class Despesa
{
    public string Id { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Item { get; set; } = string.Empty;
    public string Fornecedor { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string? Observacao { get; set; }
}
