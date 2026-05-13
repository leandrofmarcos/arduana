namespace Comex133Api.Infrastructure.Storage;

/// <summary>Resultado de um upload bem-sucedido.</summary>
public record StorageResult(
    string Url,          // URL pública completa — ex: https://api.comex133.com.br/uploads/packlist/abc_file.pdf
    string RelativePath, // caminho relativo     — ex: /uploads/packlist/abc_file.pdf
    string FileName      // nome único gerado     — ex: abc123_Proforma.pdf
);
