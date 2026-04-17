using FluentValidation;

namespace Comex133Api.Features.DespesasCatalogo;

public class CreateDespesaCatalogoValidator : AbstractValidator<CreateDespesaCatalogoRequest>
{
    public CreateDespesaCatalogoValidator()
    {
        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descrição é obrigatória.")
            .MaximumLength(300).WithMessage("Descrição deve ter no máximo 300 caracteres.");

        RuleFor(x => x.Valor)
            .GreaterThanOrEqualTo(0).WithMessage("Valor deve ser maior ou igual a 0.");

        RuleFor(x => x.Categoria)
            .NotEmpty().WithMessage("Categoria é obrigatória.")
            .Must(c => CategoriaDespesa.Todos.Contains(c))
            .WithMessage($"Categoria inválida. Valores permitidos: {string.Join(", ", CategoriaDespesa.Todos)}.");
    }
}

public class UpdateDespesaCatalogoValidator : AbstractValidator<UpdateDespesaCatalogoRequest>
{
    public UpdateDespesaCatalogoValidator()
    {
        RuleFor(x => x.Descricao)
            .NotEmpty().WithMessage("Descrição é obrigatória.")
            .MaximumLength(300).WithMessage("Descrição deve ter no máximo 300 caracteres.");

        RuleFor(x => x.Valor)
            .GreaterThanOrEqualTo(0).WithMessage("Valor deve ser maior ou igual a 0.");

        RuleFor(x => x.Categoria)
            .NotEmpty().WithMessage("Categoria é obrigatória.")
            .Must(c => CategoriaDespesa.Todos.Contains(c))
            .WithMessage($"Categoria inválida. Valores permitidos: {string.Join(", ", CategoriaDespesa.Todos)}.");
    }
}
