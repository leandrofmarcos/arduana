using ImportCostsApi.Core.Models;

namespace ImportCostsApi.Core.Exceptions;

/// <summary>
/// Exceção para erros de validação
/// </summary>
public class ValidationException : Exception
{
    public ValidationException(IEnumerable<ValidationError> errors) 
        : base("Ocorreram erros de validação")
    {
        Errors = errors.ToList();
    }

    public ValidationException(string field, string message) 
        : base("Ocorreram erros de validação")
    {
        Errors = new List<ValidationError>
        {
            new ValidationError { Field = field, Message = message }
        };
    }

    public List<ValidationError> Errors { get; }
}
