namespace ImportCostsApi.Core.Models;

/// <summary>
/// Representa um erro de validação
/// </summary>
public class ValidationError
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
