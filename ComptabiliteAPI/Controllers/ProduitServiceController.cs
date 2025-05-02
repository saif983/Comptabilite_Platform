using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json.Serialization;
using System.Security.Claims;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/ProduitService")]
    [Authorize]
    public class ProduitServiceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProduitServiceController(AppDbContext context)
        {
            _context = context;
        }

        // 🔐 Récupérer l'ID de l'utilisateur connecté
        private int GetUtilisateurId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(claim.Value);
        }

        // ✅ Créer un nouveau produit ou service
        [HttpPost("create")]
        public async Task<IActionResult> CreateProduitService([FromBody] ProduitService produitService)
        {
            if (string.IsNullOrEmpty(produitService.Nom) || produitService.PrixUnitaire <= 0)
            {
                return BadRequest("Tous les champs sont obligatoires.");
            }

            // Vérifier que l'entreprise appartient à l'utilisateur
            int utilisateurId = GetUtilisateurId();
            var entreprise = await _context.Entreprises
                .FirstOrDefaultAsync(e => e.Id == produitService.EntrepriseId && e.UtilisateurId == utilisateurId);

            if (entreprise == null)
            {
                return BadRequest("Entreprise invalide ou vous n'avez pas accès à cette entreprise.");
            }

            produitService.UtilisateurId = utilisateurId;

            _context.ProduitServices.Add(produitService);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduitService), new { id = produitService.Id }, produitService);
        }

        // ✅ Obtenir un produit/service par ID (appartenant à l'utilisateur)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduitService(int id)
        {
            var utilisateurId = GetUtilisateurId();

            var produitService = await _context.ProduitServices
                .FirstOrDefaultAsync(p => p.Id == id && p.UtilisateurId == utilisateurId);

            if (produitService == null)
            {
                return NotFound("Produit ou Service non trouvé.");
            }

            return Ok(produitService);
        }

        // ✅ Obtenir tous les produits/services de l'utilisateur connecté
        [HttpGet("all")]
        public async Task<IActionResult> GetAllProduitServices()
        {
            var utilisateurId = GetUtilisateurId();

            var produitsServices = await _context.ProduitServices
                .Where(p => p.UtilisateurId == utilisateurId)
                .ToListAsync();

            return Ok(produitsServices);
        }

        // ✅ Obtenir tous les produits/services d'une entreprise
        [HttpGet("entreprise/{entrepriseId}")]
        public async Task<IActionResult> GetProduitServicesByEntreprise(int entrepriseId)
        {
            var utilisateurId = GetUtilisateurId();

            // Vérifier que l'entreprise appartient à l'utilisateur
            var entreprise = await _context.Entreprises
                .FirstOrDefaultAsync(e => e.Id == entrepriseId && e.UtilisateurId == utilisateurId);

            if (entreprise == null)
            {
                return BadRequest("Entreprise invalide ou vous n'avez pas accès à cette entreprise.");
            }

            var produitsServices = await _context.ProduitServices
                .Where(p => p.EntrepriseId == entrepriseId && p.UtilisateurId == utilisateurId)
                .ToListAsync();

            return Ok(produitsServices);
        }

        // ✅ Modifier un produit/service (si c'est le sien)
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateProduitService(int id, [FromBody] ProduitService updatedProduitService)
        {
            var utilisateurId = GetUtilisateurId();

            var produitService = await _context.ProduitServices
                .FirstOrDefaultAsync(p => p.Id == id && p.UtilisateurId == utilisateurId);

            if (produitService == null)
            {
                return NotFound("Produit ou Service non trouvé.");
            }

            // Vérifier que l'entreprise appartient à l'utilisateur si elle est modifiée
            if (updatedProduitService.EntrepriseId != produitService.EntrepriseId)
            {
                var entreprise = await _context.Entreprises
                    .FirstOrDefaultAsync(e => e.Id == updatedProduitService.EntrepriseId && e.UtilisateurId == utilisateurId);

                if (entreprise == null)
                {
                    return BadRequest("Entreprise invalide ou vous n'avez pas accès à cette entreprise.");
                }
                
                produitService.EntrepriseId = updatedProduitService.EntrepriseId;
            }

            produitService.Nom = updatedProduitService.Nom;
            produitService.PrixUnitaire = updatedProduitService.PrixUnitaire;
            produitService.TVA = updatedProduitService.TVA;

            await _context.SaveChangesAsync();

            return Ok(produitService);
        }

        // ✅ Supprimer un produit/service (si c'est le sien)
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteProduitService(int id)
        {
            var utilisateurId = GetUtilisateurId();

            var produitService = await _context.ProduitServices
                .FirstOrDefaultAsync(p => p.Id == id && p.UtilisateurId == utilisateurId);

            if (produitService == null)
            {
                return NotFound("Produit ou Service non trouvé.");
            }

            _context.ProduitServices.Remove(produitService);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Produit ou Service supprimé avec succès." });
        }
    }
}
