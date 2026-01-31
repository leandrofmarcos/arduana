namespace ImportCostsApi.Domain.Enums;

/// <summary>
/// Status possíveis de um Packlist
/// </summary>
public enum PacklistStatus
{
    /// <summary>
    /// Packlist pendente de envio/processamento
    /// </summary>
    Pendente = 1,

    /// <summary>
    /// Packlist em andamento
    /// </summary>
    EmAndamento = 2,

    /// <summary>
    /// Packlist concluído
    /// </summary>
    Concluido = 3
}
