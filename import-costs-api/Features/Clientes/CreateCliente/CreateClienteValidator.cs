using FluentValidation;

namespace ImportCostsApi.Features.Clientes.CreateCliente;

/// <summary>
/// Validador para criação de cliente
/// </summary>
public class CreateClienteValidator : AbstractValidator<CreateClienteDto>
{
    public CreateClienteValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome do cliente é obrigatório")
            .MaximumLength(200).WithMessage("Nome não pode exceder 200 caracteres");

        RuleFor(x => x.Contato)
            .NotEmpty().WithMessage("Contato é obrigatório")
            .MaximumLength(150).WithMessage("Contato não pode exceder 150 caracteres");

        RuleFor(x => x.TemplatePacklistId)
            .MaximumLength(36).WithMessage("ID do template não pode exceder 36 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.TemplatePacklistId));
    }
}
