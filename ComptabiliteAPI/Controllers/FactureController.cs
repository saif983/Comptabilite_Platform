using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ComptabiliteAPI.Utils;
using System.Diagnostics;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/facture")]
    [Authorize]
    public class FactureController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FactureController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateFacture([FromBody] CreateFactureDto dto)
        {
            if (dto == null || dto.ProduitsServices == null || !dto.ProduitsServices.Any())
                return BadRequest("Facture invalide. Aucun produit/service fourni.");

            var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var compte = await _context.ComptesBancaires
                .FirstOrDefaultAsync(c => c.UtilisateurId == utilisateurId);

            if (compte == null)
                return BadRequest("Aucun compte bancaire associé à l'utilisateur.");

            if (dto.EstPayee && string.IsNullOrWhiteSpace(dto.ModePaiement))
                return BadRequest("Mode de paiement requis si la facture est marquée comme payée.");

            var entreprise = await _context.Entreprises
                .FirstOrDefaultAsync(e => e.Id == dto.EntrepriseId && e.UtilisateurId == utilisateurId);

            if (entreprise == null)
                return Forbid("Cette entreprise ne vous appartient pas ou n'existe pas.");
            // Récupère le dernier numéro de facture pour cette entreprise
            var dernierNumFacture = await _context.Factures
                .Where(f => f.EntrepriseId == entreprise.Id)
                .OrderByDescending(f => f.Id)
                .Select(f => f.NumFacture)
                .FirstOrDefaultAsync();

            // Vérifie si aucune facture n'existe pour cette entreprise
            int nouveauNumero = 1;
            if (!string.IsNullOrEmpty(dernierNumFacture) && int.TryParse(dernierNumFacture, out var num))
            {
                nouveauNumero = num + 1;
            }

            var facture = new Facture
            {
                NumFacture = nouveauNumero.ToString(),
                Date = dto.Date,
                EstPayee = dto.EstPayee,
                EntrepriseId = entreprise.Id,
                UtilisateurId = utilisateurId,
                NomClient = dto.NomClient,
                AdressClient = dto.AdressClient,
                TelClient = dto.TelClient,
                CinClient = dto.CinClient
            };


            _context.Factures.Add(facture);
            await _context.SaveChangesAsync();

            decimal montantTotal = 0;
            decimal THT = 0;

            foreach (var item in dto.ProduitsServices)
            {
                var produit = await _context.ProduitServices
                    .FirstOrDefaultAsync(p => p.Id == item.ProduitServiceId && p.UtilisateurId == utilisateurId);

                if (produit == null)
                    return Forbid($"Produit/service ID {item.ProduitServiceId} introuvable ou non autorisé.");

                decimal ht = produit.PrixUnitaire * item.Quantite;
                decimal ttc = ht * (1 + produit.TVA / 100);

                montantTotal += ttc;
                THT += ht;

                _context.FactureDetails.Add(new FactureDetail
                {
                    FactureId = facture.Id,
                    ProduitServiceId = produit.Id,
                    TTC = ttc,
                    HT = ht,
                    Quantite = item.Quantite
                });
            }

            facture.MontantTotal = montantTotal;
            facture.THT = THT;

            if (dto.EstPayee)
            {
                var paiement = new Paiement
                {
                    FactureId = facture.Id,
                    Montant = montantTotal,
                    DatePaiement = DateTime.UtcNow,
                    ModePaiement = dto.ModePaiement!,
                    Type = TypeTransaction.Actif,
                    Description = $"Facture numéro {facture.NumFacture} payée",
                    UtilisateurId = utilisateurId,
                    CompteBancaireId = compte.Id
                };

                _context.Paiements.Add(paiement);
                compte.Solde += montantTotal;
                _context.ComptesBancaires.Update(compte);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Facture créée avec succès", factureId = facture.Id });
        }

        [HttpGet("{factureId}/reste-a-payer")]
        public async Task<IActionResult> GetMontantResteAPayer(int factureId)
        {
            var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var facture = await _context.Factures
                .Include(f => f.Paiements)
                .FirstOrDefaultAsync(f => f.Id == factureId && f.UtilisateurId == utilisateurId);

            if (facture == null)
                return NotFound("Facture non trouvée.");

            var totalPaye = facture.Paiements.Sum(p => p.Montant);
            var reste = Math.Round(facture.MontantTotal - totalPaye, 2);

            bool alerte = !facture.EstPayee && (DateTime.UtcNow - facture.Date).TotalDays > 10;

            return Ok(new
            {
                FactureId = facture.Id,
                MontantTotal = facture.MontantTotal,
                TotalPaye = totalPaye,
                MontantRestant = reste,
                EstPayee = facture.EstPayee,
                Alerte = alerte ? "⏰ Facture impayée depuis plus de 10 jours !" : null
            });
        }

        [HttpGet("by-entreprise")]
        public async Task<IActionResult> GetFacturesParEntreprise([FromQuery] int entrepriseId)
        {
            var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var factures = await _context.Factures
                .Where(f => f.UtilisateurId == utilisateurId && f.EntrepriseId == entrepriseId)
                .Include(f => f.FactureDetails)
                    .ThenInclude(fd => fd.ProduitService) // pour avoir le nom/prix du produit
                .Include(f => f.Paiements)
                .ToListAsync();

            return Ok(factures);
        }
        [HttpPost("importer-pdf")]
        public async Task<IActionResult> ImporterFactureDepuisPdf(IFormFile file)
        {
            // Declare and initialize utilisateurId early
            var utilisateurId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(utilisateurId))
                return Unauthorized("Utilisateur non identifié.");

            var compte = await _context.ComptesBancaires
                .FirstOrDefaultAsync(c => c.UtilisateurId == int.Parse(utilisateurId));

            if (file == null || file.Length == 0)
                return BadRequest("Aucun fichier n'a été envoyé.");

            try
            {
                var scriptPath = Path.Combine("Scripts", "import_facture.py");

                var psi = new ProcessStartInfo
                {
                    FileName = "python", // ou "python3" selon ton environnement
                    Arguments = $"\"{scriptPath}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                psi.Environment["UTILISATEUR_ID"] = utilisateurId;
                var tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.pdf");
                using (var stream = new FileStream(tempPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                psi.Arguments = $"\"{scriptPath}\" \"{tempPath}\"";

                using var process = Process.Start(psi);
                var output = process.StandardOutput.ReadToEnd();
                var errors = process.StandardError.ReadToEnd();
                process.WaitForExit();

                if (process.ExitCode != 0)
                {
                    return StatusCode(500, $"Erreur lors de l'importation de la facture.\n{errors}");
                }

                return Ok(new { message = "📄 Importation réussie", output });

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Exception: {ex.Message}");
            }
        }


        // DTOs
        public class CreateFactureDto
        {
            public string NumFacture { get; set; }
            public DateTime Date { get; set; }
            public bool EstPayee { get; set; }
            public int EntrepriseId { get; set; }
            public List<FactureDetailDto> ProduitsServices { get; set; }
            public string? ModePaiement { get; set; }

            public string NomClient { get; set; } = string.Empty;
            public string AdressClient { get; set; } = string.Empty;
            public string TelClient { get; set; } = string.Empty;
            public string CinClient { get; set; } = string.Empty;
        }

        public class FactureDetailDto
        {
            public int ProduitServiceId { get; set; }
            public int Quantite { get; set; }
        }
    }
}
