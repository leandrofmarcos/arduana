using FluentValidation;

namespace Comex133Api.Features.Usuarios;

public class CreateUsuarioRequestValidator : AbstractValidator<CreateUsuarioRequest>
{
    public CreateUsuarioRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail é obrigatório.")
            .EmailAddress().WithMessage("E-mail inválido.")
            .MaximumLength(150).WithMessage("E-mail deve ter no máximo 150 caracteres.");

        RuleFor(x => x.NomeCompleto)
            .NotEmpty().WithMessage("Nome completo é obrigatório.")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Senha)
            .NotEmpty().WithMessage("Senha é obrigatória.")
            .MinimumLength(8).WithMessage("Senha deve ter ao menos 8 caracteres.")
            .Matches(@"[A-Z]").WithMessage("Senha deve conter ao menos uma letra maiúscula.")
            .Matches(@"[a-z]").WithMessage("Senha deve conter ao menos uma letra minúscula.")
            .Matches(@"[0-9]").WithMessage("Senha deve conter ao menos um número.")
            .Matches(@"[^a-zA-Z0-9]").WithMessage("Senha deve conter ao menos um caractere especial.");
    }
}

public class UpdateUsuarioRequestValidator : AbstractValidator<UpdateUsuarioRequest>
{
    public UpdateUsuarioRequestValidator()
    {
        RuleFor(x => x.NomeCompleto)
            .NotEmpty().WithMessage("Nome completo é obrigatório.")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres.");
    }
}

public class AlterarSenhaRequestValidator : AbstractValidator<AlterarSenhaRequest>
{
    public AlterarSenhaRequestValidator()
    {
        RuleFor(x => x.SenhaAtual)
            .NotEmpty().WithMessage("Senha atual é obrigatória.");

        RuleFor(x => x.NovaSenha)
            .NotEmpty().WithMessage("Nova senha é obrigatória.")
            .MinimumLength(8).WithMessage("Nova senha deve ter ao menos 8 caracteres.")
            .Matches(@"[A-Z]").WithMessage("Nova senha deve conter ao menos uma letra maiúscula.")
            .Matches(@"[a-z]").WithMessage("Nova senha deve conter ao menos uma letra minúscula.")
            .Matches(@"[0-9]").WithMessage("Nova senha deve conter ao menos um número.")
            .Matches(@"[^a-zA-Z0-9]").WithMessage("Nova senha deve conter ao menos um caractere especial.");
    }
}
