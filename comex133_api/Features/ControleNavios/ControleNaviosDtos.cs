namespace Comex133Api.Features.ControleNavios;

public record ControleNavioDto(
    int Id,
    string NumeroViagem,
    string NomeNavio,
    string? Observacao,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record ControleNavioComTrajetosDto(
    int Id,
    string NumeroViagem,
    string NomeNavio,
    string? Observacao,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm,
    IList<ControleNavioTrajetoDto> Trajetos
);

public record ControleNavioTrajetoDto(
    int Id,
    int ControleNavioId,
    int PortoOrigemId,
    string PortoOrigemNome,
    int PortoDestinoId,
    string PortoDestinoNome,
    string Etd,
    string Eta,
    string? TrajetoDescricao,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateControleNavioRequest(
    string NumeroViagem,
    string NomeNavio,
    string? Observacao,
    bool Ativo
);

public record UpdateControleNavioRequest(
    string NumeroViagem,
    string NomeNavio,
    string? Observacao,
    bool Ativo
);

public record UpsertControleNavioTrajetoRequest(
    int PortoOrigemId,
    int PortoDestinoId,
    string Etd,
    string Eta,
    string? TrajetoDescricao
);

public record AtivoRequest(bool Ativo);
