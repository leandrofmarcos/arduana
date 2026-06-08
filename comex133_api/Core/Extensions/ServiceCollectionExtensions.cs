using Comex133Api.Core.Auth;
using Comex133Api.Core.Database;
using Comex133Api.Infrastructure.Storage;
using Comex133Api.Features.UsuarioVinculos;
using Comex133Api.Features.AgentesCarga;
using Comex133Api.Features.Auth;
using Comex133Api.Features.CustosDespachante;
using Comex133Api.Features.Navios;
using Comex133Api.Features.Clientes;
using Comex133Api.Features.ControleNavios;
using Comex133Api.Features.Despachantes;
using Comex133Api.Features.DespesasCatalogo;
using Comex133Api.Features.Exportadores;
using Comex133Api.Features.Fabricantes;
using Comex133Api.Features.Importadores;
using Comex133Api.Features.ListaPrecoLcl;
using Comex133Api.Features.ModelosDespesa;
using Comex133Api.Features.OrcamentosVenda;
using Comex133Api.Features.Packlist;
using Comex133Api.Features.Ncms;
using Comex133Api.Features.Parametros;
using Comex133Api.Features.PortosDestino;
using Comex133Api.Features.PortosOrigem;
using Comex133Api.Features.Roles;
using Comex133Api.Features.SolicitacoesOrcamento;
using Comex133Api.Features.Usuarios;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Comex133Api.Core.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAppDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sqlOptions =>
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorNumbersToAdd: new[] { 17892, 18456, 233 });
                });
        });

        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var secret   = configuration["Jwt:Secret"]!;
        var issuer   = configuration["Jwt:Issuer"]!;
        var audience = configuration["Jwt:Audience"]!;
        var key      = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = key,
                ValidateIssuer           = true,
                ValidIssuer              = issuer,
                ValidateAudience         = true,
                ValidAudience            = audience,
                ValidateLifetime         = true,
                ClockSkew                = TimeSpan.Zero
            };
        });

        services.AddAuthorization();

        return services;
    }

    public static IServiceCollection AddFeatureServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserContext, CurrentUserContext>();

        // Storage — troque LocalStorageService por outra impl (Azure, S3, MinIO) sem alterar o resto
        services.AddScoped<IStorageService, LocalStorageService>();
        services.AddScoped<UsuarioVinculosService>();

        services.AddScoped<ParametroService>();
        services.AddScoped<JwtService>();
        services.AddScoped<AuthService>();
        services.AddScoped<UsuarioService>();
        services.AddScoped<RoleService>();

        // Phase 3 — Cadastros
        services.AddScoped<PortosOrigemService>();
        services.AddScoped<PortosDestinoService>();
        services.AddScoped<ClientesService>();
        services.AddScoped<ImportadoresService>();
        services.AddScoped<ExportadoresService>();
        services.AddScoped<AgentesCargaService>();
        services.AddScoped<FabricantesService>();
        services.AddScoped<DespachantesService>();
        services.AddScoped<NcmsService>();
        services.AddScoped<ListaPrecoLclService>();
        services.AddScoped<DespesasCatalogoService>();
        services.AddScoped<ModelosDespesaService>();
        services.AddScoped<SolicitacoesOrcamentoService>();
        services.AddScoped<ControleNaviosService>();

        // Phase 5 — Navios
        services.AddScoped<NaviosService>();

        // Phase OP — Fluxo operacional
        services.AddScoped<CustosDespachanteService>();
        services.AddScoped<OrcamentosVendaService>();

        // Packlist
        services.AddScoped<PacklistService>();
        return services;
    }

    public static IServiceCollection AddFeatureValidators(this IServiceCollection services)
    {
        // Parametros
        services.AddScoped<IValidator<CreateParametroRequest>, CreateParametroValidator>();
        services.AddScoped<IValidator<UpdateParametroRequest>, UpdateParametroValidator>();

        // Auth
        services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();
        services.AddScoped<IValidator<RefreshRequest>, RefreshRequestValidator>();

        // Usuarios
        services.AddScoped<IValidator<CreateUsuarioRequest>, CreateUsuarioRequestValidator>();
        services.AddScoped<IValidator<UpdateUsuarioRequest>, UpdateUsuarioRequestValidator>();
        services.AddScoped<IValidator<AlterarSenhaRequest>,  AlterarSenhaRequestValidator>();

        // Roles
        services.AddScoped<IValidator<CreateRoleRequest>, CreateRoleRequestValidator>();
        services.AddScoped<IValidator<UpdateRoleRequest>, UpdateRoleRequestValidator>();

        // Phase 3 — Cadastros
        services.AddScoped<IValidator<CreatePortoOrigemRequest>,        CreatePortoOrigemValidator>();
        services.AddScoped<IValidator<UpdatePortoOrigemRequest>,        UpdatePortoOrigemValidator>();
        services.AddScoped<IValidator<CreatePortoDestinoRequest>,       CreatePortoDestinoValidator>();
        services.AddScoped<IValidator<UpdatePortoDestinoRequest>,       UpdatePortoDestinoValidator>();
        services.AddScoped<IValidator<CreateClienteRequest>,            CreateClienteValidator>();
        services.AddScoped<IValidator<UpdateClienteRequest>,            UpdateClienteValidator>();
        services.AddScoped<IValidator<CreateImportadorRequest>,         CreateImportadorValidator>();
        services.AddScoped<IValidator<UpdateImportadorRequest>,         UpdateImportadorValidator>();
        services.AddScoped<IValidator<CreateExportadorRequest>,         CreateExportadorValidator>();
        services.AddScoped<IValidator<UpdateExportadorRequest>,         UpdateExportadorValidator>();
        services.AddScoped<IValidator<CreateAgenteCargaRequest>,        CreateAgenteCargaValidator>();
        services.AddScoped<IValidator<UpdateAgenteCargaRequest>,        UpdateAgenteCargaValidator>();
        services.AddScoped<IValidator<CreateFabricanteRequest>,         CreateFabricanteValidator>();
        services.AddScoped<IValidator<UpdateFabricanteRequest>,         UpdateFabricanteValidator>();
        services.AddScoped<IValidator<CreateDespachantRequest>,         CreateDespachantValidator>();
        services.AddScoped<IValidator<UpdateDespachantRequest>,         UpdateDespachantValidator>();
        services.AddScoped<IValidator<CreateNcmRequest>,                CreateNcmValidator>();
        services.AddScoped<IValidator<UpdateNcmRequest>,                UpdateNcmValidator>();
        services.AddScoped<IValidator<CreateListaPrecoLclRequest>,      CreateListaPrecoLclValidator>();
        services.AddScoped<IValidator<UpdateListaPrecoLclRequest>,      UpdateListaPrecoLclValidator>();
        services.AddScoped<IValidator<CreateDespesaCatalogoRequest>,    CreateDespesaCatalogoValidator>();
        services.AddScoped<IValidator<UpdateDespesaCatalogoRequest>,    UpdateDespesaCatalogoValidator>();
        services.AddScoped<IValidator<CreateModeloDespesaRequest>,      CreateModeloDespesaValidator>();
        services.AddScoped<IValidator<UpdateModeloDespesaRequest>,      UpdateModeloDespesaValidator>();
        services.AddScoped<IValidator<CreateSolicitacaoOrcamentoRequest>,      CreateSolicitacaoOrcamentoValidator>();
        services.AddScoped<IValidator<UpdateSolicitacaoOrcamentoRequest>,      UpdateSolicitacaoOrcamentoValidator>();
        services.AddScoped<IValidator<UpdateSolicitacaoOrcamentoStatusRequest>, UpdateSolicitacaoOrcamentoStatusValidator>();
        services.AddScoped<IValidator<AddSolicitacaoDespachanteRequest>,       AddSolicitacaoDespachanteValidator>();
        services.AddScoped<IValidator<AddSolicitacaoDocumentoRequest>,          AddSolicitacaoDocumentoValidator>();
        services.AddScoped<IValidator<CreateControleNavioRequest>,             CreateControleNavioValidator>();
        services.AddScoped<IValidator<UpdateControleNavioRequest>,             UpdateControleNavioValidator>();
        services.AddScoped<IValidator<UpsertControleNavioTrajetoRequest>,      UpsertControleNavioTrajetoValidator>();

        // Phase 5 — Navios
        services.AddScoped<IValidator<CreateNavioRequest>,                    CreateNavioValidator>();
        services.AddScoped<IValidator<UpdateNavioRequest>,                    UpdateNavioValidator>();
        services.AddScoped<IValidator<CreateNavioTrajetoRequest>,             CreateNavioTrajetoValidator>();
        services.AddScoped<IValidator<UpdateNavioTrajetoRequest>,             UpdateNavioTrajetoValidator>();
        services.AddScoped<IValidator<CreateEmbarqueNavioVinculoRequest>,     CreateEmbarqueNavioVinculoValidator>();

        // Phase OP — CustosDespachante
        services.AddScoped<IValidator<CreateCustoDespachanteRequest>,         CreateCustoDespachanteValidator>();
        services.AddScoped<IValidator<UpdateCustoDespachanteRequest>,         UpdateCustoDespachanteValidator>();
        services.AddScoped<IValidator<UpsertCustoDespachanteLiRequest>,       UpsertLiValidator>();
        services.AddScoped<IValidator<UpsertCustoDespachanteDespesaRequest>,  UpsertDespesaValidator>();
        services.AddScoped<IValidator<UpsertNcmVinculadoCustoRequest>,        UpsertNcmValidator>();
        services.AddScoped<IValidator<UpsertValorImpostoCustoRequest>,        UpsertValorImpostoValidator>();

        // Phase OP — OrcamentosVenda
        services.AddScoped<IValidator<CreateOrcamentoVendaRequest>,           CreateOrcamentoVendaValidator>();
        services.AddScoped<IValidator<UpdateOrcamentoVendaRequest>,           UpdateOrcamentoVendaValidator>();
        services.AddScoped<IValidator<UpsertOrcamentoVendaDespesaRequest>,    UpsertOrcamentoVendaDespesaValidator>();
        services.AddScoped<IValidator<SolicitarReaberturaRequest>,            SolicitarReaberturaValidator>();

        // Packlist
        services.AddScoped<IValidator<SaveMapeamentoRequest>, SaveMapeamentoRequestValidator>();

        return services;
    }
}

