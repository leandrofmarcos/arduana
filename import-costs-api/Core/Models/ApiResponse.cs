namespace ImportCostsApi.Core.Models;

/// <summary>
/// Resposta padrão da API
/// </summary>
public class ApiResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public object? Data { get; set; }
    public List<ValidationError>? Errors { get; set; }
    public int StatusCode { get; set; }

    public static ApiResponse Ok(object? data = null, string? message = null)
    {
        return new ApiResponse
        {
            Success = true,
            Data = data,
            Message = message,
            StatusCode = 200
        };
    }

    public static ApiResponse Created(object data, string? message = null)
    {
        return new ApiResponse
        {
            Success = true,
            Data = data,
            Message = message ?? "Recurso criado com sucesso",
            StatusCode = 201
        };
    }

    public static ApiResponse Error(string message, int statusCode = 400)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            StatusCode = statusCode
        };
    }

    public static ApiResponse ValidationError(List<ValidationError> errors)
    {
        return new ApiResponse
        {
            Success = false,
            Message = "Erros de validação",
            Errors = errors,
            StatusCode = 400
        };
    }

    public static ApiResponse NotFound(string message)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            StatusCode = 404
        };
    }
}

/// <summary>
/// Resposta genérica tipada da API
/// </summary>
public class ApiResponse<T> : ApiResponse
{
    public new T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message,
            StatusCode = 200
        };
    }

    public static ApiResponse<T> Created(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message ?? "Recurso criado com sucesso",
            StatusCode = 201
        };
    }
}
