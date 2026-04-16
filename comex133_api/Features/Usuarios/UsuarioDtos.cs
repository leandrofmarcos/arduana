namespace Comex133Api.Features.Usuarios;

public record UsuarioDto(
    int Id,
    string Email,
    string NomeCompleto,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm,
    DateTime? UltimoLoginEm,
    IEnumerable<string> Roles);

public record CreateUsuarioRequest(
    string Email,
    string NomeCompleto,
    string Senha,
    IEnumerable<int>? RoleIds);

public record UpdateUsuarioRequest(
    string NomeCompleto);

public record AlterarSenhaRequest(
    string SenhaAtual,
    string NovaSenha);

public record AlterarSenhaAdminRequest(
    string NovaSenha);

public record AtivoRequest(bool Ativo);

public record AtribuirRolesRequest(IEnumerable<int> RoleIds);
