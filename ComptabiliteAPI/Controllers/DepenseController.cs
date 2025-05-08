using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using ComptabiliteAPI.Models.DTOs; // Assurez-vous que cette ligne est présente
using System.IO;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/depenses")]
    [Authorize]
    public class DepenseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DepenseController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUtilisateurId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(claim!.Value);
        }
        [HttpPost("create")]
        [DisableRequestSizeLimit]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateDepense([FromForm] DepenseFormDto dto)
        {
            // Vérification des champs requis
            if (string.IsNullOrEmpty(dto.Categorie) || string.IsNullOrEmpty(dto.Fournisseur) || dto.Montant <= 0)
                return BadRequest("Tous les champs requis doivent être renseignés.");

            int userId = GetUtilisateurId();

            byte[] fichierVerificationBytes = null;

            if (dto.FichierVerification != null)
            {
                using (var ms = new MemoryStream())
                {
                    await dto.FichierVerification.CopyToAsync(ms);
                    fichierVerificationBytes = ms.ToArray();
                }
            }
            else
            {
                fichierVerificationBytes = new byte[0];  // Assignation d'un tableau vide
            }

            // Création de l'objet Depense
            var depense = new Depense
            {
                Categorie = dto.Categorie,
                Fournisseur = dto.Fournisseur,
                Montant = dto.Montant,
                Date = dto.Date,
                EntreprisID = dto.EntreprisID,
                VerificatioFacture = fichierVerificationBytes,
                UtilisateurId = userId, // Lié à l'utilisateur connecté
                type = "En Cours", // Par défaut, type "En Cours"
                Justificatif = dto.Justificatif,
            };

            // Ajout de la dépense à la base de données
            _context.Depenses.Add(depense);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Dépense créée avec succès.", id = depense.Id });
        }

        // Optionnel : méthode pour télécharger le justificatif
        [HttpGet("{id}/justificatif")]
        public async Task<IActionResult> GetJustificatif(int id)
        {
            int userId = GetUtilisateurId();
            var depense = await _context.Depenses
                .FirstOrDefaultAsync(d => d.Id == id && d.UtilisateurId == userId);

            if (depense == null)
                return NotFound("Dépense non trouvée.");

            if (depense.VerificatioFacture == null || depense.VerificatioFacture.Length == 0)
                return NotFound("Aucun justificatif disponible.");

            // ✅ Mise à jour de l'état à "Terminer"
            depense.type = "Terminer";
            await _context.SaveChangesAsync();

            // ✅ Retourner le fichier justificatif
            return File(depense.VerificatioFacture, "application/pdf", "justificatif.pdf");
        }
        // GET: api/depenses/entreprise/{entrepriseId}
        [HttpGet("entreprise/{entrepriseId}")]
        public async Task<IActionResult> GetDepensesParEntreprise(int entrepriseId)
        {
            int userId = GetUtilisateurId();

            var depenses = await _context.Depenses
                .Where(d => d.EntreprisID == entrepriseId && d.UtilisateurId == userId)
                .OrderByDescending(d => d.Date)
                .ToListAsync();

            return Ok(depenses);
        }

    }
}
