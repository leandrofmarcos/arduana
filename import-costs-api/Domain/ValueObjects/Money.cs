namespace ImportCostsApi.Domain.ValueObjects;

/// <summary>
/// Value Object que representa uma quantidade monetária
/// </summary>
public class Money
{
    /// <summary>
    /// Quantidade em valor monetário
    /// </summary>
    public decimal Valor { get; set; }

    /// <summary>
    /// Código da moeda (BRL, USD, EUR, etc)
    /// </summary>
    public string Moeda { get; set; } = "BRL";

    /// <summary>
    /// Inicializa um novo Money
    /// </summary>
    /// <param name="valor">Valor monetário</param>
    /// <param name="moeda">Código da moeda</param>
    public Money(decimal valor, string moeda = "BRL")
    {
        if (valor < 0)
            throw new ArgumentException("Valor não pode ser negativo", nameof(valor));

        if (string.IsNullOrWhiteSpace(moeda))
            throw new ArgumentException("Moeda é obrigatória", nameof(moeda));

        Valor = valor;
        Moeda = moeda.ToUpperInvariant();
    }

    /// <summary>
    /// Sobrecarga do operador == para comparação
    /// </summary>
    public static bool operator ==(Money? esquerda, Money? direita)
    {
        if (ReferenceEquals(esquerda, direita))
            return true;

        if (ReferenceEquals(esquerda, null) || ReferenceEquals(direita, null))
            return false;

        return esquerda.Valor == direita.Valor && esquerda.Moeda == direita.Moeda;
    }

    /// <summary>
    /// Sobrecarga do operador != para comparação
    /// </summary>
    public static bool operator !=(Money? esquerda, Money? direita)
    {
        return !(esquerda == direita);
    }

    /// <summary>
    /// Sobrecarga do operador + para adição
    /// </summary>
    public static Money operator +(Money esquerda, Money direita)
    {
        if (esquerda.Moeda != direita.Moeda)
            throw new InvalidOperationException($"Não é possível somar moedas diferentes: {esquerda.Moeda} e {direita.Moeda}");

        return new Money(esquerda.Valor + direita.Valor, esquerda.Moeda);
    }

    /// <summary>
    /// Sobrecarga do operador - para subtração
    /// </summary>
    public static Money operator -(Money esquerda, Money direita)
    {
        if (esquerda.Moeda != direita.Moeda)
            throw new InvalidOperationException($"Não é possível subtrair moedas diferentes: {esquerda.Moeda} e {direita.Moeda}");

        return new Money(esquerda.Valor - direita.Valor, esquerda.Moeda);
    }

    /// <summary>
    /// Sobrecarga do operador * para multiplicação
    /// </summary>
    public static Money operator *(Money money, decimal multiplicador)
    {
        if (multiplicador < 0)
            throw new ArgumentException("Multiplicador não pode ser negativo", nameof(multiplicador));

        return new Money(money.Valor * multiplicador, money.Moeda);
    }

    public override bool Equals(object? obj)
    {
        return obj is Money money && this == money;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Valor, Moeda);
    }

    public override string ToString()
    {
        return $"{Moeda} {Valor:N2}";
    }
}
