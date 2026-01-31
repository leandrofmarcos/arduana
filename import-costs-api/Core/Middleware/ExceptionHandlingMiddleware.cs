using ImportCostsApi.Core.Exceptions;
using ImportCostsApi.Core.Models;
using System.Net;
using System.Text.Json;

namespace ImportCostsApi.Core.Middleware;

/// <summary>
/// Middleware para tratamento global de exceções
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            NotFoundException notFound => new ApiResponse
            {
                Success = false,
                Message = notFound.Message,
                StatusCode = (int)HttpStatusCode.NotFound
            },
            ValidationException validation => new ApiResponse
            {
                Success = false,
                Message = "Erros de validação",
                Errors = validation.Errors,
                StatusCode = (int)HttpStatusCode.BadRequest
            },
            BusinessException business => new ApiResponse
            {
                Success = false,
                Message = business.Message,
                StatusCode = (int)HttpStatusCode.BadRequest
            },
            _ => new ApiResponse
            {
                Success = false,
                Message = "Erro interno do servidor",
                StatusCode = (int)HttpStatusCode.InternalServerError
            }
        };

        context.Response.StatusCode = response.StatusCode;

        // Log do erro
        if (response.StatusCode >= 500)
        {
            _logger.LogError(exception, "Erro interno: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning(exception, "Erro de aplicação: {Message}", exception.Message);
        }

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(response, options);
        await context.Response.WriteAsync(json);
    }
}
