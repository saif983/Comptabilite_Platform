using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ComptabiliteAPI.Utils;
using System.Diagnostics;
using System.IO;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/facture")]
    [Authorize]
    public class FactureController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<FactureController> _logger;

        public FactureController(AppDbContext context, ILogger<FactureController> logger)
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

        [HttpPost("create")]
        public async Task<IActionResult> CreateFacture([FromBody] CreateFactureDto dto)
        {
            try
            {
                if (dto == null || dto.ProduitsServices == null || !dto.ProduitsServices.Any())
                    return BadRequest("Facture invalide. Aucun produit/service fourni.");

                var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Récupérer seulement l'ID du compte pour éviter les problèmes de decimal
                var compteId = await _context.ComptesBancaires
                    .Where(c => c.UtilisateurId == utilisateurId)
                    .Select(c => c.Id)
                    .FirstOrDefaultAsync();

                if (compteId == 0)
                    return BadRequest("Aucun compte bancaire associé à l'utilisateur.");

                if (dto.EstPayee && string.IsNullOrWhiteSpace(dto.ModePaiement))
                    return BadRequest("Mode de paiement requis si la facture est marquée comme payée.");

                var entreprise = await _context.Entreprises
                    .Where(e => e.Id == dto.EntrepriseId && e.UtilisateurId == utilisateurId)
                    .Select(e => new { e.Id })
                    .FirstOrDefaultAsync();

                if (entreprise == null)
                    return Forbid("Cette entreprise ne vous appartient pas ou n'existe pas.");

                // Récupérer le dernier numéro de facture pour cette entreprise
                var dernierNumFacture = await _context.Factures
                    .Where(f => f.EntrepriseId == entreprise.Id)
                    .OrderByDescending(f => f.Id)
                    .Select(f => f.NumFacture)
                    .FirstOrDefaultAsync();

                // Vérifier si aucune facture n'existe pour cette entreprise
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
                    CinClient = dto.CinClient,
                    MontantTotal = 0, // Sera mis à jour après
                    THT = 0           // Sera mis à jour après
                };

                _context.Factures.Add(facture);
                await _context.SaveChangesAsync();

                decimal montantTotal = 0;
                decimal tht = 0;

                foreach (var item in dto.ProduitsServices)
                {
                    // Récupérer le produit sans conversion en string pour éviter les problèmes
                    var produit = await _context.ProduitServices
                        .Where(p => p.Id == item.ProduitServiceId && p.UtilisateurId == utilisateurId)
                        .Select(p => new
                        {
                            p.Id,
                            p.PrixUnitaire,
                            p.TVA
                        })
                        .FirstOrDefaultAsync();

                    if (produit == null)
                        return Forbid($"Produit/service ID {item.ProduitServiceId} introuvable ou non autorisé.");

                    _logger.LogInformation($"Produit trouvé: ID={produit.Id}, PrixUnitaire={produit.PrixUnitaire}, TVA={produit.TVA}");

                    // Calcul direct des montants sans conversion
                    decimal ht = produit.PrixUnitaire * item.Quantite;
                    decimal ttc = ht * (1 + produit.TVA / 100);

                    _logger.LogInformation($"Calcul: HT={ht}, TTC={ttc}");
                    
                    montantTotal += ttc;
                    tht += ht;

                    var factureDetail = new FactureDetail
                    {
                        FactureId = facture.Id,
                        ProduitServiceId = produit.Id,
                        TTC = ttc,
                        HT = ht,
                        Quantite = item.Quantite
                    };

                    _context.FactureDetails.Add(factureDetail);
                }

                await _context.SaveChangesAsync();

                // Mise à jour directe de la facture avec SQL brut pour garantir précision
                await _context.Database.ExecuteSqlRawAsync(
                    @"UPDATE ""Factures"" SET ""MontantTotal"" = {0}, ""THT"" = {1} WHERE ""Id"" = {2}",
                    montantTotal, tht, facture.Id);

                // Vérifier que la mise à jour a bien fonctionné
                var factureVerif = await _context.Factures
                    .Where(f => f.Id == facture.Id)
                    .Select(f => new { f.MontantTotal, f.THT })
                    .FirstOrDefaultAsync();

                _logger.LogInformation($"Facture après mise à jour: MontantTotal={factureVerif.MontantTotal}, THT={factureVerif.THT}");

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
                        CompteBancaireId = compteId
                    };

                    _context.Paiements.Add(paiement);

                    // Mettre à jour le solde du compte via SQL direct
                    await _context.Database.ExecuteSqlRawAsync(
                        @"UPDATE ""ComptesBancaires"" SET ""Solde"" = ""Solde"" + {0} WHERE ""Id"" = {1}",
                        montantTotal, compteId);
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Facture créée avec succès", factureId = facture.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la facture");
                return StatusCode(500, $"Erreur serveur: {ex.Message}");
            }
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

                // Conversion sécurisée des valeurs
                decimal.TryParse(factureQuery.MontantTotalStr, out var montantTotal);
                
                decimal totalPaye = 0;
                foreach (var paiement in factureQuery.Paiements)
                {
                    if (decimal.TryParse(paiement.MontantStr, out var montantPaiement))
                    {
                        totalPaye += montantPaiement;
                    }
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

        [HttpGet("by-entreprise")]
        public async Task<IActionResult> GetFacturesParEntreprise([FromQuery] int entrepriseId)
        {
            try
            {
                var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Récupérer les IDs des factures d'abord
                var factureIds = await _context.Factures
                    .Where(f => f.UtilisateurId == utilisateurId && f.EntrepriseId == entrepriseId)
                    .Select(f => f.Id)
                    .ToListAsync();

                if (!factureIds.Any())
                {
                    return Ok(new List<object>());
                }

                // Construire une liste de factures sécurisée
                List<object> facturesList = new List<object>();

                foreach (var id in factureIds)
                {
                    try
                    {
                        // Log pour le débogage
                        _logger.LogInformation($"Récupération de la facture ID: {id}");
                        
                        // Récupération directe des informations via SQL pour éviter les problèmes de conversion
                        var factureQuery = @"
                            SELECT 
                                f.""Id"", f.""NumFacture"", f.""Date"", f.""EstPayee"", 
                                f.""EntrepriseId"", f.""MontantTotal"", f.""THT"", 
                                f.""NomClient"", f.""AdressClient"", f.""TelClient"", f.""CinClient""
                            FROM ""Factures"" f
                            WHERE f.""Id"" = {0}";
                        
                        var factureData = await _context.Factures
                            .Where(f => f.Id == id)
                            .Select(f => new
                            {
                                f.Id,
                                f.NumFacture,
                                f.Date,
                                f.EstPayee,
                                f.EntrepriseId,
                                MontantTotal = f.MontantTotal,  // Utiliser directement les valeurs décimales
                                THT = f.THT,                    // sans conversion en string
                                f.NomClient,
                                f.AdressClient,
                                f.TelClient,
                                f.CinClient,
                                Details = f.FactureDetails.Select(fd => new
                                {
                                    fd.Id,
                                    fd.ProduitServiceId,
                                    NomProduit = fd.ProduitService.Nom,
                                    fd.Quantite,
                                    HT = fd.HT,                // Utiliser directement les valeurs décimales
                                    TTC = fd.TTC               // sans conversion en string
                                }).ToList(),
                                Paiements = f.Paiements.Select(p => new
                                {
                                    p.Id,
                                    Montant = p.Montant,       // Utiliser directement les valeurs décimales
                                    p.DatePaiement,
                                    p.ModePaiement
                                }).ToList()
                            })
                            .AsNoTracking()
                            .FirstOrDefaultAsync();

                        if (factureData != null)
                        {
                            _logger.LogInformation($"Facture {id} trouvée. MontantTotal: {factureData.MontantTotal}, THT: {factureData.THT}");
                            
                            // Ajouter directement à la liste sans conversion supplémentaire
                            facturesList.Add(factureData);
                        }
                        else
                        {
                            _logger.LogWarning($"Facture {id} non trouvée dans la base de données.");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Erreur lors de la récupération de la facture ID {id}");
                        // Continuer avec les autres factures
                    }
                }

                return Ok(facturesList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des factures");
                return StatusCode(500, $"Erreur serveur: {ex.Message}");
            }
        }

        [HttpPost("importer-pdf")]
        public async Task<IActionResult> ImporterFactureDepuisPdf(IFormFile file)
        {
            try 
            {
                // Declare and initialize utilisateurId early
                var utilisateurId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(utilisateurId))
                    return Unauthorized("Utilisateur non identifié.");

                if (file == null || file.Length == 0)
                    return BadRequest("Aucun fichier n'a été envoyé.");

                _logger.LogInformation($"Début d'importation de facture pour l'utilisateur {utilisateurId}, taille du fichier: {file.Length} octets");

                // Récupérer le compte bancaire de façon sécurisée
                int? compteBancaireId = null;
                decimal solde = 0;

                try
                {
                    // Utiliser une requête plus simple qui évite le problème de décimal
                    var compteInfo = await _context.ComptesBancaires
                        .Where(c => c.UtilisateurId == int.Parse(utilisateurId))
                        .Select(c => new { c.Id, SoldeString = c.Solde.ToString() })
                        .AsNoTracking()
                        .FirstOrDefaultAsync();

                    if (compteInfo != null)
                    {
                        compteBancaireId = compteInfo.Id;
                        decimal.TryParse(compteInfo.SoldeString, out solde);
                        _logger.LogInformation($"Compte bancaire trouvé: ID={compteBancaireId}, Solde={solde}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erreur lors de la récupération du compte bancaire");
                    // Continuons en utilisant une méthode alternative
                }

                // Si la première méthode échoue, essayons une approche alternative
                if (!compteBancaireId.HasValue)
                {
                    try
                    {
                        _logger.LogInformation("Tentative alternative de récupération du compte bancaire");
                        // Requête SQL directe via Dapper ou ADO.NET si nécessaire
                        var compteIdFromDb = await _context.ComptesBancaires
                            .Where(c => c.UtilisateurId == int.Parse(utilisateurId))
                            .Select(c => c.Id)
                            .FirstOrDefaultAsync();

                        compteBancaireId = compteIdFromDb;
                        _logger.LogInformation($"Compte bancaire trouvé (méthode alternative): ID={compteBancaireId}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Échec de la récupération alternative du compte bancaire");
                        return StatusCode(500, "Impossible d'accéder au compte bancaire. Veuillez contacter l'administrateur.");
                    }
                }

                if (!compteBancaireId.HasValue)
                {
                    _logger.LogWarning("Aucun compte bancaire trouvé pour l'utilisateur {UtilisateurId}", utilisateurId);
                    return BadRequest("Aucun compte bancaire associé à l'utilisateur.");
                }

                // Récupérer l'entreprise par défaut de l'utilisateur
                var defaultEntrepriseId = await _context.Utilisateurs
                    .Where(u => u.Id == int.Parse(utilisateurId))
                    .Select(u => u.DefaultEntrepriseId)
                    .FirstOrDefaultAsync();

                if (!defaultEntrepriseId.HasValue)
                {
                    _logger.LogWarning($"Aucune entreprise par défaut trouvée pour l'utilisateur {utilisateurId}");
                    return BadRequest("Aucune entreprise par défaut trouvée. Veuillez définir une entreprise par défaut dans votre profil.");
                }

                _logger.LogInformation($"Entreprise par défaut trouvée: ID={defaultEntrepriseId}");

                // Créer un dossier temporaire pour stocker le fichier si nécessaire
                string tempDir = Path.Combine(Path.GetTempPath(), "ComptabiliteAPI");
                if (!Directory.Exists(tempDir))
                {
                    Directory.CreateDirectory(tempDir);
                }

                // Passer l'ID du compte et l'ID d'entreprise par défaut au script Python
                var scriptPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "Scripts", "import_facture.py"));
                _logger.LogInformation($"Chemin du script Python: {scriptPath}");

                if (!System.IO.File.Exists(scriptPath))
                {
                    _logger.LogError($"Le script Python n'existe pas au chemin: {scriptPath}");
                    return StatusCode(500, "Script d'importation introuvable. Veuillez contacter l'administrateur.");
                }

                // Détecter l'interpréteur Python à utiliser
                string pythonExecutable = "python";
                if (!OperatingSystem.IsWindows())
                {
                    pythonExecutable = "python3";
                }

                // Vérifier si Python est disponible
                try
                {
                    using var checkProcess = Process.Start(new ProcessStartInfo
                    {
                        FileName = pythonExecutable,
                        Arguments = "--version",
                        RedirectStandardOutput = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    });
                    string pythonVersion = await checkProcess.StandardOutput.ReadToEndAsync();
                    await checkProcess.WaitForExitAsync();
                    _logger.LogInformation($"Version Python détectée: {pythonVersion.Trim()}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Python ({pythonExecutable}) n'est pas disponible sur le système");
                    return StatusCode(500, $"Python ({pythonExecutable}) n'est pas disponible sur le système. Veuillez l'installer ou contacter l'administrateur.");
                }

                var psi = new ProcessStartInfo
                {
                    FileName = pythonExecutable,
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                // Environnement et arguments
                psi.Environment["UTILISATEUR_ID"] = utilisateurId;
                psi.Environment["COMPTE_BANCAIRE_ID"] = compteBancaireId.ToString();
                psi.Environment["DEFAULT_ENTREPRISE_ID"] = defaultEntrepriseId.ToString();
                psi.Environment["PYTHONIOENCODING"] = "utf-8";  // Force l'encodage UTF-8 pour Python
                
                var tempPath = Path.Combine(tempDir, $"facture_{Guid.NewGuid()}.pdf");
                _logger.LogInformation($"Sauvegarde temporaire du fichier: {tempPath}");

                using (var stream = new FileStream(tempPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                psi.Arguments = $"\"{scriptPath}\" \"{tempPath}\"";

                _logger.LogInformation($"Lancement du processus Python: {psi.FileName} {psi.Arguments}");
                using var process = Process.Start(psi);
                if (process == null)
                {
                    _logger.LogError("Impossible de démarrer le processus d'importation");
                    return StatusCode(500, "Impossible de démarrer le processus d'importation");
                }

                var outputTask = process.StandardOutput.ReadToEndAsync();
                var errorTask = process.StandardError.ReadToEndAsync();

                await process.WaitForExitAsync();
                
                var output = await outputTask;
                var errors = await errorTask;

                // Nettoyer le fichier temporaire
                try
                {
                    if (System.IO.File.Exists(tempPath))
                    {
                        System.IO.File.Delete(tempPath);
                        _logger.LogInformation($"Fichier temporaire supprimé: {tempPath}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Impossible de supprimer le fichier temporaire: {tempPath}");
                }

                if (process.ExitCode != 0)
                {
                    _logger.LogError($"Erreur lors de l'importation (code {process.ExitCode}): {errors}");
                    return StatusCode(500, $"Erreur lors de l'importation de la facture.\nCode: {process.ExitCode}\nDétails: {errors}");
                }

                // Vérifier si la sortie contient des messages d'erreur
                if (!string.IsNullOrEmpty(errors))
                {
                    _logger.LogWarning($"Avertissements durant l'importation: {errors}");
                }

                _logger.LogInformation($"Importation réussie. Sortie: {output}");
                return Ok(new { message = "📄 Importation réussie", output, warnings = !string.IsNullOrEmpty(errors) ? errors : null });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception non gérée lors de l'importation de la facture");
                return StatusCode(500, $"❌ Exception: {ex.Message}\nDétails: {ex.StackTrace}");
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
