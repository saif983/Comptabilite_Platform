using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using ComptabiliteAPI.Models.DTOs;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/CompteBancaire")]
    [Authorize]
    public class CompteBancaireController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CompteBancaireController> _logger;

        public CompteBancaireController(AppDbContext context, ILogger<CompteBancaireController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private int GetUtilisateurId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(claim.Value);
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
        public async Task<IActionResult> CreateCompteBancaire([FromBody] CompteBancaireDto dto)
        {
            var utilisateurId = GetUtilisateurId();

            var compte = new CompteBancaire
            {
                UtilisateurId = utilisateurId,
                NumeroCompte = dto.NumeroCompte,
                NomBanque = dto.NomBanque,
                TypeCompte = dto.TypeCompte,
                DateOuverture = dto.DateOuverture,
                Solde = dto.Solde,
                EntrepriseID =dto.EntrepriseID
            };

            _context.ComptesBancaires.Add(compte);
            await _context.SaveChangesAsync();

            dto.Id = compte.Id;
            dto.Derniers4Chiffres = compte.Derniers4Chiffres;

            return CreatedAtAction(nameof(GetCompteBancaire), new { id = compte.Id }, dto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompteBancaire(int id)
        {
            try
            {
                var compte = await _context.ComptesBancaires
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (compte == null || compte.UtilisateurId != GetUtilisateurId())
                {
                    return NotFound("Compte Bancaire non trouvé.");
                }

                var dto = new CompteBancaireDto
                {
                    Id = compte.Id,
                    NumeroCompte = compte.NumeroCompte,
                    NomBanque = compte.NomBanque,
                    TypeCompte = compte.TypeCompte,
                    DateOuverture = compte.DateOuverture,
                    Solde = SafeDecimal(compte.Solde),
                    Derniers4Chiffres = compte.Derniers4Chiffres
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du compte bancaire");
                return StatusCode(500, "Une erreur est survenue lors de la récupération du compte bancaire.");
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllByUser()
        {
            try
            {
                var utilisateurId = GetUtilisateurId();
                List<CompteBancaireDto> dtos = new List<CompteBancaireDto>();

                // Récupérer les IDs des comptes d'abord (cela évite les problèmes avec les valeurs décimales)
                var compteIds = await _context.ComptesBancaires
                    .Where(c => c.UtilisateurId == utilisateurId)
                    .Select(c => c.Id)
                    .ToListAsync();

                // Traiter chaque compte individuellement pour éviter qu'une erreur sur un compte
                // n'empêche la récupération des autres
                foreach (var id in compteIds)
                {
                    try
                    {
                        // Récupérer le compte en utilisant des propriétés spécifiques pour éviter 
                        // les problèmes de conversion automatique
                        var compteData = await _context.ComptesBancaires
                            .Where(c => c.Id == id)
                            .Select(c => new
                            {
                                c.Id,
                                c.NumeroCompte,
                                c.NomBanque,
                                c.TypeCompte,
                                c.DateOuverture,
                                // Récupérer Solde comme string pour éviter l'erreur de conversion
                                SoldeAsString = c.Solde.ToString(),
                            })
                            .AsNoTracking()
                            .FirstOrDefaultAsync();

                        if (compteData != null)
                        {
                            // Conversion manuelle avec gestion d'erreur
                            decimal solde = 0;
                            try
                            {
                                if (decimal.TryParse(compteData.SoldeAsString, out var parsedSolde))
                                {
                                    solde = parsedSolde;
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, $"Erreur lors de la conversion du solde pour le compte {id}");
                            }

                            dtos.Add(new CompteBancaireDto
                            {
                                Id = compteData.Id,
                                NumeroCompte = compteData.NumeroCompte ?? string.Empty,
                                NomBanque = compteData.NomBanque ?? string.Empty,
                                TypeCompte = compteData.TypeCompte ?? "Courant",
                                DateOuverture = compteData.DateOuverture,
                                Solde = solde,
                                Derniers4Chiffres = compteData.NumeroCompte?.Length >= 4
                                    ? compteData.NumeroCompte.Substring(compteData.NumeroCompte.Length - 4)
                                    : compteData.NumeroCompte ?? string.Empty
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Erreur lors de la récupération du compte bancaire ID {id}");
                        // Continuer avec les autres comptes
                    }
                }

                if (!dtos.Any())
                {
                    return NotFound("Aucun compte bancaire trouvé.");
                }
                
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des comptes bancaires");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des comptes bancaires.");
            }
        }
    }
}
