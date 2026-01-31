namespace ImportCostsApi.Features.Orcamentos.TransicaoFase;

using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Features.Orcamentos;

/// <summary>
/// DTO para transição entre fases
/// </summary>
public class TransicaoFaseDto
{
    public FaseOrcamento NovaFase { get; set; }
}

/// <summary>
/// Handler para transicionar entre fases do orçamento
/// Valida se fase anterior está concluída (sequencial obrigatório)
/// </summary>
public class TransicaoFaseHandler
{
    private readonly OrcamentoRepository _repository;
    private readonly ILogger<TransicaoFaseHandler> _logger;

    public TransicaoFaseHandler(OrcamentoRepository repository, ILogger<TransicaoFaseHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<OrcamentoResponseDto> HandleAsync(string id, TransicaoFaseDto dto)
    {
        _logger.LogInformation("Transicionando orçamento {OrcamentoId} para fase {NovaFase}", id, dto.NovaFase);

        var orcamento = await _repository.TransicionarFaseAsync(id, dto.NovaFase);

        return MapToDto(orcamento);
    }

    private OrcamentoResponseDto MapToDto(OrcamentoLancamento orcamento)
    {
        return new OrcamentoResponseDto
        {
            Id = orcamento.Id,
            Numero = orcamento.Numero,
            Titulo = orcamento.Titulo,
            ClienteId = orcamento.ClienteId,
            DespachanteId = orcamento.DespachanteId,
            TemplatePacklistId = orcamento.TemplatePacklistId,
            FaseAtual = orcamento.FaseAtual,
            StatusFases = orcamento.StatusFases,
            Aprovado = orcamento.Aprovado,
            AprovadoCliente = orcamento.AprovadoCliente,
            Oficializado = orcamento.Oficializado,
            MoedaPadrao = orcamento.MoedaPadrao,
            DataCriacao = orcamento.DataCriacao,
            DataAtualizacao = orcamento.DataAtualizacao,
            Resumo = orcamento.Resumo
        };
    }
}
