namespace ImportCostsApi.Features.Funcionarios;

/// <summary>
/// DTO de resposta para Funcionário
/// </summary>
public class FuncionarioResponseDto
{
    /// <summary>
    /// ID do funcionário
    /// </summary>
    public string Id { get; set; } = string.Empty;

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

    /// <summary>
    /// Data de criação
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Data da última atualização
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
