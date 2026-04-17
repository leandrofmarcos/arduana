using FluentValidation;

namespace Comex133Api.Features.Despachantes;

public class CreateDespachantValidator : AbstractValidator<CreateDespachantRequest>
{
    public CreateDespachantValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Crn)
            .MaximumLength(30).WithMessage("CRN deve ter no máximo 30 caracteres.")
            .When(x => x.Crn is not null);

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("E-mail inválido.")
            .MaximumLength(150).WithMessage("E-mail deve ter no máximo 150 caracteres.")
            .When(x => x.Email is not null);

        RuleFor(x => x.Telefone)
            .MaximumLength(30).WithMessage("Telefone deve ter no máximo 30 caracteres.")
            .When(x => x.Telefone is not null);
    }
}

public class UpdateDespachantValidator : AbstractValidator<UpdateDespachantRequest>
{
    public UpdateDespachantValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Crn)
            .MaximumLength(30).WithMessage("CRN deve ter no máximo 30 caracteres.")
            .When(x => x.Crn is not null);

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("E-mail inválido.")
            .MaximumLength(150).WithMessage("E-mail deve ter no máximo 150 caracteres.")
            .When(x => x.Email is not null);

        RuleFor(x => x.Telefone)
            .MaximumLength(30).WithMessage("Telefone deve ter no máximo 30 caracteres.")
            .When(x => x.Telefone is not null);
    }
}
