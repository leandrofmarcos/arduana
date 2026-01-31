namespace ImportCostsApi.Features.Numerarios.Update;

using FluentValidation;

/// <summary>
/// Validator for UpdateNumerarioDto
/// </summary>
public class UpdateNumerarioValidator : AbstractValidator<UpdateNumerarioDto>
{
    public UpdateNumerarioValidator()
    {
        RuleFor(x => x.Valor)
            .GreaterThan(0).WithMessage("Valor deve ser maior que 0")
            .When(x => x.Valor.HasValue && x.Valor > 0);

        RuleFor(x => x.Moeda)
            .Length(1, 10).WithMessage("Moeda deve ter no máximo 10 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Moeda));

        RuleFor(x => x.Status)
            .Must(status => status == null || new[] { "Pendente", "Aprovado", "Cancelado" }.Contains(status))
            .WithMessage("Status deve ser Pendente, Aprovado ou Cancelado")
            .When(x => !string.IsNullOrEmpty(x.Status));

        RuleFor(x => x.Tipo)
            .Must(tipo => tipo == null || new[] { "Receita", "Despesa", "Ajuste", "Devolução" }.Contains(tipo))
            .WithMessage("Tipo deve ser Receita, Despesa, Ajuste ou Devolução")
            .When(x => !string.IsNullOrEmpty(x.Tipo));

        RuleFor(x => x.Observacao)
            .Length(1, 500).WithMessage("Observação deve ter no máximo 500 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Observacao));
    }
}
