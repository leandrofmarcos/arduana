using FluentValidation;

namespace Comex133Api.Features.CustosDespachante;

public class CreateCustoDespachanteValidator : AbstractValidator<CreateCustoDespachanteRequest>
{
    public CreateCustoDespachanteValidator()
    {
        RuleFor(x => x.DespachanteId).GreaterThan(0);
        RuleFor(x => x.PortoOrigemId).GreaterThan(0);
        RuleFor(x => x.PortoDestinoId).GreaterThan(0);
        RuleFor(x => x.Responsavel).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TamContainer).NotEmpty().MaximumLength(3);
        RuleFor(x => x.Peso).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FobUsd).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FobReais).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CifUsd).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CifReais).GreaterThanOrEqualTo(0);
        RuleFor(x => x.SeguroUsd).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TaxaUsd).GreaterThanOrEqualTo(0).WithMessage("Taxa USD deve ser maior ou igual a zero.");
        RuleFor(x => x.Observacao).MaximumLength(1000).When(x => x.Observacao is not null);
        RuleFor(x => x.Data).NotEmpty();
    }
}

public class UpdateCustoDespachanteValidator : AbstractValidator<UpdateCustoDespachanteRequest>
{
    public UpdateCustoDespachanteValidator()
    {
        RuleFor(x => x.PortoOrigemId).GreaterThan(0);
        RuleFor(x => x.PortoDestinoId).GreaterThan(0);
        RuleFor(x => x.Responsavel).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TamContainer).NotEmpty().MaximumLength(3);
        RuleFor(x => x.Peso).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FobUsd).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FobReais).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CifUsd).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CifReais).GreaterThanOrEqualTo(0);
        RuleFor(x => x.SeguroUsd).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TaxaUsd).GreaterThanOrEqualTo(0).WithMessage("Taxa USD deve ser maior ou igual a zero.");
        RuleFor(x => x.Observacao).MaximumLength(1000).When(x => x.Observacao is not null);
        RuleFor(x => x.Data).NotEmpty();
    }
}

public class UpsertLiValidator : AbstractValidator<UpsertCustoDespachanteLiRequest>
{
    public UpsertLiValidator()
    {
        RuleFor(x => x.Ncm).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Descricao).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Valor).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Data).NotEmpty();
    }
}

public class UpsertDespesaValidator : AbstractValidator<UpsertCustoDespachanteDespesaRequest>
{
    public UpsertDespesaValidator()
    {
        RuleFor(x => x.Descricao).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Valor).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Data).NotEmpty();
    }
}

public class UpsertNcmValidator : AbstractValidator<UpsertNcmVinculadoCustoRequest>
{
    public UpsertNcmValidator()
    {
        RuleFor(x => x.NumeroNcm).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Descricao).NotEmpty().MaximumLength(500);
        RuleFor(x => x.BaseCalculo).GreaterThanOrEqualTo(0);
        RuleFor(x => x.AliIi).InclusiveBetween(0, 100);
        RuleFor(x => x.AliIpi).InclusiveBetween(0, 100);
        RuleFor(x => x.AliPis).InclusiveBetween(0, 100);
        RuleFor(x => x.AliCofins).InclusiveBetween(0, 100);
        RuleFor(x => x.AliIcms).InclusiveBetween(0, 100);
    }
}

public class UpsertValorImpostoValidator : AbstractValidator<UpsertValorImpostoCustoRequest>
{
    public UpsertValorImpostoValidator()
    {
        RuleFor(x => x.TotalImpostos).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ValorIi).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ValorIpi).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ValorPis).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ValorCofins).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ValorIcms).GreaterThanOrEqualTo(0);
    }
}
