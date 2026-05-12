namespace Comex133Api.Features.CustosDespachante;

// ── Listas de retorno ────────────────────────────────────────────────────────

public record CustoDespachanteListDto(
    int Id,
    string CodigoInterno,
    int? SolicitacaoOrcamentoId,
    int DespachanteId,
    int? ImportadorId,
    int PortoOrigemId,
    int PortoDestinoId,
    string Responsavel,
    string TamContainer,
    decimal Peso,
    decimal FobUsd,
    decimal FobReais,
    decimal CifUsd,
    decimal CifReais,
    decimal SeguroUsd,
    decimal FreteInternacionalUsd,
    decimal TaxaUsd,
    decimal ParametroUsd,
    decimal? TaxaUsdAgente,
    decimal? TotalGeralManual,
    string? Observacao,
    DateTime Data,
    string Status,
    int Versao,
    int? VersaoAnteriorId,
    bool Imutavel,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

// ── Detalhe com filhos ────────────────────────────────────────────────────────

public record CustoDespachanteDto(
    int Id,
    string CodigoInterno,
    int? SolicitacaoOrcamentoId,
    int DespachanteId,
    int? ImportadorId,
    int PortoOrigemId,
    int PortoDestinoId,
    string Responsavel,
    string TamContainer,
    decimal Peso,
    decimal FobUsd,
    decimal FobReais,
    decimal CifUsd,
    decimal CifReais,
    decimal SeguroUsd,
    decimal FreteInternacionalUsd,
    decimal TaxaUsd,
    decimal ParametroUsd,
    decimal? TaxaUsdAgente,
    decimal? TotalGeralManual,
    string? Observacao,
    DateTime Data,
    string Status,
    int Versao,
    int? VersaoAnteriorId,
    bool Imutavel,
    DateTime CriadoEm,
    DateTime AtualizadoEm,
    IReadOnlyList<CustoDespachanteLiDto> Lis,
    IReadOnlyList<CustoDespachanteDespesaDto> Despesas,
    IReadOnlyList<NcmVinculadoCustoDto> Ncms
);

// ── Filhos ────────────────────────────────────────────────────────────────────

public record CustoDespachanteLiDto(
    int Id,
    int CustoDespachanteId,
    string Ncm,
    string Descricao,
    decimal Valor,
    DateTime Data,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CustoDespachanteDespesaDto(
    int Id,
    int CustoDespachanteId,
    string Descricao,
    decimal Valor,
    DateTime Data,
    bool EntraBaseIcms,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record NcmVinculadoCustoDto(
    int Id,
    int CustoDespachanteId,
    int? NcmId,
    string NumeroNcm,
    string Descricao,
    decimal AliIi,
    decimal AliIpi,
    decimal AliPis,
    decimal AliCofins,
    decimal AliIcms,
    decimal BaseCalculo,
    DateTime CriadoEm,
    DateTime AtualizadoEm,
    IReadOnlyList<ValorImpostoCustoDto> ValoresImposto
);

public record ValorImpostoCustoDto(
    int Id,
    int NcmVinculadoCustoId,
    decimal AliIi,
    decimal ValorIi,
    decimal AliIpi,
    decimal ValorIpi,
    decimal AliPis,
    decimal ValorPis,
    decimal AliCofins,
    decimal ValorCofins,
    decimal AliIcms,
    decimal ValorIcms,
    decimal TotalImpostos,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

// ── Requests de criação / edição ──────────────────────────────────────────────

public record CreateCustoDespachanteRequest(
    int? SolicitacaoOrcamentoId,
    int DespachanteId,
    int? ImportadorId,
    int PortoOrigemId,
    int PortoDestinoId,
    string Responsavel,
    string TamContainer,
    decimal Peso,
    decimal FobUsd,
    decimal FobReais,
    decimal CifUsd,
    decimal CifReais,
    decimal SeguroUsd,
    decimal FreteInternacionalUsd,
    decimal TaxaUsd,
    decimal ParametroUsd,
    decimal? TaxaUsdAgente,
    decimal? TotalGeralManual,
    string? Observacao,
    DateTime Data
);

public record UpdateCustoDespachanteRequest(
    int? ImportadorId,
    int PortoOrigemId,
    int PortoDestinoId,
    string Responsavel,
    string TamContainer,
    decimal Peso,
    decimal FobUsd,
    decimal FobReais,
    decimal CifUsd,
    decimal CifReais,
    decimal SeguroUsd,
    decimal FreteInternacionalUsd,
    decimal TaxaUsd,
    decimal ParametroUsd,
    decimal? TaxaUsdAgente,
    decimal? TotalGeralManual,
    string? Observacao,
    DateTime Data
);

// ── Requests filhos ───────────────────────────────────────────────────────────

public record UpsertCustoDespachanteLiRequest(
    string Ncm,
    string Descricao,
    decimal Valor,
    DateTime Data
);

public record UpsertCustoDespachanteDespesaRequest(
    string Descricao,
    decimal Valor,
    DateTime Data,
    bool EntraBaseIcms
);

public record UpsertNcmVinculadoCustoRequest(
    int? NcmId,
    string NumeroNcm,
    string Descricao,
    decimal AliIi,
    decimal AliIpi,
    decimal AliPis,
    decimal AliCofins,
    decimal AliIcms,
    decimal BaseCalculo
);

public record UpsertValorImpostoCustoRequest(
    decimal AliIi,
    decimal ValorIi,
    decimal AliIpi,
    decimal ValorIpi,
    decimal AliPis,
    decimal ValorPis,
    decimal AliCofins,
    decimal ValorCofins,
    decimal AliIcms,
    decimal ValorIcms,
    decimal TotalImpostos
);
