namespace Comex133Api.Features.UsuarioVinculos;

public record UsuarioVinculoDto(
    int Id,
    int UsuarioId,
    string TipoVinculo,
    int EntidadeId,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateUsuarioVinculoRequest(
    int UsuarioId,
    string TipoVinculo,
    int EntidadeId
);

public record UpdateUsuarioVinculoAtivoRequest(bool Ativo);
