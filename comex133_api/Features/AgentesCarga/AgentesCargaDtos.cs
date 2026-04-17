namespace Comex133Api.Features.AgentesCarga;

public record AgenteCargaDto(
    int Id,
    string Nome,
    string? Documento,
    string Pais,
    string? Contato,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm
);

public record CreateAgenteCargaRequest(
    string Nome,
    string? Documento,
    string Pais,
    string? Contato
);

public record UpdateAgenteCargaRequest(
    string Nome,
    string? Documento,
    string Pais,
    string? Contato
);

public record AtivoRequest(bool Ativo);
