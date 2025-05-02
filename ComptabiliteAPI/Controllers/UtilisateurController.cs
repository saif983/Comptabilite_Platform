using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/utilisateur")]
    [Authorize]
    public class UtilisateurController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UtilisateurController(AppDbContext context)
        {
            _context = context;
        }

        private int GetConnectedUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new Exception("Utilisateur non authentifié.");

            return int.Parse(userIdClaim.Value);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto request)
        {
            if (await _context.Utilisateurs.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Cet email est déjà utilisé." });
            }

            int connectedUserId = GetConnectedUserId();

            var connectedUser = await _context.Utilisateurs
                .Include(u => u.Abonnement)
                .FirstOrDefaultAsync(u => u.Id == connectedUserId);

            if (connectedUser == null)
                return Unauthorized("Utilisateur non authentifié");

            if (connectedUser.Role?.ToLower() != "admin")
                return Forbid("Seul un administrateur peut créer des utilisateurs.");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.MotDePasse);

            var newUser = new Utilisateur
            {
                Nom = request.Nom,
                Email = request.Email,
                MotDePasse = hashedPassword,
                Role = request.Role,
                AbonnementId = connectedUser.AbonnementId, // ✅ hérite de l'abonnement de l'admin
                CreeParId = connectedUser.Id

            };

            _context.Utilisateurs.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Création réussie",
                UserId = newUser.Id,
                AbonnementId = newUser.AbonnementId
            });
        }


        [Authorize]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUtilisateur(int id, [FromBody] UpdateUtilisateurDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("Utilisateur non authentifié");

            int userId = int.Parse(userIdClaim.Value);

            var existingUser = await _context.Utilisateurs.FindAsync(id);
            if (existingUser == null)
                return NotFound("Utilisateur non trouvé.");

            // ✅ seul l'utilisateur lui-même peut se modifier
            if (userId != existingUser.Id)
                return Forbid("Vous n'avez pas le droit de modifier cet utilisateur.");

            existingUser.MotDePasse = BCrypt.Net.BCrypt.HashPassword(dto.MotDePasse);
            existingUser.Role = dto.Role;

            await _context.SaveChangesAsync();
            return Ok(existingUser);
        }


        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUtilisateur(int id)
        {
            var utilisateur = await _context.Utilisateurs.FindAsync(id);
            if (utilisateur == null)
            {
                return NotFound("Utilisateur non trouvé.");
            }

            _context.Utilisateurs.Remove(utilisateur);
            await _context.SaveChangesAsync();
            return Ok("Utilisateur supprimé avec succès.");
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUtilisateur(int id)
        {
            var currentUserId = int.Parse(User.FindFirst("UserId").Value);

            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Id == id && u.CreeParId == currentUserId);

            if (utilisateur == null)
            {
                return NotFound("Utilisateur non trouvé ou accès refusé.");
            }

            return Ok(utilisateur);
        }

        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Utilisateur>>> GetAllUtilisateurs()
        {
            int connectedUserId = GetConnectedUserId();

            var users = await _context.Utilisateurs
                .Where(u => u.CreeParId == connectedUserId)
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            int userId = GetConnectedUserId();
            
            var user = await _context.Utilisateurs
                .Include(u => u.DefaultEntreprise)
                .FirstOrDefaultAsync(u => u.Id == userId);
            
            if (user == null)
                return NotFound("Utilisateur non trouvé.");
            
            return Ok(new 
            {
                id = user.Id,
                nom = user.Nom,
                email = user.Email,
                role = user.Role,
                defaultEntrepriseId = user.DefaultEntrepriseId,
                defaultEntreprise = user.DefaultEntreprise != null ? new 
                {
                    id = user.DefaultEntreprise.Id,
                    nom = user.DefaultEntreprise.Nom
                } : null
            });
        }

        public class UpdateUtilisateurDTO
        {
            public string MotDePasse { get; set; }
            public string Role { get; set; }
        }
        public class CreateUserDto
        {
            public string Nom { get; set; }
            public string Email { get; set; }
            public string MotDePasse { get; set; }
            public string Role { get; set; }
        }

        // Tu n'as pas besoin de cette fonction maintenant
        private string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
