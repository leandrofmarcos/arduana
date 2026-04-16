using System.Security.Claims;
using Comex133Api.Core.Models;
using Comex133Api.Features.Auth;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Comex133Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService                   _authService;
    private readonly IValidator<LoginRequest>      _loginValidator;
    private readonly IValidator<RefreshRequest>    _refreshValidator;

    public AuthController(
        AuthService authService,
        IValidator<LoginRequest>   loginValidator,
        IValidator<RefreshRequest> refreshValidator)
    {
        _authService      = authService;
        _loginValidator   = loginValidator;
        _refreshValidator = refreshValidator;
    }

    /// <summary>Autentica o usuário e retorna access + refresh tokens.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var validation = await _loginValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            var errors = validation.Errors
                .Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage })
                .ToList();
            return BadRequest(ApiResponse.ValidationError(errors));
        }

        var result = await _authService.LoginAsync(request);
        return Ok(ApiResponse.Ok(result, "Login realizado com sucesso."));
    }

    /// <summary>Renova o access token usando um refresh token válido.</summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        var validation = await _refreshValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            var errors = validation.Errors
                .Select(e => new ValidationError { Field = e.PropertyName, Message = e.ErrorMessage })
                .ToList();
            return BadRequest(ApiResponse.ValidationError(errors));
        }

        var result = await _authService.RefreshAsync(request);
        return Ok(ApiResponse.Ok(result, "Token renovado com sucesso."));
    }

    /// <summary>Revoga o refresh token (logout).</summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        await _authService.LogoutAsync(request);
        return Ok(ApiResponse.Ok(message: "Logout realizado com sucesso."));
    }

    /// <summary>Retorna os dados do usuário autenticado.</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub");

        if (!int.TryParse(sub, out var usuarioId))
            return Unauthorized();

        var result = await _authService.GetMeAsync(usuarioId);
        return Ok(ApiResponse.Ok(result));
    }
}
