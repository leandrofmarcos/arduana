using FluentValidation;

namespace Comex133Api.Features.SolicitacoesOrcamento;

public class CreateSolicitacaoOrcamentoValidator : AbstractValidator<CreateSolicitacaoOrcamentoRequest>
{
    private static readonly string[] AllowedContainer = ["20", "40", "LCL"];

    public CreateSolicitacaoOrcamentoValidator()
    {
        RuleFor(x => x.PortoOrigemId).GreaterThan(0).WithMessage("Porto de origem é obrigatório.");
        RuleFor(x => x.PortoDestinoId).GreaterThan(0).WithMessage("Porto de destino é obrigatório.");

        RuleFor(x => x.Responsavel)
            .NotEmpty().WithMessage("Responsável é obrigatório.")
            .MaximumLength(200).WithMessage("Responsável deve ter no máximo 200 caracteres.");

        RuleFor(x => x.TamContainer)
            .Must(v => AllowedContainer.Contains(v))
            .WithMessage("Tamanho de container inválido. Use 20, 40 ou LCL.");

        RuleFor(x => x.Peso)
            .GreaterThan(0).WithMessage("Peso deve ser maior que zero.");

        RuleFor(x => x.Observacao)
            .MaximumLength(1000).WithMessage("Observação deve ter no máximo 1000 caracteres.");

    }
}

public class UpdateSolicitacaoOrcamentoValidator : AbstractValidator<UpdateSolicitacaoOrcamentoRequest>
{
    private static readonly string[] AllowedContainer = ["20", "40", "LCL"];

    public UpdateSolicitacaoOrcamentoValidator()
    {
        RuleFor(x => x.PortoOrigemId).GreaterThan(0).WithMessage("Porto de origem é obrigatório.");
        RuleFor(x => x.PortoDestinoId).GreaterThan(0).WithMessage("Porto de destino é obrigatório.");

        RuleFor(x => x.Responsavel)
            .NotEmpty().WithMessage("Responsável é obrigatório.")
            .MaximumLength(200).WithMessage("Responsável deve ter no máximo 200 caracteres.");

        RuleFor(x => x.TamContainer)
            .Must(v => AllowedContainer.Contains(v))
            .WithMessage("Tamanho de container inválido. Use 20, 40 ou LCL.");

        RuleFor(x => x.Peso)
            .GreaterThan(0).WithMessage("Peso deve ser maior que zero.");

        RuleFor(x => x.Observacao)
            .MaximumLength(1000).WithMessage("Observação deve ter no máximo 1000 caracteres.");

    }
}

public class UpdateSolicitacaoOrcamentoStatusValidator : AbstractValidator<UpdateSolicitacaoOrcamentoStatusRequest>
{
    public UpdateSolicitacaoOrcamentoStatusValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status é obrigatório.")
            .Must(v => v is "Aprovada" or "Cancelada")
            .WithMessage("Somente os status 'Aprovada' ou 'Cancelada' podem ser definidos manualmente.");
    }
}

public class AddSolicitacaoDespachanteValidator : AbstractValidator<AddSolicitacaoDespachanteRequest>
{
    public AddSolicitacaoDespachanteValidator()
    {
        RuleFor(x => x.DespachanteId).GreaterThan(0).WithMessage("Despachante é obrigatório.");
    }
}

public class AddSolicitacaoDocumentoValidator : AbstractValidator<AddSolicitacaoDocumentoRequest>
{
    public AddSolicitacaoDocumentoValidator()
    {
        RuleFor(x => x.NomeArquivo)
            .NotEmpty().WithMessage("Nome do arquivo é obrigatório.")
            .MaximumLength(250).WithMessage("Nome do arquivo deve ter no máximo 250 caracteres.");

        RuleFor(x => x.LinkDocumento)
            .NotEmpty().WithMessage("Link do documento é obrigatório.")
            .MaximumLength(500).WithMessage("Link do documento deve ter no máximo 500 caracteres.");

        RuleFor(x => x.Observacao)
            .MaximumLength(500).WithMessage("Observação deve ter no máximo 500 caracteres.");
    }
}
