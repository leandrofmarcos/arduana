using Comex133Api.Domain.Entities;

namespace Comex133Api.Features.Navios;

// ── Navios ────────────────────────────────────────────────────────────────────

public record NavioDto(
    int     Id,
    string  NomeNavio,
    string? CodigoImo,
    string? Armador,
    string? Observacao,
    bool    Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record NavioComTrajetosDto(
    int                      Id,
    string                   NomeNavio,
    string?                  CodigoImo,
    string?                  Armador,
    string?                  Observacao,
    bool                     Ativo,
    DateTime                 CriadoEm,
    DateTime                 AtualizadoEm,
    IList<NavioTrajetoDto>   Trajetos
);

public record CreateNavioRequest(
    string  NomeNavio,
    string? CodigoImo,
    string? Armador,
    string? Observacao,
    bool    Ativo
);

public record UpdateNavioRequest(
    string  NomeNavio,
    string? CodigoImo,
    string? Armador,
    string? Observacao,
    bool    Ativo
);

// ── NavioTrajeto ──────────────────────────────────────────────────────────────

public record NavioTrajetoDto(
    int         Id,
    int         NavioId,
    string      NumeroViagem,
    int         Sequencia,
    int         PortoOrigemId,
    string      PortoOrigemNome,
    int         PortoDestinoId,
    string      PortoDestinoNome,
    string      Etd,
    string      Eta,
    StatusPerna StatusPerna,
    string?     Observacao,
    DateTime    CriadoEm,
    DateTime    AtualizadoEm
);

public record CreateNavioTrajetoRequest(
    string      NumeroViagem,
    int         Sequencia,
    int         PortoOrigemId,
    int         PortoDestinoId,
    string      Etd,
    string      Eta,
    StatusPerna StatusPerna,
    string?     Observacao
);

public record UpdateNavioTrajetoRequest(
    string      NumeroViagem,
    int         Sequencia,
    int         PortoOrigemId,
    int         PortoDestinoId,
    string      Etd,
    string      Eta,
    StatusPerna StatusPerna,
    string?     Observacao
);

public record UpdateNavioTrajetoStatusRequest(StatusPerna StatusPerna);

// ── EmbarqueNavioVinculo ──────────────────────────────────────────────────────

public record EmbarqueNavioVinculoDto(
    int       Id,
    int       EmbarqueAduanaId,
    int       NavioId,
    string    NomeNavio,
    int?      NavioTrajetoId,
    string?   NumeroViagem,
    bool      Ativo,
    DateTime  VinculadoEm,
    DateTime? DesvinculadoEm,
    string?   Observacao,
    DateTime  CriadoEm,
    DateTime  AtualizadoEm
);

public record CreateEmbarqueNavioVinculoRequest(
    int     NavioId,
    int?    NavioTrajetoId,
    string? NumeroViagem,
    string? Observacao
);

public record UpdateEmbarqueNavioVinculoRequest(
    int?    NavioTrajetoId,
    string? NumeroViagem,
    string? Observacao
);

// ── Shared ────────────────────────────────────────────────────────────────────

public record AtivoRequest(bool Ativo);
