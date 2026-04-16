using FluentValidation;

namespace Comex133Api.Features.Roles;

public class CreateRoleRequestValidator : AbstractValidator<CreateRoleRequest>
{
    public CreateRoleRequestValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(50).WithMessage("Nome deve ter no máximo 50 caracteres.");

        RuleFor(x => x.Descricao)
            .MaximumLength(200).WithMessage("Descrição deve ter no máximo 200 caracteres.")
            .When(x => x.Descricao != null);
    }
}

public class UpdateRoleRequestValidator : AbstractValidator<UpdateRoleRequest>
{
    public UpdateRoleRequestValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(50).WithMessage("Nome deve ter no máximo 50 caracteres.");

        RuleFor(x => x.Descricao)
            .MaximumLength(200).WithMessage("Descrição deve ter no máximo 200 caracteres.")
            .When(x => x.Descricao != null);
    }
}
