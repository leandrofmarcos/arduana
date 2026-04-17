using FluentValidation;

namespace Comex133Api.Features.ControleNavios;

public class CreateControleNavioValidator : AbstractValidator<CreateControleNavioRequest>
{
    public CreateControleNavioValidator()
    {
        RuleFor(x => x.NumeroViagem)
            .NotEmpty().WithMessage("Número da viagem é obrigatório.")
            .MaximumLength(50).WithMessage("Número da viagem deve ter no máximo 50 caracteres.");

        RuleFor(x => x.NomeNavio)
            .NotEmpty().WithMessage("Nome do navio é obrigatório.")
            .MaximumLength(150).WithMessage("Nome do navio deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Observacao)
            .MaximumLength(500).WithMessage("Observação deve ter no máximo 500 caracteres.")
            .When(x => x.Observacao is not null);
    }
}

public class UpdateControleNavioValidator : AbstractValidator<UpdateControleNavioRequest>
{
    public UpdateControleNavioValidator()
    {
        RuleFor(x => x.NumeroViagem)
            .NotEmpty().WithMessage("Número da viagem é obrigatório.")
            .MaximumLength(50).WithMessage("Número da viagem deve ter no máximo 50 caracteres.");

        RuleFor(x => x.NomeNavio)
            .NotEmpty().WithMessage("Nome do navio é obrigatório.")
            .MaximumLength(150).WithMessage("Nome do navio deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Observacao)
            .MaximumLength(500).WithMessage("Observação deve ter no máximo 500 caracteres.")
            .When(x => x.Observacao is not null);
    }
}

public class UpsertControleNavioTrajetoValidator : AbstractValidator<UpsertControleNavioTrajetoRequest>
{
    public UpsertControleNavioTrajetoValidator()
    {
        RuleFor(x => x.PortoOrigemId)
            .GreaterThan(0).WithMessage("Porto de origem é obrigatório.");

        RuleFor(x => x.PortoDestinoId)
            .GreaterThan(0).WithMessage("Porto de destino é obrigatório.")
            .NotEqual(x => x.PortoOrigemId).WithMessage("Porto de destino deve ser diferente do porto de origem.");

        RuleFor(x => x.Etd)
            .NotEmpty().WithMessage("ETD é obrigatório.")
            .Must(BeValidDate).WithMessage("ETD deve ser uma data válida.");

        RuleFor(x => x.Eta)
            .NotEmpty().WithMessage("ETA é obrigatório.")
            .Must(BeValidDate).WithMessage("ETA deve ser uma data válida.")
            .Must((req, eta) => !BeValidDate(req.Etd) || !BeValidDate(eta) || DateTime.Parse(eta) >= DateTime.Parse(req.Etd))
            .WithMessage("ETA deve ser maior ou igual ao ETD.");

        RuleFor(x => x.TrajetoDescricao)
            .MaximumLength(300).WithMessage("Descrição do trajeto deve ter no máximo 300 caracteres.")
            .When(x => x.TrajetoDescricao is not null);
    }

    private static bool BeValidDate(string? value) =>
        !string.IsNullOrWhiteSpace(value) && DateTime.TryParse(value, out _);
}
