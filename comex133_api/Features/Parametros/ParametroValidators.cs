using FluentValidation;

namespace Comex133Api.Features.Parametros;

public class CreateParametroValidator : AbstractValidator<CreateParametroRequest>
{
    public CreateParametroValidator()
    {
        RuleFor(x => x.Chave)
            .NotEmpty().WithMessage("Chave é obrigatória.")
            .MaximumLength(100).WithMessage("Chave deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Valor)
            .NotEmpty().WithMessage("Valor é obrigatório.")
            .MaximumLength(500).WithMessage("Valor deve ter no máximo 500 caracteres.");

        RuleFor(x => x.Descricao)
            .MaximumLength(250).WithMessage("Descrição deve ter no máximo 250 caracteres.")
            .When(x => x.Descricao is not null);
    }
}

public class UpdateParametroValidator : AbstractValidator<UpdateParametroRequest>
{
    public UpdateParametroValidator()
    {
        RuleFor(x => x.Chave)
            .NotEmpty().WithMessage("Chave é obrigatória.")
            .MaximumLength(100).WithMessage("Chave deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Valor)
            .NotEmpty().WithMessage("Valor é obrigatório.")
            .MaximumLength(500).WithMessage("Valor deve ter no máximo 500 caracteres.");

        RuleFor(x => x.Descricao)
            .MaximumLength(250).WithMessage("Descrição deve ter no máximo 250 caracteres.")
            .When(x => x.Descricao is not null);
    }
}
