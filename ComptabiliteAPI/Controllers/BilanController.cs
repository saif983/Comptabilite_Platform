using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using ComptabiliteAPI.Data;
using System.Text.Json.Serialization;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class BilanController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<BilanController> _logger;

    public BilanController(AppDbContext context, ILogger<BilanController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // Cette classe est utilisée pour traiter les données avant de les envoyer au script Python
    private class SafeDecimalConverter
    {
        public static decimal ToSafeDecimal(object value, decimal defaultValue = 0)
        {
            if (value == null)
                return defaultValue;

            try
            {
                if (value is decimal decimalValue)
                    return decimalValue;
                
                return Convert.ToDecimal(value);
            }
            catch
            {
                return defaultValue;
            }
        }
    }

    // Classe pour désérialiser sans erreur de débordement
    private class SafeDecimalJsonConverter : JsonConverter<decimal>
    {
        public override decimal Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Number)
            {
                try
                {
                    return reader.GetDecimal();
                }
                catch
                {
                    // Si la valeur est trop grande, utiliser 0
                    return 0;
                }
            }
            
            return 0;
        }

        public override void Write(Utf8JsonWriter writer, decimal value, JsonSerializerOptions options)
        {
            writer.WriteNumberValue(value);
        }
    }

    [HttpGet("{entrepriseId}")]
    public async Task<IActionResult> GenererBilan(int entrepriseId, [FromQuery] DateTime? dateBilan = null, [FromQuery] decimal? capital = null)
    {
        try
        {
            var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var entreprise = await _context.Entreprises
                .FirstOrDefaultAsync(e => e.Id == entrepriseId && e.UtilisateurId == utilisateurId);

            if (entreprise == null)
                return NotFound("Entreprise non trouvée ou accès interdit.");

            // Récupérer et traiter les dépenses avec gestion des erreurs de conversion
            var depensesQuery = _context.Depenses
                .Where(d => d.EntreprisID == entrepriseId)
                .AsNoTracking();  // Pour améliorer les performances
            
            List<dynamic> depensesSanitized = new List<dynamic>();
            
            try 
            {
                var depenses = await depensesQuery.ToListAsync();
                
                foreach (var depense in depenses)
                {
                    // Créer un nouvel objet avec des valeurs sanitisées
                    depensesSanitized.Add(new 
                    {
                        Id = depense.Id,
                        Fournisseur = depense.Fournisseur,
                        Montant = SafeDecimalConverter.ToSafeDecimal(depense.Montant),
                        Date = depense.Date,
                        Categorie = depense.Categorie ?? "",
                        type = depense.type ?? "Terminer" // Valeur par défaut
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des dépenses");
                // Continuer avec une liste vide si erreur
            }

            // Récupérer et traiter les factures avec gestion des erreurs
            var facturesQuery = _context.Factures
                .Where(f => f.EntrepriseId == entrepriseId)
                .AsNoTracking();
                
            List<dynamic> facturesSanitized = new List<dynamic>();
            
            try
            {
                var factures = await facturesQuery.ToListAsync();

                foreach (var facture in factures)
                {
                    facturesSanitized.Add(new 
                    {
                        Id = facture.Id,
                        NumFacture = facture.NumFacture,
                        Date = facture.Date,
                        MontantTotal = SafeDecimalConverter.ToSafeDecimal(facture.MontantTotal),
                        statut = facture.EstPayee ? "Payée" : "Non payée"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des factures");
                // Continuer avec une liste vide si erreur
            }

            // Récupérer et traiter les comptes bancaires
            var comptesQuery = _context.ComptesBancaires
                .Where(c => c.UtilisateurId == utilisateurId)
                .AsNoTracking();
                
            List<dynamic> comptesSanitized = new List<dynamic>();
            
            try
            {
                var comptes = await comptesQuery.ToListAsync();
                
                foreach (var compte in comptes)
                {
                    comptesSanitized.Add(new 
                    {
                        Id = compte.Id,
                        NumeroCompte = compte.NumeroCompte,
                        NomBanque = compte.NomBanque,
                        Solde = SafeDecimalConverter.ToSafeDecimal(compte.Solde)
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des comptes bancaires");
                // Continuer avec une liste vide si erreur
            }

            // Vérifier la présence d'une propriété Capital dans l'entité Entreprise
            decimal capitalFinal;
            var capitalProp = entreprise.GetType().GetProperty("Capital");

            if (capitalProp != null)
            {
                var rawCapital = capitalProp.GetValue(entreprise);
                capitalFinal = SafeDecimalConverter.ToSafeDecimal(rawCapital, capital ?? 0);
            }
            else if (capital.HasValue)
            {
                capitalFinal = capital.Value;
            }
            else
            {
                capitalFinal = 0; // Valeur par défaut
            }

            var inputData = new
            {
                entreprise = new
                {
                    id = entreprise.Id,
                    capital = capitalFinal
                },
                depenses = depensesSanitized,
                factures = facturesSanitized,
                comptes_bancaires = comptesSanitized
            };

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                Converters = { new SafeDecimalJsonConverter() }
            };

            string jsonInput = JsonSerializer.Serialize(inputData, options);

            // Déterminer quel exécutable Python utiliser
            string pythonExecutable = "python"; // Par défaut

            // Si nous sommes sur Linux/macOS, essayez d'abord python3
            if (!OperatingSystem.IsWindows())
            {
                pythonExecutable = "python3";
            }

            // Chemin complet vers le script
            string scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "Scripts", "bilan_comptable.py");

            var psi = new ProcessStartInfo
            {
                FileName = pythonExecutable,
                Arguments = $"\"{scriptPath}\" {entrepriseId} {(dateBilan?.ToString("yyyy-MM-dd") ?? "")}",
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            _logger.LogInformation($"Exécution du script Python: {psi.FileName} {psi.Arguments}");

            using var process = Process.Start(psi);
            if (process == null)
            {
                _logger.LogError("Impossible de démarrer le processus Python");
                return StatusCode(500, "Impossible de démarrer l'analyse du bilan");
            }

            await process.StandardInput.WriteAsync(jsonInput);
            process.StandardInput.Close();

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                _logger.LogError($"Erreur Python (code {process.ExitCode}): {error}");
                return StatusCode(500, $"Erreur lors de la génération du bilan: {error}");
            }

            if (string.IsNullOrWhiteSpace(output))
            {
                _logger.LogError("Le script Python n'a pas généré de sortie");
                return StatusCode(500, "Le bilan n'a pas pu être généré (sortie vide)");
            }

            try
            {
            var bilan = JsonSerializer.Deserialize<object>(output);
            return Ok(bilan);
            }
            catch (JsonException ex)
            {
                _logger.LogError($"Erreur de désérialisation JSON: {ex.Message}. Output: {output}");
                return StatusCode(500, $"Erreur de format dans le bilan généré: {ex.Message}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la génération du bilan");
            return StatusCode(500, $"Erreur serveur: {ex.Message}");
        }
    }
}
