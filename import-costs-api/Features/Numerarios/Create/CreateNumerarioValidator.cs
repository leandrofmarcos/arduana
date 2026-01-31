namespace ImportCostsApi.Features.Numerarios.Create;

using FluentValidation;

/// <summary>
/// Validator for CreateNumerarioDto
/// </summary>
public class CreateNumerarioValidator : AbstractValidator<CreateNumerarioDto>
{
    public CreateNumerarioValidator()
    {
        RuleFor(x => x.OrcamentoId)
            .NotEmpty().WithMessage("OrcamentoId é obrigatório")
            .Length(1, 50).WithMessage("OrcamentoId deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.Valor)
            .NotEmpty().WithMessage("Valor é obrigatório")
            .GreaterThan(0).WithMessage("Valor deve ser maior que 0");

        RuleFor(x => x.Moeda)
            .Length(1, 10).WithMessage("Moeda deve ter no máximo 10 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Moeda));

        RuleFor(x => x.Tipo)
            .Must(tipo => tipo == null || new[] { "Receita", "Despesa", "Ajuste", "Devolução" }.Contains(tipo))
            .WithMessage("Tipo deve ser Receita, Despesa, Ajuste ou Devolução")
            .When(x => !string.IsNullOrEmpty(x.Tipo));

        RuleFor(x => x.Observacao)
            .Length(1, 500).WithMessage("Observação deve ter no máximo 500 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Observacao));
    }
}
