using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ComptabiliteAPI.DTOs;
using System.IO;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/entreprises")]
    [Authorize]
    public class EntrepriseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EntrepriseController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUtilisateurId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(claim!.Value);
        }

        // ✅ Créer une entreprise liée à l'utilisateur
        [HttpPost("create")]
        [DisableRequestSizeLimit]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateEntreprise([FromForm] CreaEntrepriseDto dto)
        {
            if (string.IsNullOrEmpty(dto.Nom) || string.IsNullOrEmpty(dto.Adresse))
                return BadRequest("Les champs Nom et Adresse sont obligatoires.");

            int userId = GetUtilisateurId();

            // Convertir les fichiers téléchargés en byte[]
            byte[] logoBytes = null;
            byte[] rcsBytes = null;
            byte[] identitegerantBytes = null;
            byte[] justificatifedomicileBytes = null;

            if (dto.Logo != null)
            {
                using (var ms = new MemoryStream())
                {
                    await dto.Logo.CopyToAsync(ms);
                    logoBytes = ms.ToArray();
                }
            }

            if (dto.RCS != null)
            {
                using (var ms = new MemoryStream())
                {
                    await dto.RCS.CopyToAsync(ms);
                    rcsBytes = ms.ToArray();
                }
            }

            if (dto.Identitegerant != null)
            {
                using (var ms = new MemoryStream())
                {
                    await dto.Identitegerant.CopyToAsync(ms);
                    identitegerantBytes = ms.ToArray();
                }
            }

            if (dto.Justificatifedomicile != null)
            {
                using (var ms = new MemoryStream())
                {
                    await dto.Justificatifedomicile.CopyToAsync(ms);
                    justificatifedomicileBytes = ms.ToArray();
                }
            }

            var entreprise = new Entreprise
            {
                Nom = dto.Nom,
                Adresse = dto.Adresse,
                MF = dto.MF,
                Tel = dto.Tel,
                UtilisateurId = userId,
                Logo = logoBytes,
                RCS = rcsBytes,
                Identitegerant = identitegerantBytes,
                Justificatifedomicile = justificatifedomicileBytes
            };

            _context.Entreprises.Add(entreprise);
            await _context.SaveChangesAsync();
            
            // Récupérer l'utilisateur et définir cette entreprise comme entreprise par défaut
            var utilisateur = await _context.Utilisateurs.FindAsync(userId);
            if (utilisateur != null)
            {
                utilisateur.DefaultEntrepriseId = entreprise.Id;
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetEntreprise), new { id = entreprise.Id }, entreprise);
        }

        // Méthode pour télécharger un seul document/fichier existant
        [HttpGet("{id}/document/{type}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDocument(int id, string type)
        {
            // For anonymous requests, no need to check user ID
            var entreprise = await _context.Entreprises
                .FirstOrDefaultAsync(e => e.Id == id);

            if (entreprise == null)
                return NotFound("Entreprise non trouvée.");

            byte[] fileBytes = null;
            string contentType = "application/octet-stream";
            string fileName = "";

            switch (type.ToLower())
            {
                case "logo":
                    fileBytes = entreprise.Logo;
                    // Vérifier s'il s'agit d'un JPEG, PNG ou autre format d'image
                    if (fileBytes != null && fileBytes.Length > 2)
                    {
                        if (fileBytes[0] == 0xFF && fileBytes[1] == 0xD8) // JPEG magic number
                        {
                            contentType = "image/jpeg";
                            fileName = "logo.jpg";
                        }
                        else if (fileBytes[0] == 0x89 && fileBytes[1] == 0x50) // PNG magic number
                        {
                            contentType = "image/png";
                            fileName = "logo.png";
                        }
                        else
                        {
                            contentType = "image/jpeg"; // Par défaut
                            fileName = "logo.jpg";
                        }
                    }
                    else
                    {
                        contentType = "image/jpeg";
                        fileName = "logo.jpg";
                    }
                    break;
                case "rcs":
                    fileBytes = entreprise.RCS;
                    // Vérifier s'il s'agit d'un PDF ou d'une image
                    if (fileBytes != null && fileBytes.Length > 4 && fileBytes[0] == 0x25 && fileBytes[1] == 0x50) // PDF magic number
                    {
                        contentType = "application/pdf";
                        fileName = "rcs.pdf";
                    }
                    else if (fileBytes != null && fileBytes.Length > 2)
                    {
                        if (fileBytes[0] == 0xFF && fileBytes[1] == 0xD8) // JPEG
                        {
                            contentType = "image/jpeg";
                            fileName = "rcs.jpg";
                        }
                        else if (fileBytes[0] == 0x89 && fileBytes[1] == 0x50) // PNG
                        {
                            contentType = "image/png";
                            fileName = "rcs.png";
                        }
                        else
                        {
                            contentType = "application/pdf"; // Par défaut
                            fileName = "rcs.pdf";
                        }
                    }
                    else
                    {
                        contentType = "application/pdf"; 
                        fileName = "rcs.pdf";
                    }
                    break;
                case "identitegerant":
                    fileBytes = entreprise.Identitegerant;
                    contentType = "application/pdf";
                    fileName = "identite_gerant.pdf";
                    break;
                case "justificatifedomicile":
                    fileBytes = entreprise.Justificatifedomicile;
                    contentType = "application/pdf";
                    fileName = "justificatif_domicile.pdf";
                    break;
                default:
                    return BadRequest("Type de document non reconnu.");
            }

            if (fileBytes == null || fileBytes.Length == 0)
                return NotFound("Document non disponible.");

            // Ajouter des headers pour la mise en cache du navigateur
            Response.Headers.Add("Cache-Control", "private, max-age=86400"); // Cache pendant 24h
            Response.Headers.Add("Pragma", "private");
            Response.Headers.Add("Expires", DateTime.UtcNow.AddDays(1).ToString("R"));

            return File(fileBytes, contentType, fileName);
        }

        // Mettre à jour un document spécifique
        [HttpPut("{id}/document/{type}")]
        [DisableRequestSizeLimit]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateDocument(int id, string type, IFormFile file)
        {
            if (file == null)
                return BadRequest("Aucun fichier fourni.");

            int userId = GetUtilisateurId();
            var entreprise = await _context.Entreprises
                .FirstOrDefaultAsync(e => e.Id == id && e.UtilisateurId == userId);

            if (entreprise == null)
                return NotFound("Entreprise non trouvée ou accès interdit.");

            // Convertir le fichier en byte[]
            byte[] fileBytes;
            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }

            // Mettre à jour le document approprié
            switch (type.ToLower())
            {
                case "logo":
                    entreprise.Logo = fileBytes;
                    break;
                case "rcs":
                    entreprise.RCS = fileBytes;
                    break;
                case "identitegerant":
                    entreprise.Identitegerant = fileBytes;
                    break;
                case "justificatifedomicile":
                    entreprise.Justificatifedomicile = fileBytes;
                    break;
                default:
                    return BadRequest("Type de document non reconnu.");
            }

            await _context.SaveChangesAsync();
            return Ok("Document mis à jour avec succès.");
        }

        [HttpPut("update/{id}")]
        [DisableRequestSizeLimit]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateEntreprise(int id, [FromForm] CreaEntrepriseDto dto)
        {
            int userId = GetUtilisateurId();
            var existing = await _context.Entreprises
                .FirstOrDefaultAsync(e => e.Id == id && e.UtilisateurId == userId);

            if (existing == null)
                return NotFound("Entreprise non trouvée ou accès interdit.");

            // Mettre à jour les informations de base
            existing.Nom = dto.Nom;
            existing.Adresse = dto.Adresse;
            existing.MF = dto.MF;
            existing.Tel = dto.Tel;

            // Mettre à jour les fichiers si fournis
            if (dto.Logo != null)
            {
                using (var ms = new MemoryStream())
                {
                    await dto.Logo.CopyToAsync(ms);
                    existing.Logo = ms.ToArray();
                }
            }

            if (dto.RCS != null)
            {
                using (var ms = new MemoryStream())
                {
                    await dto.RCS.CopyToAsync(ms);
                    existing.RCS = ms.ToArray();
                }
            }

            if (dto.Identitegerant != null)
            {
                using (var ms = new MemoryStream())
                {
                    await dto.Identitegerant.CopyToAsync(ms);
                    existing.Identitegerant = ms.ToArray();
                }
            }

            if (dto.Justificatifedomicile != null)
            {
                using (var ms = new MemoryStream())
                {
                    await dto.Justificatifedomicile.CopyToAsync(ms);
                    existing.Justificatifedomicile = ms.ToArray();
                }
            }

            await _context.SaveChangesAsync();

            // Retourner les informations mises à jour avec les flags hasLogo, etc.
            var result = new
            {
                id = existing.Id,
                nom = existing.Nom,
                adresse = existing.Adresse,
                mf = existing.MF,
                tel = existing.Tel,
                hasLogo = existing.Logo != null && existing.Logo.Length > 0,
                hasRCS = existing.RCS != null && existing.RCS.Length > 0,
                hasIdentitegerant = existing.Identitegerant != null && existing.Identitegerant.Length > 0,
                hasJustificatifedomicile = existing.Justificatifedomicile != null && existing.Justificatifedomicile.Length > 0
            };

            return Ok(result);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteEntreprise(int id)
        {
            int userId = GetUtilisateurId();
            var entreprise = await _context.Entreprises
                .FirstOrDefaultAsync(e => e.Id == id && e.UtilisateurId == userId);

            if (entreprise == null)
                return NotFound("Entreprise non trouvée ou accès interdit.");

            // Vérifier si cette entreprise est définie comme entreprise par défaut pour l'utilisateur
            var utilisateur = await _context.Utilisateurs.FindAsync(userId);
            if (utilisateur != null && utilisateur.DefaultEntrepriseId == id)
            {
                // Supprimer la référence à l'entreprise par défaut
                utilisateur.DefaultEntrepriseId = null;
                await _context.SaveChangesAsync();
            }

            _context.Entreprises.Remove(entreprise);
            await _context.SaveChangesAsync();
            return Ok("Entreprise supprimée avec succès.");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEntreprise(int id)
        {
            int userId = GetUtilisateurId();
            var entreprise = await _context.Entreprises
                .FirstOrDefaultAsync(e => e.Id == id && e.UtilisateurId == userId);

            if (entreprise == null)
                return NotFound("Entreprise non trouvée ou accès interdit.");

            var result = new
            {
                id = entreprise.Id,
                nom = entreprise.Nom,
                adresse = entreprise.Adresse,
                mf = entreprise.MF,
                tel = entreprise.Tel,
                hasLogo = entreprise.Logo != null && entreprise.Logo.Length > 0,
                hasRCS = entreprise.RCS != null && entreprise.RCS.Length > 0,
                hasIdentitegerant = entreprise.Identitegerant != null && entreprise.Identitegerant.Length > 0,
                hasJustificatifedomicile = entreprise.Justificatifedomicile != null && entreprise.Justificatifedomicile.Length > 0
            };

            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllEntreprises()
        {
            try
            {
                Console.WriteLine("Demande de toutes les entreprises");
                int userId = GetUtilisateurId();
                Console.WriteLine($"UserID: {userId}");
                
                var entreprises = await _context.Entreprises
                    .Where(e => e.UtilisateurId == userId)
                    .ToListAsync();

                Console.WriteLine($"Nombre d'entreprises trouvées: {entreprises.Count}");

                var result = entreprises.Select(e => new
                {
                    id = e.Id,
                    nom = e.Nom,
                    adresse = e.Adresse,
                    mf = e.MF,
                    tel = e.Tel,
                    hasLogo = e.Logo != null && e.Logo.Length > 0,
                    hasRCS = e.RCS != null && e.RCS.Length > 0,
                    hasIdentitegerant = e.Identitegerant != null && e.Identitegerant.Length > 0,
                    hasJustificatifedomicile = e.Justificatifedomicile != null && e.Justificatifedomicile.Length > 0
                }).ToList();

                // Si aucune entreprise n'est trouvée, retourner un tableau vide
                if (result.Count == 0)
                {
                    Console.WriteLine("Aucune entreprise trouvée, retour d'un tableau vide");
                    return Ok(new List<object>());
                }

                // Format de réponse standardisé
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERREUR dans GetAllEntreprises: {ex.Message}");
                Console.WriteLine($"STACK TRACE: {ex.StackTrace}");
                return StatusCode(500, new { message = "Erreur lors de la récupération des entreprises", details = ex.Message });
            }
        }

        [HttpPost("{id}/set-default")]
        public async Task<IActionResult> SetDefaultEntreprise(int id)
        {
            int userId = GetUtilisateurId();
            
            // Vérifier si l'entreprise existe et appartient à l'utilisateur
            var entreprise = await _context.Entreprises
                .FirstOrDefaultAsync(e => e.Id == id && e.UtilisateurId == userId);
        
            if (entreprise == null)
                return NotFound("Entreprise non trouvée ou accès interdit.");
        
            // Mettre à jour l'entreprise par défaut de l'utilisateur
            var utilisateur = await _context.Utilisateurs.FindAsync(userId);
            if (utilisateur == null)
                return NotFound("Utilisateur non trouvé.");
        
            utilisateur.DefaultEntrepriseId = id;
            await _context.SaveChangesAsync();
        
            return Ok(new { message = "Entreprise définie comme entreprise par défaut.", defaultEntrepriseId = id });
        }
        [HttpPost("delete-default")]
public async Task<IActionResult> DeleteDefaultEntreprise()
{
    int userId = GetUtilisateurId();

    var utilisateur = await _context.Utilisateurs.FindAsync(userId);
    if (utilisateur == null)
        return NotFound("Utilisateur non trouvé.");

    if (utilisateur.DefaultEntrepriseId == null)
        return BadRequest("Aucune entreprise par défaut à supprimer.");

    utilisateur.DefaultEntrepriseId = null;
    await _context.SaveChangesAsync();

    return Ok(new { message = "Entreprise par défaut supprimée avec succès." });
}

    }
}
