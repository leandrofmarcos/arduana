namespace ImportCostsApi.Features.Orcamentos.Create;

using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Features.Orcamentos;

/// <summary>
/// Handler para criar novo orçamento
/// Requer cliente existente
/// </summary>
public class CreateOrcamentoHandler
{
    private readonly OrcamentoRepository _repository;
    private readonly ILogger<CreateOrcamentoHandler> _logger;

    public CreateOrcamentoHandler(OrcamentoRepository repository, ILogger<CreateOrcamentoHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<OrcamentoResponseDto> HandleAsync(CreateOrcamentoDto dto)
    {
        _logger.LogInformation("Criando novo orçamento para cliente {ClienteId}", dto.ClienteId);

        var orcamento = new OrcamentoLancamento
        {
            Numero = dto.Numero,
            Titulo = dto.Titulo,
            ClienteId = dto.ClienteId,
            DespachanteId = dto.DespachanteId,
            TemplatePacklistId = dto.TemplatePacklistId,
            MoedaPadrao = dto.MoedaPadrao ?? "BRL"
        };

        var criado = await _repository.CreateAsync(orcamento);

        return MapToDto(criado);
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
