using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using ComptabiliteAPI.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ComptabiliteAPI.Controllers
{
    [ApiController]
    [Route("api/historique")]
    [Authorize]
    public class HistoriqueController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<HistoriqueController> _logger;

        public HistoriqueController(AppDbContext context, ILogger<HistoriqueController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Obtenir l'historique d'une entreprise
        [HttpGet("entreprise/{entrepriseId}")]
        public async Task<IActionResult> GetHistoriqueEntreprise(int entrepriseId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Vérifier que l'utilisateur a accès à l'entreprise
                var entreprise = await _context.Entreprises
                    .FirstOrDefaultAsync(e => e.Id == entrepriseId && 
                                        (e.UtilisateurId == utilisateurId || e.Utilisateurs.Any(u => u.Id == utilisateurId)));

                if (entreprise == null)
                {
                    return Forbid("Vous n'avez pas accès à cette entreprise");
                }

                // Calculer le nombre total d'éléments pour la pagination
                var totalItems = await _context.Historiques
                    .Where(h => h.EntrepriseId == entrepriseId)
                    .CountAsync();

                // Obtenir les historiques avec pagination
                var historiques = await _context.Historiques
                    .Where(h => h.EntrepriseId == entrepriseId)
                    .OrderByDescending(h => h.DateAction)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(h => new HistoriqueDto
                    {
                        Id = h.Id,
                        UtilisateurId = h.UtilisateurId,
                        NomUtilisateur = h.Utilisateur.Nom,
                        EntrepriseId = h.EntrepriseId,
                        NomEntreprise = h.Entreprise.Nom,
                        DateAction = h.DateAction,
                        Description = h.Description,
                        TypeAction = h.TypeAction,
                        Module = h.Module,
                        EntiteId = h.EntiteId
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalItems,
                    totalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                    currentPage = page,
                    pageSize,
                    items = historiques
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'historique");
                return StatusCode(500, $"Erreur serveur: {ex.Message}");
            }
        }

        // Enregistrer une nouvelle action dans l'historique
        [HttpPost("enregistrer")]
        public async Task<IActionResult> EnregistrerAction([FromBody] CreateHistoriqueDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest("Données invalides");
                }

                var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Si l'utilisateur n'est pas fourni dans le DTO, utiliser l'utilisateur connecté
                if (dto.UtilisateurId == 0)
                {
                    dto.UtilisateurId = utilisateurId;
                }
                // Sinon, vérifier que l'utilisateur actuel a le droit de créer des actions pour cet utilisateur
                else if (dto.UtilisateurId != utilisateurId)
                {
                    // Vérification pour les admins ou les cas spéciaux
                    var utilisateurActuel = await _context.Utilisateurs
                        .FirstOrDefaultAsync(u => u.Id == utilisateurId);

                    if (utilisateurActuel == null || utilisateurActuel.Role != "Admin")
                    {
                        return Forbid("Vous n'avez pas le droit d'enregistrer des actions pour cet utilisateur");
                    }
                }

                // Vérifier que l'entreprise existe
                var entreprise = await _context.Entreprises
                    .FirstOrDefaultAsync(e => e.Id == dto.EntrepriseId);

                if (entreprise == null)
                {
                    return BadRequest("Entreprise non trouvée");
                }

                var historique = new Historique
                {
                    UtilisateurId = dto.UtilisateurId,
                    EntrepriseId = dto.EntrepriseId,
                    DateAction = DateTime.Now,
                    Description = dto.Description,
                    TypeAction = dto.TypeAction,
                    Module = dto.Module,
                    EntiteId = dto.EntiteId,
                    DonneesAdditionnelles = dto.DonneesAdditionnelles
                };

                _context.Historiques.Add(historique);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Action enregistrée avec succès", historiqueId = historique.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'enregistrement de l'action");
                return StatusCode(500, $"Erreur serveur: {ex.Message}");
            }
        }

        // Obtenir des statistiques sur les actions
        [HttpGet("statistiques/entreprise/{entrepriseId}")]
        public async Task<IActionResult> GetStatistiquesHistorique(int entrepriseId)
        {
            try
            {
                var utilisateurId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Vérifier que l'utilisateur a accès à l'entreprise
                var entreprise = await _context.Entreprises
                    .FirstOrDefaultAsync(e => e.Id == entrepriseId && 
                                        (e.UtilisateurId == utilisateurId || e.Utilisateurs.Any(u => u.Id == utilisateurId)));

                if (entreprise == null)
                {
                    return Forbid("Vous n'avez pas accès à cette entreprise");
                }

                // Date d'il y a 30 jours pour les statistiques récentes
                var dateTrenteJours = DateTime.Now.AddDays(-30);

                // Nombre total d'actions
                var totalActions = await _context.Historiques
                    .Where(h => h.EntrepriseId == entrepriseId)
                    .CountAsync();

                // Nombre d'actions des 30 derniers jours
                var actionsRecentes = await _context.Historiques
                    .Where(h => h.EntrepriseId == entrepriseId && h.DateAction >= dateTrenteJours)
                    .CountAsync();

                // Actions par module
                var actionsParModule = await _context.Historiques
                    .Where(h => h.EntrepriseId == entrepriseId)
                    .GroupBy(h => h.Module)
                    .Select(g => new
                    {
                        Module = g.Key,
                        Total = g.Count()
                    })
                    .ToListAsync();

                // Actions par type
                var actionsParType = await _context.Historiques
                    .Where(h => h.EntrepriseId == entrepriseId)
                    .GroupBy(h => h.TypeAction)
                    .Select(g => new
                    {
                        Type = g.Key,
                        Total = g.Count()
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalActions,
                    actionsRecentes,
                    actionsParModule,
                    actionsParType
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statistiques d'historique");
                return StatusCode(500, $"Erreur serveur: {ex.Message}");
            }
        }
    }
} 