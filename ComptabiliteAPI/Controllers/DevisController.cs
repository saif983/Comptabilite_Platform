using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using System.Linq;
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DevisController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DevisController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateDevis([FromBody] CreateDevisDto dto)
        {
            if (dto == null || dto.ProduitsServices == null || !dto.ProduitsServices.Any())
                return BadRequest("Devis invalide. Aucun produit/service fourni.");

            // Vérification de l'entreprise
            var entreprise = await _context.Entreprises.FindAsync(dto.EntrepriseId);
            if (entreprise == null)
                return NotFound($"Entreprise avec ID {dto.EntrepriseId} non trouvée.");

            var devis = new Devis
            {
                NumDevis = dto.NumDevis,
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

        public class CreateDevisDto
        {
            public int NumDevis { get; set; }
            public DateTime Date { get; set; }
            public int EntrepriseId { get; set; }
            public List<DevisDetailDto> ProduitsServices { get; set; }
        }

        public class DevisDetailDto
        {
            public int ProduitServiceId { get; set; }
            public int Quantite { get; set; }
        }
    }
}
