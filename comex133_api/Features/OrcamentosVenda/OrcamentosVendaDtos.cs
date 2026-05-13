namespace Comex133Api.Features.OrcamentosVenda;

// ── Retorno lista ─────────────────────────────────────────────────────────────

public record OrcamentoVendaListDto(
    int Id,
    string CodigoInterno,
    int? ClienteId,
    int? SolicitacaoOrcamentoId,
    DateTime Data,
    string TamContainer,
    decimal PesoBruto,
    decimal PesoLiquido,
    decimal TotalGeral,
    string Status,
    int Versao,
    int? VersaoAnteriorId,
    bool Imutavel,
    int? CustoInternoId,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

// ── Retorno detalhe ───────────────────────────────────────────────────────────

public record OrcamentoVendaDto(
    int Id,
    string CodigoInterno,
    int? ClienteId,
    int? SolicitacaoOrcamentoId,
    DateTime Data,
    string TamContainer,
    decimal PesoBruto,
    decimal PesoLiquido,
    decimal FreteInternacional,
    decimal CifReais,
    decimal CifUsd,
    decimal FobReais,
    decimal FobUsd,
    decimal TaxaUsd,
    decimal Honorarios,
    decimal TotalImpostos,
    decimal TotalDespesas,
    decimal TotalExtras,
    decimal TotalGeral,
    string? Observacao,
    string Status,
    int Versao,
    int? VersaoAnteriorId,
    bool Imutavel,
    int? CustoInternoId,
    string? CustoInternoCodigoInterno,
    DateTime CriadoEm,
    DateTime AtualizadoEm,
    IReadOnlyList<OrcamentoVendaDespesaDto> Despesas,
    IReadOnlyList<OrcamentoVendaDespesaDto> Extras,
    IReadOnlyList<OrcamentoVendaCustoDto>   Custos
);

// ── Filhos ────────────────────────────────────────────────────────────────────

public record OrcamentoVendaDespesaDto(
    int Id,
    int OrcamentoVendaId,
    string Descricao,
    decimal Valor,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record OrcamentoVendaCustoDto(
    int Id,
    int OrcamentoVendaId,
    int CustoDespachanteId,
    string CustoCodigoInterno,
    string CustoStatus,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

// ── Requests criação / edição ─────────────────────────────────────────────────

public record CreateOrcamentoVendaRequest(
    int? ClienteId,
    int? SolicitacaoOrcamentoId,
    DateTime Data,
    string TamContainer,
    decimal PesoBruto,
    decimal PesoLiquido,
    decimal FreteInternacional,
    decimal CifReais,
    decimal CifUsd,
    decimal FobReais,
    decimal FobUsd,
    decimal TaxaUsd,
    decimal Honorarios,
    decimal TotalImpostos,
    decimal TotalDespesas,
    decimal TotalExtras,
    decimal TotalGeral,
    string? Observacao
);

public record UpdateOrcamentoVendaRequest(
    int? ClienteId,
    DateTime Data,
    string TamContainer,
    decimal PesoBruto,
    decimal PesoLiquido,
    decimal FreteInternacional,
    decimal CifReais,
    decimal CifUsd,
    decimal FobReais,
    decimal FobUsd,
    decimal TaxaUsd,
    decimal Honorarios,
    decimal TotalImpostos,
    decimal TotalDespesas,
    decimal TotalExtras,
    decimal TotalGeral,
    string? Observacao
);

// ── Requests filhos ───────────────────────────────────────────────────────────

public record UpsertOrcamentoVendaDespesaRequest(
    string Descricao,
    decimal Valor
);

public record VincularCustoRequest(int CustoDespachanteId);

/// <summary>Solicita reabertura (nova versão) de um CustoDespachante vinculado.</summary>
public record SolicitarReaberturaRequest(string Motivo);

/// <summary>Define o custo interno alternativo da OV (pós-aprovação, sem nova versão ao cliente).</summary>
public record SetCustoInternoRequest(int? CustoDespachanteId);
