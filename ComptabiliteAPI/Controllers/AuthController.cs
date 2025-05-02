using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using ComptabiliteAPI.Models;
using ComptabiliteAPI.Data;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Logging;


[Route("api/auth")]
[ApiController]

public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, JwtService jwtService, ILogger<AuthController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _logger = logger;
    }
   

    /// Connexion d'un utilisateur
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Utilisateurs.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.MotDePasse, user.MotDePasse))
        {
            return Unauthorized(new { message = "Email ou mot de passe incorrect." });
        }

        var token = _jwtService.GenerateToken(user);
        return Ok(new { Token = token, Role = user.Role, Id = user.Id });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Utilisateurs.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { message = "Cet email est d�j� utilis�." });
        }

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.MotDePasse);

        // 1. Cr�er l'abonnement gratuit
        var abonnement = new Abonnement
        {
            Type = "Free",
            Prix = 0,
            DateDebut = DateTime.UtcNow,
            DateFin = DateTime.UtcNow.AddMonths(1)
        };

        _context.Abonnements.Add(abonnement);
        await _context.SaveChangesAsync(); // On sauvegarde pour g�n�rer son Id

        // 2. Cr�er le nouvel utilisateur avec l'abonnement associ�
        var newUser = new Utilisateur
        {
            Nom = request.Nom,
            Email = request.Email,
            MotDePasse = hashedPassword,
            Role = request.Role,
            AbonnementId = abonnement.Id
        };

        _context.Utilisateurs.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Inscription r�ussie avec abonnement gratuit",
            UserId = newUser.Id,
            abonnement.Type,
            abonnement.DateDebut,
            abonnement.DateFin
        });
    }



    /// D�connexion (simul�e car JWT est stateless)
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "D�connexion r�ussie" });
    }

    private string GenerateVerificationToken(string userId)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("VotreCl�Secr�te"));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "VotreApp",
            audience: "VotreApp",
            claims: new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim("VerificationType", "Email")
            },
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string MotDePasse { get; set; }
    }

    public class RegisterRequest
    {
        public string Nom { get; set; }
        public string Email { get; set; }
        public string MotDePasse { get; set; }
        public string Role { get; set; }
    }

}
