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

        public CompteBancaireController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUtilisateurId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(claim.Value);
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
                Solde = dto.Solde
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
            var compte = await _context.ComptesBancaires.FindAsync(id);
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
                Solde = compte.Solde,
                Derniers4Chiffres = compte.Derniers4Chiffres
            };

            return Ok(dto);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllByUser()
        {
            var utilisateurId = GetUtilisateurId();

            var comptes = await _context.ComptesBancaires
                .Where(c => c.UtilisateurId == utilisateurId)
                .ToListAsync();

            var dtos = comptes.Select(c => new CompteBancaireDto
            {
                Id = c.Id,
                NumeroCompte = c.NumeroCompte,
                NomBanque = c.NomBanque,
                TypeCompte = c.TypeCompte,
                DateOuverture = c.DateOuverture,
                Solde = c.Solde,
                Derniers4Chiffres = c.Derniers4Chiffres
            });
            if (dtos == null || !dtos.Any())
            {
                return NotFound("Aucun compte bancaire trouvé.");
            }
            else
            {
                return Ok(dtos);
            }



        }
    }
}
