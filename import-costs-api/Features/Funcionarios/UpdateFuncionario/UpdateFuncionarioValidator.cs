using FluentValidation;

namespace ImportCostsApi.Features.Funcionarios.UpdateFuncionario;

/// <summary>
/// Validador para atualização de funcionário
/// </summary>
public class UpdateFuncionarioValidator : AbstractValidator<UpdateFuncionarioDto>
{
    public UpdateFuncionarioValidator()
    {
        RuleFor(x => x.NomeCompleto)
            .NotEmpty().WithMessage("Nome completo é obrigatório")
            .MaximumLength(200).WithMessage("Nome completo não pode exceder 200 caracteres");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username é obrigatório")
            .MinimumLength(3).WithMessage("Username deve ter no mínimo 3 caracteres")
            .MaximumLength(50).WithMessage("Username não pode exceder 50 caracteres")
            .Matches(@"^[a-zA-Z0-9._-]+$").WithMessage("Username pode conter apenas letras, números, ponto, hífen e underscore");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Email inválido")
            .MaximumLength(150).WithMessage("Email não pode exceder 150 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.ContatoWhatsApp)
            .MaximumLength(50).WithMessage("Contato WhatsApp não pode exceder 50 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.ContatoWhatsApp));

        RuleFor(x => x.ContatoWeChat)
            .MaximumLength(50).WithMessage("Contato WeChat não pode exceder 50 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.ContatoWeChat));

        RuleFor(x => x.Setor)
            .MaximumLength(100).WithMessage("Setor não pode exceder 100 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Setor));

        RuleFor(x => x.Cargo)
            .MaximumLength(100).WithMessage("Cargo não pode exceder 100 caracteres")
            .When(x => !string.IsNullOrWhiteSpace(x.Cargo));
    }
}
