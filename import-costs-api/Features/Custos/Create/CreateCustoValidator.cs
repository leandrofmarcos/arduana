namespace ImportCostsApi.Features.Custos.Create;

using FluentValidation;

/// <summary>
/// Validator for CreateCustoDto
/// </summary>
public class CreateCustoValidator : AbstractValidator<CreateCustoDto>
{
    public CreateCustoValidator()
    {
        RuleFor(x => x.OrcamentoId)
            .NotEmpty().WithMessage("OrcamentoId é obrigatório")
            .Length(1, 50).WithMessage("OrcamentoId deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("Código é obrigatório")
            .Length(1, 50).WithMessage("Código deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.Cliente)
            .NotEmpty().WithMessage("Cliente é obrigatório")
            .Length(1, 100).WithMessage("Cliente deve ter entre 1 e 100 caracteres");

        RuleFor(x => x.Despachante)
            .NotEmpty().WithMessage("Despachante é obrigatório")
            .Length(1, 100).WithMessage("Despachante deve ter entre 1 e 100 caracteres");

        RuleFor(x => x.Premissas)
            .NotEmpty().WithMessage("Premissas comerciais são obrigatórias");

        RuleFor(x => x.Taxas)
            .Must(taxas => ValidateTaxaValues(taxas))
            .WithMessage("Todas as alíquotas devem estar entre 0 e 100");

        RuleForEach(x => x.Despesas)
            .SetValidator(new CreateDespesaValidator());
    }

    private bool ValidateTaxaValues(Dictionary<string, decimal> taxas)
    {
        if (taxas == null) return true;
        return taxas.Values.All(v => v >= 0 && v <= 100);
    }
}

/// <summary>
/// Validator for CreateDespesaDto
/// </summary>
public class CreateDespesaValidator : AbstractValidator<CreateDespesaDto>
{
    public CreateDespesaValidator()
    {
        RuleFor(x => x.Categoria)
            .NotEmpty().WithMessage("Categoria é obrigatória")
            .Length(1, 50).WithMessage("Categoria deve ter entre 1 e 50 caracteres");

        RuleFor(x => x.Item)
            .NotEmpty().WithMessage("Item é obrigatório")
            .Length(1, 100).WithMessage("Item deve ter entre 1 e 100 caracteres");

        RuleFor(x => x.Fornecedor)
            .NotEmpty().WithMessage("Fornecedor é obrigatório")
            .Length(1, 100).WithMessage("Fornecedor deve ter entre 1 e 100 caracteres");

        RuleFor(x => x.Valor)
            .GreaterThan(0).WithMessage("Valor deve ser maior que 0");
    }
}
