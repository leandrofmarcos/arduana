using FluentValidation;

namespace Comex133Api.Features.PortosOrigem;

public class CreatePortoOrigemValidator : AbstractValidator<CreatePortoOrigemRequest>
{
    public CreatePortoOrigemValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(150).WithMessage("Nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("Código é obrigatório.")
            .MaximumLength(10).WithMessage("Código deve ter no máximo 10 caracteres.");

        RuleFor(x => x.Pais)
            .NotEmpty().WithMessage("País é obrigatório.")
            .MaximumLength(100).WithMessage("País deve ter no máximo 100 caracteres.");
    }
}

public class UpdatePortoOrigemValidator : AbstractValidator<UpdatePortoOrigemRequest>
{
    public UpdatePortoOrigemValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(150).WithMessage("Nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("Código é obrigatório.")
            .MaximumLength(10).WithMessage("Código deve ter no máximo 10 caracteres.");

        RuleFor(x => x.Pais)
            .NotEmpty().WithMessage("País é obrigatório.")
            .MaximumLength(100).WithMessage("País deve ter no máximo 100 caracteres.");
    }
}
