using FluentValidation;

namespace Comex133Api.Features.Ncms;

public class CreateNcmValidator : AbstractValidator<CreateNcmRequest>
{
    public CreateNcmValidator()
    {
        RuleFor(x => x.CodigoNcm)
            .NotEmpty().WithMessage("Código NCM é obrigatório.")
            .Matches(@"^\d{8}$").WithMessage("Código NCM deve conter exatamente 8 dígitos numéricos.");

        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descrição é obrigatória.")
            .MaximumLength(500).WithMessage("Descrição deve ter no máximo 500 caracteres.");

        RuleFor(x => x.AliqII).InclusiveBetween(0, 999.99m).WithMessage("Alíquota II deve estar entre 0 e 999,99.");
        RuleFor(x => x.AliqIPI).InclusiveBetween(0, 999.99m).WithMessage("Alíquota IPI deve estar entre 0 e 999,99.");
        RuleFor(x => x.AliqPIS).InclusiveBetween(0, 999.99m).WithMessage("Alíquota PIS deve estar entre 0 e 999,99.");
        RuleFor(x => x.AliqCOFINS).InclusiveBetween(0, 999.99m).WithMessage("Alíquota COFINS deve estar entre 0 e 999,99.");
        RuleFor(x => x.AliqICMS).InclusiveBetween(0, 999.99m).WithMessage("Alíquota ICMS deve estar entre 0 e 999,99.");
    }
}

public class UpdateNcmValidator : AbstractValidator<UpdateNcmRequest>
{
    public UpdateNcmValidator()
    {
        RuleFor(x => x.CodigoNcm)
            .NotEmpty().WithMessage("Código NCM é obrigatório.")
            .Matches(@"^\d{8}$").WithMessage("Código NCM deve conter exatamente 8 dígitos numéricos.");

        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descrição é obrigatória.")
            .MaximumLength(500).WithMessage("Descrição deve ter no máximo 500 caracteres.");

        RuleFor(x => x.AliqII).InclusiveBetween(0, 999.99m).WithMessage("Alíquota II deve estar entre 0 e 999,99.");
        RuleFor(x => x.AliqIPI).InclusiveBetween(0, 999.99m).WithMessage("Alíquota IPI deve estar entre 0 e 999,99.");
        RuleFor(x => x.AliqPIS).InclusiveBetween(0, 999.99m).WithMessage("Alíquota PIS deve estar entre 0 e 999,99.");
        RuleFor(x => x.AliqCOFINS).InclusiveBetween(0, 999.99m).WithMessage("Alíquota COFINS deve estar entre 0 e 999,99.");
        RuleFor(x => x.AliqICMS).InclusiveBetween(0, 999.99m).WithMessage("Alíquota ICMS deve estar entre 0 e 999,99.");
    }
}
