using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/paiement")]
    [Authorize]
    public class PaiementController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaiementController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("ajouter")]
        public async Task<IActionResult> AjouterPaiement([FromBody] PaiementDto dto)
        {
            var utilisateurId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var facture = await _context.Factures
                .Include(f => f.Paiements)
                .FirstOrDefaultAsync(f => f.Id == dto.FactureId && f.UtilisateurId == utilisateurId);

            if (facture == null)
                return NotFound("Facture non trouvée ou accès non autorisé.");

            var totalPaye = facture.Paiements.Sum(p => p.Montant);
            var montantRestant = Math.Round(facture.MontantTotal - totalPaye, 2);

            if (dto.Montant <= 0)
                return BadRequest("Montant invalide.");

            if (dto.Montant > montantRestant)
                return BadRequest($"Le montant payé dépasse le reste à payer ({montantRestant}).");
                
            // Mettre à jour le compte bancaire de l'utilisateur
            var compte = await _context.ComptesBancaires
                .FirstOrDefaultAsync(c => c.UtilisateurId == utilisateurId);
            
            // Vérifier si le compte existe
            if (compte == null)
            {
                return BadRequest("Aucun compte bancaire trouvé pour cet utilisateur.");
            }
            
            // Mettre à jour le solde du compte
            compte.Solde += dto.Montant;
            _context.ComptesBancaires.Update(compte);
            
            // Création du paiement avec le CompteBancaireId correctement défini
            var paiement = new Paiement
            {
                FactureId = dto.FactureId,
                Montant = dto.Montant,
                DatePaiement = dto.DatePaiement,
                ModePaiement = dto.ModePaiement,
                Type = dto.Type,
                Description = dto.Description,
                UtilisateurId = utilisateurId,
                CompteBancaireId = compte.Id
            };

            _context.Paiements.Add(paiement);
            
            // Mise à jour de l'état de la facture
            var totalPayeMisAJour = totalPaye + dto.Montant; // Calculer le nouveau total sans faire de requête supplémentaire
            
            if (totalPayeMisAJour >= facture.MontantTotal)
            {
                facture.EstPayee = true;
                paiement.Description = $"Facture numéro {facture.NumFacture} payée";
            }
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Paiement enregistré avec succès." });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPaiements()
        {
            var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var paiementes = await _context.Paiements
            .Where(f => f.UtilisateurId == utilisateurId)
            .Include(f => f.Facture) //  ici tu peux inclure la facture liée si tu veux
            .ToListAsync();


            return Ok(paiementes);
        }

        private int GetUtilisateurId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        }


        public class PaiementDto
        {
            public int FactureId { get; set; }
            public decimal Montant { get; set; }
            public DateTime DatePaiement { get; set; }
            public string ModePaiement { get; set; } = "";
            public TypeTransaction Type { get; set; }          
            public string Description { get; set; } = "";      
        }

    }
}
