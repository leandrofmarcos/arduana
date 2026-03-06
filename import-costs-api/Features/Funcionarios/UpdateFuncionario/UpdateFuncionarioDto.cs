namespace ImportCostsApi.Features.Funcionarios.UpdateFuncionario;

/// <summary>
/// DTO para atualizar um funcionário
/// </summary>
public class UpdateFuncionarioDto
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
    public string? Email { get; set; }

    /// <summary>
    /// Setor
    /// </summary>
    public string? Setor { get; set; }

    /// <summary>
    /// Cargo
    /// </summary>
    public string? Cargo { get; set; }
}
