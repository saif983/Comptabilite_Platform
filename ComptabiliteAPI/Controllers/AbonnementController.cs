using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using Microsoft.AspNetCore.Authorization;


namespace ComptabiliteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AbonnementController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AbonnementController(AppDbContext context)
        {
            _context = context;
        }
        // GET: api/Abonnement/mon
        [HttpGet("mon")]
        public async Task<IActionResult> GetMonAbonnement()
        {
            var nameId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(nameId))
            {
                return Unauthorized("Token invalide ou identifiant utilisateur manquant.");
            }

            var userId = int.Parse(nameId);

            var user = await _context.Utilisateurs
                .Include(u => u.Abonnement)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || user.Abonnement == null)
            {
                return NotFound("Aucun abonnement trouvé pour cet utilisateur.");
            }

            return Ok(new
            {
                type = user.Abonnement.Type,
                prix = user.Abonnement.Prix,
                dateDebut = user.Abonnement.DateDebut,
                dateFin = user.Abonnement.DateFin
            });
        }

        public class ChangerAbonnementDto
        {
            public string Type { get; set; }
        }
        [HttpPost("changer")]
        public async Task<IActionResult> ChangerAbonnement([FromBody] ChangerAbonnementDto dto)
        {
            var type = dto.Type;

            var nameId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(nameId))
            {
                return Unauthorized("Token invalide ou identifiant utilisateur manquant.");
            }

            var userId = int.Parse(nameId);
            var user = await _context.Utilisateurs
                .Include(u => u.Abonnement)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound("Utilisateur non trouvé");

            decimal prix = type switch
            {
                "Mensuel" => 30,
                "Annuel" => 300,
                "Free" => 0,
                _ => throw new ArgumentException("Type d'abonnement invalide")
            };

            DateTime dateDebut = DateTime.UtcNow;
            DateTime dateFin = type switch
            {
                "Mensuel" => dateDebut.AddMonths(1),
                "Annuel" => dateDebut.AddYears(1),
                "Free" => dateDebut.AddMonths(1),
                _ => dateDebut
            };

            if (user.Abonnement != null)
            {
                user.Abonnement.Type = type;
                user.Abonnement.Prix = prix;
                user.Abonnement.DateDebut = dateDebut;
                user.Abonnement.DateFin = dateFin;
            }
            else
            {
                var abonnement = new Abonnement
                {
                    Type = type,
                    Prix = prix,
                    DateDebut = dateDebut,
                    DateFin = dateFin
                };
                _context.Abonnements.Add(abonnement);
                await _context.SaveChangesAsync();

                user.AbonnementId = abonnement.Id;
                user.Abonnement = abonnement;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Abonnement mis à jour avec succès",
                type,
                prix,
                dateDebut,
                dateFin
            });
        }

    }
}
