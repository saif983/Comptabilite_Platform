using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using System.Linq;
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/devis")]
    [Authorize]
    public class DevisController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DevisController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPut("update-status/{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateDevisStatusDto dto)
        {
            try
            {
                var devis = await _context.Devis.FindAsync(id);

                if (devis == null)
                    return NotFound(new { message = $"Devis avec ID {id} non trouvé" });

                devis.Statut = dto.Statut;

                await _context.SaveChangesAsync();

                return Ok(new { message = $"Statut du devis mis à jour avec succès", devis });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur lors de la mise à jour du statut: {ex.Message}" });
            }
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateDevis([FromBody] CreateDevisDto dto)
        {
            if (dto == null || dto.ProduitsServices == null || !dto.ProduitsServices.Any())
                return BadRequest("Devis invalide. Aucun produit/service fourni.");

            var entreprise = await _context.Entreprises.FindAsync(dto.EntrepriseId);
            if (entreprise == null)
                return Forbid("Cette entreprise ne vous appartient pas ou n'existe pas.");

            // Génération du prochain numéro de devis
            var dernierNumDevis = await _context.Devis
                .Where(d => d.EntrepriseId == entreprise.Id)
                .OrderByDescending(d => d.Id)
                .Select(d => d.NumDevis)
                .FirstOrDefaultAsync();

            int nouveauNumero = 1;
            if (!string.IsNullOrEmpty(dernierNumDevis) && int.TryParse(dernierNumDevis, out var dernierNumero))
            {
                nouveauNumero = dernierNumero + 1;
            }

            var devis = new Devis
            {
                NumDevis = nouveauNumero.ToString(),
                Date = dto.Date,
                EntrepriseId = dto.EntrepriseId,
                Statut = "En attente"
            };

            _context.Devis.Add(devis);
            await _context.SaveChangesAsync();

            decimal montantTotal = 0;

            foreach (var item in dto.ProduitsServices)
            {
                var produit = await _context.ProduitServices.FirstOrDefaultAsync(p => p.Id == item.ProduitServiceId);
                if (produit == null)
                    return NotFound($"Produit/Service avec ID {item.ProduitServiceId} non trouvé.");

                var prixTotal = item.Quantite * produit.PrixUnitaire * (1 + produit.TVA / 100);
                montantTotal += prixTotal;

                var detail = new DevisDetail
                {
                    DevisId = devis.Id,
                    ProduitServiceId = produit.Id,
                    Quantite = item.Quantite,
                };

                _context.DevisDetails.Add(detail);
            }

            devis.MontantTotal = montantTotal;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Devis créé avec succès", DevisId = devis.Id });
        }

        [HttpGet("by-entreprise")]
        public async Task<IActionResult> GetDevisParEntreprise([FromQuery] int entrepriseId)
        {
            var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var devisList = await _context.Devis
                .Where(d => d.EntrepriseId == entrepriseId)
                .Include(d => d.DevisDetails)
                    .ThenInclude(detail => detail.ProduitService)
                .ToListAsync();

            return Ok(devisList);
        }

        public class CreateDevisDto
        {
            public string NumDevis { get; set; }
            public DateTime Date { get; set; }
            public int EntrepriseId { get; set; }
            public List<DevisDetailDto> ProduitsServices { get; set; }
        }

        public class DevisDetailDto
        {
            public int ProduitServiceId { get; set; }
            public int Quantite { get; set; }
        }
        public class UpdateDevisStatusDto
        {
            
            public string Statut { get; set; }
        }
    }
}
