namespace ImportCostsApi.Core.Exceptions;

/// <summary>
/// Exceção para erros de regras de negócio
/// </summary>
public class BusinessException : Exception
{
    public BusinessException(string message) : base(message)
    {
    }

    public BusinessException(string message, Exception innerException) 
        : base(message, innerException)
    {
    }
}
