namespace ImportCostsApi.Domain.Enums;

/// <summary>
/// Status possíveis de um Lançamento de Numerário
/// </summary>
public enum NumerarioStatus
{
    /// <summary>
    /// Numerário solicitado
    /// </summary>
    Solicitado = 1,

    /// <summary>
    /// Numerário enviado
    /// </summary>
    Enviado = 2,

    /// <summary>
    /// Numerário pago
    /// </summary>
    Pago = 3,

    /// <summary>
    /// Numerário recebido
    /// </summary>
    Recebido = 4
}
