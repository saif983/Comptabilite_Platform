using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/paiement")]
    [Authorize]
    public class PaiementController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PaiementController> _logger;

        public PaiementController(AppDbContext context, ILogger<PaiementController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Méthode utilitaire pour gérer les erreurs de conversion décimale
        private decimal SafeDecimal(object value, decimal defaultValue = 0)
        {
            if (value == null)
                return defaultValue;

            try
            {
                if (value is decimal decVal)
                    return decVal;

                return Convert.ToDecimal(value);
            }
            catch
            {
                _logger.LogWarning($"Impossible de convertir la valeur '{value}' en décimal. Utilisation de la valeur par défaut {defaultValue}.");
                return defaultValue;
            }
        }

        // Méthode utilitaire spécifique pour parser les chaînes décimales
        private decimal ParseDecimal(string input)
        {
            if (string.IsNullOrEmpty(input))
                return 0;

            // Remplacer le point par la virgule pour s'assurer de la compatibilité avec la culture française
            string normalizedValue = input.Replace('.', ',');
            
            // Essayer d'abord avec la culture invariante
            if (decimal.TryParse(input, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var result))
                return result;
            
            // Essayer ensuite avec la culture française (virgule comme séparateur décimal)
            if (decimal.TryParse(normalizedValue, out result))
                return result;
            
            // Si tout échoue, utiliser la conversion sécurisée
            return SafeDecimal(input);
        }

        [HttpPost("ajouter")]
        public async Task<IActionResult> AjouterPaiement([FromBody] PaiementDto dto)
        {
            try
            {
                _logger.LogInformation($"Début de l'ajout d'un paiement. FactureId: {dto.FactureId}, Montant: {dto.Montant}");
                
                var utilisateurId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
                _logger.LogInformation($"UtilisateurId: {utilisateurId}");

                // Utiliser une requête SQL directe pour éviter les problèmes de decimal overflow
                var factureQuery = await _context.Factures
                    .Where(f => f.Id == dto.FactureId && f.UtilisateurId == utilisateurId)
                    .Select(f => new
                    {
                        f.Id,
                        f.NumFacture,
                        f.EstPayee,
                        MontantTotalStr = f.MontantTotal.ToString(),
                        Paiements = f.Paiements.Select(p => new
                        {
                            MontantStr = p.Montant.ToString()
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (factureQuery == null)
                    return NotFound("Facture non trouvée ou accès non autorisé.");
                
                _logger.LogInformation($"Facture trouvée. MontantTotal: {factureQuery.MontantTotalStr}");

                // Conversion sécurisée des valeurs avec ParseDecimal
                var montantTotal = ParseDecimal(factureQuery.MontantTotalStr);
                
                decimal totalPaye = 0;
                foreach (var paiementItem in factureQuery.Paiements)
                {
                    totalPaye += ParseDecimal(paiementItem.MontantStr);
                }

                _logger.LogInformation($"Montant total de la facture: {montantTotal}, Total déjà payé: {totalPaye}");
                var montantRestant = Math.Round(montantTotal - totalPaye, 2);
                _logger.LogInformation($"Montant restant à payer: {montantRestant}");

                if (dto.Montant <= 0)
                    return BadRequest("Montant invalide.");

                if (dto.Montant > montantRestant)
                    return BadRequest($"Le montant payé dépasse le reste à payer ({montantRestant}).");
                    
                // Récupérer seulement l'ID du compte pour éviter les problèmes de decimal
                var compteInfo = await _context.ComptesBancaires
                    .Where(c => c.UtilisateurId == utilisateurId)
                    .Select(c => new { c.Id, SoldeStr = c.Solde.ToString() })
                    .FirstOrDefaultAsync();
                
                // Vérifier si le compte existe
                if (compteInfo == null)
                {
                    return BadRequest("Aucun compte bancaire trouvé pour cet utilisateur.");
                }
                
                _logger.LogInformation($"Compte bancaire trouvé. ID: {compteInfo.Id}, Solde: {compteInfo.SoldeStr}");
                
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
                    CompteBancaireId = compteInfo.Id
                };

                _context.Paiements.Add(paiement);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Paiement créé avec succès. ID: {paiement.Id}");
                
                // Mise à jour de l'état de la facture et du solde du compte avec des requêtes SQL directes
                var totalPayeMisAJour = totalPaye + dto.Montant; // Calculer le nouveau total sans faire de requête supplémentaire
                
                // Mise à jour du solde du compte via SQL direct
                await _context.Database.ExecuteSqlRawAsync(
                    @"UPDATE ""ComptesBancaires"" SET ""Solde"" = ""Solde"" + {0} WHERE ""Id"" = {1}",
                    dto.Montant, compteInfo.Id);
                
                _logger.LogInformation($"Solde du compte bancaire mis à jour. Nouveau solde: Solde précédent + {dto.Montant}");
                
                // Mise à jour de l'état de la facture si elle est maintenant complètement payée
                if (totalPayeMisAJour >= montantTotal)
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        @"UPDATE ""Factures"" SET ""EstPayee"" = true WHERE ""Id"" = {0}",
                        dto.FactureId);
                    
                    // Mise à jour de la description du paiement
                    string nouvelleDescription = $"Facture numéro {factureQuery.NumFacture} payée";
                    await _context.Database.ExecuteSqlRawAsync(
                        @"UPDATE ""Paiements"" SET ""Description"" = {0} WHERE ""Id"" = {1}",
                        nouvelleDescription, paiement.Id);
                    
                    _logger.LogInformation($"Facture marquée comme payée.");
                }

                return Ok(new { message = "Paiement enregistré avec succès." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du paiement");
                return StatusCode(500, $"Erreur serveur: {ex.Message}");
            }
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

        [HttpGet("{factureId}/reste-a-payer")]
        public async Task<IActionResult> GetMontantResteAPayer(int factureId)
        {
            try
            {
                var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Récupérer la facture et ses paiements avec protection contre les overflow decimals
                var factureQuery = await _context.Factures
                    .Where(f => f.Id == factureId && f.UtilisateurId == utilisateurId)
                    .Select(f => new
                    {
                        f.Id,
                        MontantTotalStr = f.MontantTotal.ToString(),
                        f.EstPayee,
                        f.Date,
                        Paiements = f.Paiements.Select(p => new
                        {
                            MontantStr = p.Montant.ToString()
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (factureQuery == null)
                    return NotFound("Facture non trouvée.");

                // Conversion sécurisée des valeurs avec ParseDecimal
                var montantTotal = ParseDecimal(factureQuery.MontantTotalStr);
                
                decimal totalPaye = 0;
                foreach (var paiementItem in factureQuery.Paiements)
                {
                    totalPaye += ParseDecimal(paiementItem.MontantStr);
                }

                var reste = Math.Round(montantTotal - totalPaye, 2);
                bool alerte = !factureQuery.EstPayee && (DateTime.UtcNow - factureQuery.Date).TotalDays > 10;

                return Ok(new
                {
                    FactureId = factureQuery.Id,
                    MontantTotal = montantTotal,
                    TotalPaye = totalPaye,
                    MontantRestant = reste,
                    EstPayee = factureQuery.EstPayee,
                    Alerte = alerte ? "⏰ Facture impayée depuis plus de 10 jours !" : null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du montant restant à payer");
                return StatusCode(500, $"Erreur serveur: {ex.Message}");
            }
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
