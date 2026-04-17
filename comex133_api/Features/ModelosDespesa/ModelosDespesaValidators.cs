using FluentValidation;

namespace Comex133Api.Features.ModelosDespesa;

public class CreateModeloDespesaValidator : AbstractValidator<CreateModeloDespesaRequest>
{
    public CreateModeloDespesaValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(150).WithMessage("Nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Descricao)
            .MaximumLength(500).WithMessage("Descrição deve ter no máximo 500 caracteres.")
            .When(x => x.Descricao is not null);
    }
}

public class UpdateModeloDespesaValidator : AbstractValidator<UpdateModeloDespesaRequest>
{
    public UpdateModeloDespesaValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(150).WithMessage("Nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Descricao)
            .MaximumLength(500).WithMessage("Descrição deve ter no máximo 500 caracteres.")
            .When(x => x.Descricao is not null);
    }
}
