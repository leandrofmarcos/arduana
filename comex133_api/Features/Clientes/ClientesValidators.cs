using FluentValidation;

namespace Comex133Api.Features.Clientes;

public class CreateClienteValidator : AbstractValidator<CreateClienteRequest>
{
    public CreateClienteValidator()
    {
        RuleFor(x => x.RazaoSocial)
            .NotEmpty().WithMessage("Razão Social é obrigatória.")
            .MaximumLength(200).WithMessage("Razão Social deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Cnpj)
            .MaximumLength(20).WithMessage("CNPJ deve ter no máximo 20 caracteres.")
            .When(x => x.Cnpj is not null);

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("E-mail inválido.")
            .MaximumLength(150).WithMessage("E-mail deve ter no máximo 150 caracteres.")
            .When(x => x.Email is not null);

        RuleFor(x => x.Telefone)
            .MaximumLength(30).WithMessage("Telefone deve ter no máximo 30 caracteres.")
            .When(x => x.Telefone is not null);
    }
}

public class UpdateClienteValidator : AbstractValidator<UpdateClienteRequest>
{
    public UpdateClienteValidator()
    {
        RuleFor(x => x.RazaoSocial)
            .NotEmpty().WithMessage("Razão Social é obrigatória.")
            .MaximumLength(200).WithMessage("Razão Social deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Cnpj)
            .MaximumLength(20).WithMessage("CNPJ deve ter no máximo 20 caracteres.")
            .When(x => x.Cnpj is not null);

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("E-mail inválido.")
            .MaximumLength(150).WithMessage("E-mail deve ter no máximo 150 caracteres.")
            .When(x => x.Email is not null);

        RuleFor(x => x.Telefone)
            .MaximumLength(30).WithMessage("Telefone deve ter no máximo 30 caracteres.")
            .When(x => x.Telefone is not null);
    }
}
