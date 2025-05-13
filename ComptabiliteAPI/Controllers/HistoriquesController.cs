using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComptabiliteAPI.Data;
using ComptabiliteAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
namespace ComptabiliteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HistoriquesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HistoriquesController(AppDbContext context)
        {
            _context = context;
        }
        private int GetUtilisateurId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(claim!.Value);
        }
        private int GetDefaultEntrepriseId()
        {
            int userId = GetUtilisateurId();
            var utilisateur = _context.Utilisateurs
                .FirstOrDefault(u => u.Id == userId);

            if (utilisateur == null || utilisateur.DefaultEntrepriseId == null)
            {
                throw new Exception("Entreprise non trouvée pour cet utilisateur.");
            }

            return utilisateur.DefaultEntrepriseId.Value;
        }


        // GET: api/Historiques
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Historique>>> GetHistoriques()
        {
            int entrepriseId = GetDefaultEntrepriseId();

            var historiques = await _context.Historiques
                .Where(h => h.EntrepriseId == entrepriseId)
                .OrderByDescending(h => h.DateAction)
                .ToListAsync();

            return historiques;
        }


        private bool HistoriqueExists(int id)
        {
            return _context.Historiques.Any(e => e.Id == id);
        }
    }
}
