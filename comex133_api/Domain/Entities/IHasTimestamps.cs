namespace Comex133Api.Domain.Entities;

public interface IHasTimestamps
{
    DateTime CriadoEm { get; set; }
    DateTime AtualizadoEm { get; set; }
}
