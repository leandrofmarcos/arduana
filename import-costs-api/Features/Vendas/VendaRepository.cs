namespace ImportCostsApi.Features.Vendas;

using ImportCostsApi.Core.Exceptions;

/// <summary>
/// Repository for Venda (Sales) entity with relationship validation to Orcamento
/// </summary>
public class VendaRepository
{
    private static readonly List<Venda> _vendas = new();
    private static int _nextId = 1;

    public async Task<Venda?> GetByIdAsync(string id)
    {
        return await Task.FromResult(_vendas.FirstOrDefault(v => v.Id == id));
    }

    public async Task<Venda?> GetByOrcamentoIdAsync(string orcamentoId)
    {
        return await Task.FromResult(_vendas.FirstOrDefault(v => v.OrcamentoId == orcamentoId));
    }

    public async Task<List<Venda>> GetAllAsync()
    {
        return await Task.FromResult(_vendas.ToList());
    }

    public async Task<Venda> CreateAsync(Venda venda)
    {
        if (string.IsNullOrEmpty(venda.Id))
        {
            venda.Id = $"VENDA-{_nextId:D5}";
            _nextId++;
        }

        venda.CriadoEm = DateTime.UtcNow;
        venda.Status = "Rascunho";

        _vendas.Add(venda);
        return await Task.FromResult(venda);
    }

    public async Task<Venda> UpdateAsync(string id, Venda venda)
    {
        var existing = await GetByIdAsync(id);
        if (existing == null)
            throw new NotFoundException("Venda", id);

        existing.Codigo = venda.Codigo ?? existing.Codigo;
        existing.Premissasdelha = venda.Premissasdelha ?? existing.Premissasdelha;
        existing.Resumo = venda.Resumo ?? existing.Resumo;
        existing.Status = venda.Status ?? existing.Status;

        return await Task.FromResult(existing);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var existing = await GetByIdAsync(id);
        if (existing == null)
            throw new NotFoundException("Venda", id);

        return await Task.FromResult(_vendas.Remove(existing));
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
    /// Checks if a Venda already exists for the given Orcamento (1:1 relationship)
    /// </summary>
    public async Task<bool> HasVendaAsync(string orcamentoId)
    {
        return await Task.FromResult(_vendas.Any(v => v.OrcamentoId == orcamentoId));
    }

    public void Clear()
    {
        _vendas.Clear();
        _nextId = 1;
    }
}

/// <summary>
/// Venda domain model
/// </summary>
public class Venda
{
    public string Id { get; set; } = string.Empty;
    public string OrcamentoId { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string Cliente { get; set; } = string.Empty;
    public string Despachante { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
    public Dictionary<string, object> Premissas { get; set; } = new();
    public Dictionary<string, decimal> CustoReferencia { get; set; } = new();
    public Dictionary<string, decimal> Taxas { get; set; } = new();
    public Dictionary<string, decimal> Premissasdelha { get; set; } = new();
    public Dictionary<string, decimal> Resumo { get; set; } = new();
    public string Status { get; set; } = "Rascunho";
}
