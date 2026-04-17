using FluentValidation;

namespace Comex133Api.Features.Fabricantes;

public class CreateFabricanteValidator : AbstractValidator<CreateFabricanteRequest>
{
    public CreateFabricanteValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Pais)
            .NotEmpty().WithMessage("País é obrigatório.")
            .MaximumLength(100).WithMessage("País deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Cidade)
            .MaximumLength(150).WithMessage("Cidade deve ter no máximo 150 caracteres.")
            .When(x => x.Cidade is not null);

        RuleFor(x => x.Contato)
            .MaximumLength(200).WithMessage("Contato deve ter no máximo 200 caracteres.")
            .When(x => x.Contato is not null);
    }
}

public class UpdateFabricanteValidator : AbstractValidator<UpdateFabricanteRequest>
{
    public UpdateFabricanteValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Pais)
            .NotEmpty().WithMessage("País é obrigatório.")
            .MaximumLength(100).WithMessage("País deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Cidade)
            .MaximumLength(150).WithMessage("Cidade deve ter no máximo 150 caracteres.")
            .When(x => x.Cidade is not null);

        RuleFor(x => x.Contato)
            .MaximumLength(200).WithMessage("Contato deve ter no máximo 200 caracteres.")
            .When(x => x.Contato is not null);
    }
}
