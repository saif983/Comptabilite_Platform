using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ComptabiliteAPI.Models;
using ComptabiliteAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace ComptabiliteAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DepenseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DepenseController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> AjouterDepense([FromBody] Depense depense)
        {
            if (depense == null || depense.Montant <= 0)
                return BadRequest("Données de dépense invalides.");

            int utilisateurId = GetUtilisateurId();
            // Associer la dépense à l'utilisateur actuel (fonctionnalité SaaS)
            depense.UtilisateurId = utilisateurId;

            // Récupérer le compte bancaire du user
            var compte = await _context.ComptesBancaires
                                .FirstOrDefaultAsync(c => c.UtilisateurId == utilisateurId);

            if (compte == null)
                return BadRequest("Aucun compte bancaire associé à l'utilisateur.");

            if (compte.Solde < depense.Montant)
                return BadRequest("Solde insuffisant pour effectuer cette dépense.");

            // Déduire le montant du solde
            compte.Solde -= depense.Montant;
            _context.ComptesBancaires.Update(compte);

            // Enregistrer la dépense
            depense.Date = depense.Date.ToUniversalTime(); // Assurer la cohérence des dates
            _context.Depenses.Add(depense);
            
            // Créer un paiement automatique de type passif
            var paiement = new Paiement
            {
                Montant = depense.Montant,
                DatePaiement = depense.Date,
                ModePaiement = "Espèce", // Peut être paramétré selon le type de dépense
                Type = TypeTransaction.Passif,
                Description = $"Paiement au fournisseur {depense.Fournisseur} de montant {depense.Montant} DT",
                UtilisateurId = utilisateurId,
                FactureId = null, // Ne pas associer à une facture spécifique
                CompteBancaireId = compte.Id
            };

            _context.Paiements.Add(paiement);

            // Sauvegarder toutes les modifications dans une seule transaction
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Dépense enregistrée, paiement effectué et solde mis à jour",
                depense,
                paiement,
                nouveauSolde = compte.Solde
            });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetDepenses()
        {
            int utilisateurId = GetUtilisateurId();
            
            // Filtrer les dépenses par utilisateur (fonctionnalité SaaS)
            var depenses = await _context.Depenses
                                 .Where(d => d.UtilisateurId == utilisateurId) // Sécurisation multi-tenant
                                 .OrderByDescending(d => d.Date)
                                 .ToListAsync();

            return Ok(depenses);
        }

        // Récupérer l'ID de l'utilisateur connecté via JWT
        private int GetUtilisateurId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(claim!.Value);
        }
    }
}
