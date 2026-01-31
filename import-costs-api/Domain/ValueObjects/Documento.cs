namespace ImportCostsApi.Domain.ValueObjects;

/// <summary>
/// Value Object que representa um Documento (CPF ou CNPJ)
/// </summary>
public class Documento
{
    /// <summary>
    /// Número do documento
    /// </summary>
    public string Numero { get; set; }

    /// <summary>
    /// Tipo do documento (CPF ou CNPJ)
    /// </summary>
    public string Tipo { get; set; }

    /// <summary>
    /// Inicializa um novo Documento
    /// </summary>
    /// <param name="numero">Número do documento</param>
    /// <exception cref="ArgumentException">Quando o documento é inválido</exception>
    public Documento(string numero)
    {
        if (string.IsNullOrWhiteSpace(numero))
            throw new ArgumentException("Número do documento é obrigatório", nameof(numero));

        var apenasNumeros = new string(numero.Where(char.IsDigit).ToArray());

        if (apenasNumeros.Length == 11)
        {
            if (!ValidarCPF(apenasNumeros))
                throw new ArgumentException("CPF inválido", nameof(numero));
            Tipo = "CPF";
        }
        else if (apenasNumeros.Length == 14)
        {
            if (!ValidarCNPJ(apenasNumeros))
                throw new ArgumentException("CNPJ inválido", nameof(numero));
            Tipo = "CNPJ";
        }
        else
        {
            throw new ArgumentException("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)", nameof(numero));
        }

        Numero = apenasNumeros;
    }

    /// <summary>
    /// Valida um CPF usando algoritmo de checksum
    /// </summary>
    private static bool ValidarCPF(string cpf)
    {
        if (cpf.Length != 11)
            return false;

        if (cpf.All(c => c == cpf[0]))
            return false;

        // Validar primeiro dígito verificador
        var soma = 0;
        for (int i = 0; i < 9; i++)
            soma += int.Parse(cpf[i].ToString()) * (10 - i);

        var resto = soma % 11;
        var digito1 = resto < 2 ? 0 : 11 - resto;

        if (int.Parse(cpf[9].ToString()) != digito1)
            return false;

        // Validar segundo dígito verificador
        soma = 0;
        for (int i = 0; i < 10; i++)
            soma += int.Parse(cpf[i].ToString()) * (11 - i);

        resto = soma % 11;
        var digito2 = resto < 2 ? 0 : 11 - resto;

        return int.Parse(cpf[10].ToString()) == digito2;
    }

    /// <summary>
    /// Valida um CNPJ usando algoritmo de checksum
    /// </summary>
    private static bool ValidarCNPJ(string cnpj)
    {
        if (cnpj.Length != 14)
            return false;

        if (cnpj.All(c => c == cnpj[0]))
            return false;

        // Validar primeiro dígito verificador
        var soma = 0;
        var multiplicador = 5;

        for (int i = 0; i < 12; i++)
        {
            soma += int.Parse(cnpj[i].ToString()) * multiplicador;
            multiplicador = multiplicador == 2 ? 9 : multiplicador - 1;
        }

        var resto = soma % 11;
        var digito1 = resto < 2 ? 0 : 11 - resto;

        if (int.Parse(cnpj[12].ToString()) != digito1)
            return false;

        // Validar segundo dígito verificador
        soma = 0;
        multiplicador = 6;

        for (int i = 0; i < 13; i++)
        {
            soma += int.Parse(cnpj[i].ToString()) * multiplicador;
            multiplicador = multiplicador == 2 ? 9 : multiplicador - 1;
        }

        resto = soma % 11;
        var digito2 = resto < 2 ? 0 : 11 - resto;

        return int.Parse(cnpj[13].ToString()) == digito2;
    }

    /// <summary>
    /// Sobrecarga do operador == para comparação
    /// </summary>
    public static bool operator ==(Documento? esquerdo, Documento? direito)
    {
        if (ReferenceEquals(esquerdo, direito))
            return true;

        if (ReferenceEquals(esquerdo, null) || ReferenceEquals(direito, null))
            return false;

        return esquerdo.Numero == direito.Numero && esquerdo.Tipo == direito.Tipo;
    }

    /// <summary>
    /// Sobrecarga do operador != para comparação
    /// </summary>
    public static bool operator !=(Documento? esquerdo, Documento? direito)
    {
        return !(esquerdo == direito);
    }

    public override bool Equals(object? obj)
    {
        return obj is Documento documento && this == documento;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Numero, Tipo);
    }

    public override string ToString()
    {
        return Tipo == "CPF"
            ? $"{Numero[..3]}.{Numero[3..6]}.{Numero[6..9]}-{Numero[9..]}"
            : $"{Numero[..2]}.{Numero[2..5]}.{Numero[5..8]}/{Numero[8..12]}-{Numero[12..]}";
    }
}
