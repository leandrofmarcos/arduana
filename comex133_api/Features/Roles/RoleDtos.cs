namespace Comex133Api.Features.Roles;

public record RoleDto(
    int Id,
    string Nome,
    string? Descricao,
    DateTime CriadoEm,
    DateTime AtualizadoEm);

public record CreateRoleRequest(
    string Nome,
    string? Descricao);

public record UpdateRoleRequest(
    string Nome,
    string? Descricao);
