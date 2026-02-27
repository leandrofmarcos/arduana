namespace ImportCostsApi.Domain.Entities;

/// <summary>
/// Entidade que representa um Funcionário
/// </summary>
public class Funcionario : BaseEntity
{
    /// <summary>
    /// Nome completo do funcionário
    /// </summary>
    public string NomeCompleto { get; set; } = string.Empty;

    /// <summary>
    /// Nome de usuário (username)
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Contato WhatsApp
    /// </summary>
    public string? ContatoWhatsApp { get; set; }

    /// <summary>
    /// Contato WeChat
    /// </summary>
    public string? ContatoWeChat { get; set; }

    /// <summary>
    /// Email
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Setor
    /// </summary>
    public string Setor { get; set; } = string.Empty;

    /// <summary>
    /// Cargo
    /// </summary>
    public string Cargo { get; set; } = string.Empty;
}
