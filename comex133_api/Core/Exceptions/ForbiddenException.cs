namespace Comex133Api.Core.Exceptions;

public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "Acesso negado.") : base(message) { }
}
