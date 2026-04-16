using Comex133Api.Core.Models;

namespace Comex133Api.Core.Exceptions;

public class ValidationException : Exception
{
    public List<ValidationError> Errors { get; }

    public ValidationException(List<ValidationError> errors)
        : base("Erros de validação encontrados.")
    {
        Errors = errors;
    }
}
