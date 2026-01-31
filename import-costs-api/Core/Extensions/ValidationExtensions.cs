using ImportCostsApi.Core.Models;
using System.Text.RegularExpressions;

namespace ImportCostsApi.Core.Extensions;

/// <summary>
/// Extensões para validação de dados
/// </summary>
public static class ValidationExtensions
{
    /// <summary>
    /// Valida se um documento (CPF/CNPJ) é válido
    /// </summary>
    public static bool IsValidDocumento(this string documento)
    {
        if (string.IsNullOrWhiteSpace(documento))
            return false;

        // Remove caracteres não numéricos
        var numeros = Regex.Replace(documento, @"[^\d]", "");

        // Verifica se é CPF (11 dígitos) ou CNPJ (14 dígitos)
        return numeros.Length == 11 ? IsValidCPF(numeros) : 
               numeros.Length == 14 ? IsValidCNPJ(numeros) : false;
    }

    private static bool IsValidCPF(string cpf)
    {
        if (cpf.Length != 11)
            return false;

        // Verifica se todos os dígitos são iguais
        if (cpf.Distinct().Count() == 1)
            return false;

        // Validação dos dígitos verificadores
        var tempCpf = cpf.Substring(0, 9);
        var soma = 0;

        for (int i = 0; i < 9; i++)
            soma += int.Parse(tempCpf[i].ToString()) * (10 - i);

        var resto = soma % 11;
        var digito = resto < 2 ? 0 : 11 - resto;

        tempCpf += digito;
        soma = 0;

        for (int i = 0; i < 10; i++)
            soma += int.Parse(tempCpf[i].ToString()) * (11 - i);

        resto = soma % 11;
        digito = resto < 2 ? 0 : 11 - resto;

        return cpf.EndsWith(tempCpf + digito);
    }

    private static bool IsValidCNPJ(string cnpj)
    {
        if (cnpj.Length != 14)
            return false;

        // Verifica se todos os dígitos são iguais
        if (cnpj.Distinct().Count() == 1)
            return false;

        // Validação dos dígitos verificadores
        var tempCnpj = cnpj.Substring(0, 12);
        var soma = 0;
        var multiplicador = 5;

        for (int i = 0; i < 12; i++)
        {
            soma += int.Parse(tempCnpj[i].ToString()) * multiplicador;
            multiplicador = multiplicador == 2 ? 9 : multiplicador - 1;
        }

        var resto = soma % 11;
        var digito = resto < 2 ? 0 : 11 - resto;

        tempCnpj += digito;
        soma = 0;
        multiplicador = 6;

        for (int i = 0; i < 13; i++)
        {
            soma += int.Parse(tempCnpj[i].ToString()) * multiplicador;
            multiplicador = multiplicador == 2 ? 9 : multiplicador - 1;
        }

        resto = soma % 11;
        digito = resto < 2 ? 0 : 11 - resto;

        return cnpj.EndsWith(tempCnpj + digito);
    }

    /// <summary>
    /// Valida se uma string é um email válido
    /// </summary>
    public static bool IsValidEmail(this string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Cria um ValidationError a partir de uma mensagem
    /// </summary>
    public static ValidationError ToValidationError(this string message, string field)
    {
        return new ValidationError
        {
            Field = field,
            Message = message
        };
    }
}
