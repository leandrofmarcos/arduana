using Comex133Api.Core.Exceptions;
using Comex133Api.Core.Models;
using System.Net;
using System.Text.Json;

namespace Comex133Api.Core.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
            NotFoundException notFound => ApiResponse.Error(notFound.Message, (int)HttpStatusCode.NotFound),
            UnauthorizedException unauthorized => ApiResponse.Error(unauthorized.Message, (int)HttpStatusCode.Unauthorized),
            ValidationException validation => new ApiResponse
            {
                Success = false,
                Message = "Erros de validação",
                Errors = validation.Errors,
                StatusCode = (int)HttpStatusCode.BadRequest
            },
            BusinessException business => ApiResponse.Error(business.Message, (int)HttpStatusCode.BadRequest),
            _ => ApiResponse.Error("Erro interno do servidor", (int)HttpStatusCode.InternalServerError)
        };

        context.Response.StatusCode = response.StatusCode;

        if (response.StatusCode >= 500)
            _logger.LogError(exception, "Erro interno: {Message}", exception.Message);
        else
            _logger.LogWarning(exception, "Erro de aplicação: {Message}", exception.Message);

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        await context.Response.WriteAsync(json);
    }
}
