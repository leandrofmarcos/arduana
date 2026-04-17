namespace Comex133Api.Features.Ncms;

public record NcmDto(
    int Id,
    string CodigoNcm,
    string Descricao,
    decimal AliqII,
    decimal AliqIPI,
    decimal AliqPIS,
    decimal AliqCOFINS,
    decimal AliqICMS,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateNcmRequest(
    string CodigoNcm,
    string Descricao,
    decimal AliqII,
    decimal AliqIPI,
    decimal AliqPIS,
    decimal AliqCOFINS,
    decimal AliqICMS
);

public record UpdateNcmRequest(
    string CodigoNcm,
    string Descricao,
    decimal AliqII,
    decimal AliqIPI,
    decimal AliqPIS,
    decimal AliqCOFINS,
    decimal AliqICMS
);

public record AtivoRequest(bool Ativo);
