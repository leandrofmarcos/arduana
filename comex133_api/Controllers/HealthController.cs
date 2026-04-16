using Comex133Api.Core.Database;
using Comex133Api.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;
    private readonly AppDbContext _db;

    public HealthController(ILogger<HealthController> logger, AppDbContext db)
    {
        _logger = logger;
        _db = db;
    }

    /// <summary>Verifica o status da API e conectividade com o banco de dados.</summary>
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        _logger.LogInformation("Health check executado");

        string dbStatus;
        try
        {
            dbStatus = await _db.Database.CanConnectAsync() ? "connected" : "unreachable";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao verificar conexão com banco");
            dbStatus = "error";
        }

        var data = new
        {
            status      = dbStatus == "connected" ? "healthy" : "degraded",
            timestamp   = DateTime.UtcNow,
            version     = "1.0.0",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            database    = dbStatus
        };

        return Ok(ApiResponse.Ok(data, "Health check concluído"));
    }
}
