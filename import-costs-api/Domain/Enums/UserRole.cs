namespace ImportCostsApi.Domain.Enums;

/// <summary>
/// Papéis de usuário na aplicação
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Administrador do sistema
    /// </summary>
    Admin = 1,

    /// <summary>
    /// Usuário de vendas
    /// </summary>
    Vendedor = 2,

    /// <summary>
    /// Usuário operacional
    /// </summary>
    Operacional = 3,

    /// <summary>
    /// Usuário de financeiro
    /// </summary>
    Financeiro = 4,

    /// <summary>
    /// Visualizador apenas
    /// </summary>
    Visualizador = 5
}
