using FluentValidation;

namespace Comex133Api.Features.Packlist;

public class SaveMapeamentoRequestValidator : AbstractValidator<SaveMapeamentoRequest>
{
    public SaveMapeamentoRequestValidator()
    {
        RuleFor(x => x.ColunaNCM)
            .MaximumLength(100).WithMessage("Nome da coluna NCM deve ter no máximo 100 caracteres.")
            .When(x => x.ColunaNCM is not null);

        RuleFor(x => x.ColunaDescricao)
            .MaximumLength(100).WithMessage("Nome da coluna Descrição deve ter no máximo 100 caracteres.")
            .When(x => x.ColunaDescricao is not null);

        RuleFor(x => x.ColunaPreco)
            .MaximumLength(100).WithMessage("Nome da coluna Preço deve ter no máximo 100 caracteres.")
            .When(x => x.ColunaPreco is not null);
    }
}
