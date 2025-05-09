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
            try
            {
                // Log des données reçues pour le débogage
                Console.WriteLine($"Données reçues: Catégorie={dto.Categorie}, Fournisseur={dto.Fournisseur}, Montant={dto.Montant}, Date={dto.Date}, EntreprisID={dto.EntreprisID}");
                
                // Vérification des champs requis
                if (string.IsNullOrEmpty(dto.Categorie) || string.IsNullOrEmpty(dto.Fournisseur) || dto.Montant <= 0)
                {
                    Console.WriteLine("Validation échouée: champs requis manquants");
                    return BadRequest("Tous les champs requis doivent être renseignés.");
                }

                int userId = GetUtilisateurId();
                Console.WriteLine($"UserId obtenu: {userId}");

                byte[] fichierVerificationBytes = null;

                if (dto.FichierVerification != null)
                {
                    using (var ms = new MemoryStream())
                    {
                        await dto.FichierVerification.CopyToAsync(ms);
                        fichierVerificationBytes = ms.ToArray();
                        Console.WriteLine($"Fichier chargé: {dto.FichierVerification.FileName}, taille: {fichierVerificationBytes.Length} octets");
                    }
                }
                else
                {
                    fichierVerificationBytes = new byte[0];  // Assignation d'un tableau vide
                    Console.WriteLine("Aucun fichier de vérification fourni");
                }

                // Normalisation de la date (pour éviter les problèmes de timezone)
                DateTime normalizedDate;
                
                // Si la date contient un 'T', c'est probablement déjà au format ISO
                if (dto.Date.ToString().Contains('T'))
                {
                    normalizedDate = dto.Date.Date; // Enlever la partie de l'heure
                    Console.WriteLine($"Date normalisée (depuis ISO): {normalizedDate:yyyy-MM-dd}");
                }
                else
                {
                    // Si c'est juste une date, l'utiliser telle quelle
                    normalizedDate = dto.Date.Date;
                    Console.WriteLine($"Date normalisée (depuis date simple): {normalizedDate:yyyy-MM-dd}");
                }

                // Création de l'objet Depense
                var depense = new Depense
                {
                    Categorie = dto.Categorie,
                    Fournisseur = dto.Fournisseur,
                    Montant = dto.Montant,
                    Date = normalizedDate, // Utiliser la date normalisée
                    EntreprisID = dto.EntreprisID,
                    VerificatioFacture = fichierVerificationBytes,
                    UtilisateurId = userId, // Lié à l'utilisateur connecté
                    type = "En Cours", // Par défaut, type "En Cours"
                    Justificatif = dto.Justificatif,
                };

                Console.WriteLine("Objet Depense créé, prêt à être enregistré dans la base de données");

                // Ajout de la dépense à la base de données
                _context.Depenses.Add(depense);

                await _context.SaveChangesAsync();
                Console.WriteLine($"Dépense enregistrée avec ID: {depense.Id}");

                return Ok(new { message = "Dépense créée avec succès.", id = depense.Id });
            }
            catch (Exception ex)
            {
                // Log détaillé de l'exception
                Console.WriteLine($"ERREUR: {ex.Message}");
                Console.WriteLine($"STACK TRACE: {ex.StackTrace}");
                
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"INNER EXCEPTION: {ex.InnerException.Message}");
                    Console.WriteLine($"INNER STACK TRACE: {ex.InnerException.StackTrace}");
                }
                
                return StatusCode(500, new { message = "Erreur lors de la création de la dépense", details = ex.Message });
            }
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
            try
            {
                Console.WriteLine($"Demande de dépenses pour l'entreprise ID: {entrepriseId}");
                int userId = GetUtilisateurId();
                Console.WriteLine($"UserID: {userId}");

                var depenses = await _context.Depenses
                    .Where(d => d.EntreprisID == entrepriseId && d.UtilisateurId == userId)
                    .OrderByDescending(d => d.Date)
                    .ToListAsync();

                Console.WriteLine($"Nombre de dépenses trouvées: {depenses.Count}");
                
                // Retourner un tableau vide si aucune dépense n'est trouvée
                if (depenses.Count == 0)
                {
                    Console.WriteLine("Aucune dépense trouvée, retour d'un tableau vide");
                    return Ok(new List<Depense>());
                }

                // Retourner les dépenses trouvées dans un format standard
                return Ok(depenses);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERREUR dans GetDepensesParEntreprise: {ex.Message}");
                Console.WriteLine($"STACK TRACE: {ex.StackTrace}");
                return StatusCode(500, new { message = "Erreur lors de la récupération des dépenses", details = ex.Message });
            }
        }

    }
}
