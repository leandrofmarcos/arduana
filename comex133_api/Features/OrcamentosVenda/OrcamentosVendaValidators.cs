using FluentValidation;

namespace Comex133Api.Features.OrcamentosVenda;

public class CreateOrcamentoVendaValidator : AbstractValidator<CreateOrcamentoVendaRequest>
{
    public CreateOrcamentoVendaValidator()
    {
        RuleFor(x => x.Data).NotEmpty();
        RuleFor(x => x.TamContainer).NotEmpty().MaximumLength(3);
        RuleFor(x => x.PesoBruto).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PesoLiquido).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TaxaUsd).GreaterThan(0).WithMessage("Taxa USD deve ser maior que zero.");
        RuleFor(x => x.Honorarios).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalImpostos).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalDespesas).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalExtras).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalGeral).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Observacao).MaximumLength(1000).When(x => x.Observacao is not null);
    }
}

public class UpdateOrcamentoVendaValidator : AbstractValidator<UpdateOrcamentoVendaRequest>
{
    public UpdateOrcamentoVendaValidator()
    {
        RuleFor(x => x.Data).NotEmpty();
        RuleFor(x => x.TamContainer).NotEmpty().MaximumLength(3);
        RuleFor(x => x.PesoBruto).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PesoLiquido).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TaxaUsd).GreaterThan(0).WithMessage("Taxa USD deve ser maior que zero.");
        RuleFor(x => x.Honorarios).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalImpostos).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalDespesas).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalExtras).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalGeral).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Observacao).MaximumLength(1000).When(x => x.Observacao is not null);
    }
}

public class UpsertOrcamentoVendaDespesaValidator : AbstractValidator<UpsertOrcamentoVendaDespesaRequest>
{
    public UpsertOrcamentoVendaDespesaValidator()
    {
        RuleFor(x => x.Descricao).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Valor).GreaterThanOrEqualTo(0);
    }
}

public class SolicitarReaberturaValidator : AbstractValidator<SolicitarReaberturaRequest>
{
    public SolicitarReaberturaValidator()
    {
        RuleFor(x => x.Motivo).MaximumLength(1000).When(x => x.Motivo is not null);
    }
}
