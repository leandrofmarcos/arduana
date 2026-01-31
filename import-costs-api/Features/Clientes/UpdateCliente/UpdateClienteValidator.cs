using FluentValidation;

namespace ImportCostsApi.Features.Clientes.UpdateCliente;

/// <summary>
/// Validador para atualização de cliente
/// </summary>
public class UpdateClienteValidator : AbstractValidator<UpdateClienteDto>
{
    public UpdateClienteValidator()
    {
        RuleFor(x => x.Nome)
            .MaximumLength(200).WithMessage("Nome não pode exceder 200 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Nome));

        RuleFor(x => x.Contato)
            .MaximumLength(150).WithMessage("Contato não pode exceder 150 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Contato));

        RuleFor(x => x.TemplatePacklistId)
            .MaximumLength(36).WithMessage("ID do template não pode exceder 36 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.TemplatePacklistId));
    }
}
