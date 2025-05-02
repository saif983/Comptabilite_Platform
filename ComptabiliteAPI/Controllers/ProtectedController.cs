using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/protected")]
[ApiController]
[Authorize] // Seuls les utilisateurs authentifiés peuvent accéder
public class ProtectedController : ControllerBase
{
    [HttpGet]
    public IActionResult GetProtectedData()
    {
        return Ok(new { message = "Bienvenue dans la zone protégée !" });
    }
}
