using FluentValidation;

namespace Comex133Api.Features.ListaPrecoLcl;

public class CreateListaPrecoLclValidator : AbstractValidator<CreateListaPrecoLclRequest>
{
    public CreateListaPrecoLclValidator()
    {
        RuleFor(x => x.Categoria)
            .NotEmpty().WithMessage("Categoria é obrigatória.")
            .MaximumLength(150).WithMessage("Categoria deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descrição é obrigatória.")
            .MaximumLength(500).WithMessage("Descrição deve ter no máximo 500 caracteres.");

        RuleFor(x => x.NomeChines)
            .MaximumLength(500).WithMessage("Nome chinês deve ter no máximo 500 caracteres.")
            .When(x => x.NomeChines is not null);

        RuleFor(x => x.PrecoUsdPorCbm)
            .GreaterThanOrEqualTo(0).WithMessage("Preço USD/CBM deve ser maior ou igual a 0.");

        RuleFor(x => x.PrecoUsdPorKg)
            .GreaterThanOrEqualTo(0).WithMessage("Preço USD/KG deve ser maior ou igual a 0.");

        RuleFor(x => x.DataVigencia)
            .NotEmpty().WithMessage("Data de vigência é obrigatória.");
    }
}

public class UpdateListaPrecoLclValidator : AbstractValidator<UpdateListaPrecoLclRequest>
{
    public UpdateListaPrecoLclValidator()
    {
        RuleFor(x => x.Categoria)
            .NotEmpty().WithMessage("Categoria é obrigatória.")
            .MaximumLength(150).WithMessage("Categoria deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descrição é obrigatória.")
            .MaximumLength(500).WithMessage("Descrição deve ter no máximo 500 caracteres.");

        RuleFor(x => x.NomeChines)
            .MaximumLength(500).WithMessage("Nome chinês deve ter no máximo 500 caracteres.")
            .When(x => x.NomeChines is not null);

        RuleFor(x => x.PrecoUsdPorCbm)
            .GreaterThanOrEqualTo(0).WithMessage("Preço USD/CBM deve ser maior ou igual a 0.");

        RuleFor(x => x.PrecoUsdPorKg)
            .GreaterThanOrEqualTo(0).WithMessage("Preço USD/KG deve ser maior ou igual a 0.");

        RuleFor(x => x.DataVigencia)
            .NotEmpty().WithMessage("Data de vigência é obrigatória.");
    }
}
