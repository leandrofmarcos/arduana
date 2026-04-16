namespace Comex133Api.Core.Models;

public class ApiResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public object? Data { get; set; }
    public List<ValidationError>? Errors { get; set; }
    public int StatusCode { get; set; }

    public static ApiResponse Ok(object? data = null, string? message = null) => new()
    {
        Success = true,
        Data = data,
        Message = message,
        StatusCode = 200
    };

    public static ApiResponse Created(object data, string? message = null) => new()
    {
        Success = true,
        Data = data,
        Message = message ?? "Recurso criado com sucesso",
        StatusCode = 201
    };

    public static ApiResponse Error(string message, int statusCode = 400) => new()
    {
        Success = false,
        Message = message,
        StatusCode = statusCode
    };

    public static ApiResponse ValidationError(List<ValidationError> errors) => new()
    {
        Success = false,
        Message = "Erros de validação",
        Errors = errors,
        StatusCode = 400
    };

    public static ApiResponse NotFound(string message) => new()
    {
        Success = false,
        Message = message,
        StatusCode = 404
    };
}
