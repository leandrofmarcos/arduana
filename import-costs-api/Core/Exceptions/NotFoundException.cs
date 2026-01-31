namespace ImportCostsApi.Core.Exceptions;

/// <summary>
/// Exceção para quando um recurso não é encontrado
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string entity, string id) 
        : base($"{entity} com ID '{id}' não foi encontrado")
    {
        Entity = entity;
        Id = id;
    }

    public NotFoundException(string message) : base(message)
    {
    }

    public string? Entity { get; }
    public string? Id { get; }
}
