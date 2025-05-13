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
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUtilisateurId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return int.Parse(claim!.Value);
        }

        private async Task<int> GetDefaultEntrepriseId()
        {
            int userId = GetUtilisateurId();
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (utilisateur == null || utilisateur.DefaultEntrepriseId == null)
            {
                throw new Exception("Entreprise par défaut non trouvée pour cet utilisateur.");
            }

            return utilisateur.DefaultEntrepriseId.Value;
        }

        // GET: api/Dashboard
        [HttpGet]
        public async Task<ActionResult<DashboardData>> GetDashboard()
        {
            try
            {
                int entrepriseId = await GetDefaultEntrepriseId();
                
                // Récupérer les données pour le dashboard
                var dashboardData = new DashboardData
                {
                    ComptesBancaires = await GetComptesBancaires(entrepriseId),
                    RevenueAnalytics = await GetRevenueAnalytics(entrepriseId),
                    PaiementStats = await GetPaiementStats(entrepriseId),
                    DevisStats = await GetDevisStats(entrepriseId),
                    ClientsNonPayes = await GetClientsNonPayes(entrepriseId),
                    DepensesParCategorie = await GetDepensesParCategorie(entrepriseId),
                    ListeDepensesRecentes = await GetDepensesRecentes(entrepriseId)
                };

                return dashboardData;
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Méthode pour récupérer les comptes bancaires
        private async Task<List<CompteBancaireViewModel>> GetComptesBancaires(int entrepriseId)
        {
            var comptes = await _context.ComptesBancaires
                .Where(c => c.EntrepriseID == entrepriseId)
                .Select(c => new CompteBancaireViewModel
                {
                    Id = c.Id,
                    NomBanque = c.NomBanque,
                    NumeroCompte = c.NumeroCompte,
                    Solde = c.Solde,
                    TypeCompte = c.TypeCompte,
                    DateOuverture = c.DateOuverture,
                    Derniers4Chiffres = c.Derniers4Chiffres
                })
                .ToListAsync();

            return comptes;
        }

        // Méthode pour analyser les revenus (factures payées)
        private async Task<RevenueAnalytics> GetRevenueAnalytics(int entrepriseId)
        {
            // Obtenir toutes les factures de l'entreprise
            var factures = await _context.Factures
                .Where(f => f.EntrepriseId == entrepriseId)
                .Include(f => f.Paiements)
                .ToListAsync();

            // Calculer les revenus mensuels pour les 12 derniers mois
            var dateDebut = DateTime.UtcNow.AddMonths(-11);
            var revenusMensuels = new List<MontantMensuel>();

            for (int i = 0; i < 12; i++)
            {
                var moisActuel = dateDebut.AddMonths(i);
                var debut = new DateTime(moisActuel.Year, moisActuel.Month, 1);
                var fin = debut.AddMonths(1).AddDays(-1);

                var montantTotal = factures
                    .Where(f => f.EstPayee && f.Date >= debut && f.Date <= fin)
                    .Sum(f => f.MontantTotal);

                revenusMensuels.Add(new MontantMensuel
                {
                    Mois = debut.ToString("MMM yyyy"),
                    Montant = montantTotal
                });
            }

            // Calculer le total des revenus
            var totalRevenues = factures
                .Where(f => f.EstPayee)
                .Sum(f => f.MontantTotal);

            return new RevenueAnalytics
            {
                RevenusMensuels = revenusMensuels,
                RevenusTotal = totalRevenues
            };
        }

        // Méthode pour obtenir les statistiques de paiement
        private async Task<PaiementStats> GetPaiementStats(int entrepriseId)
        {
            var factures = await _context.Factures
                .Where(f => f.EntrepriseId == entrepriseId)
                .ToListAsync();

            int totalFactures = factures.Count;
            int facturesPayees = factures.Count(f => f.EstPayee);
            int facturesNonPayees = totalFactures - facturesPayees;

            decimal montantTotal = factures.Sum(f => f.MontantTotal);
            decimal montantPaye = factures.Where(f => f.EstPayee).Sum(f => f.MontantTotal);
            decimal montantNonPaye = montantTotal - montantPaye;

            double pourcentagePayees = totalFactures > 0 ? (double)facturesPayees / totalFactures * 100 : 0;
            double pourcentageNonPayees = totalFactures > 0 ? (double)facturesNonPayees / totalFactures * 100 : 0;

            return new PaiementStats
            {
                TotalFactures = totalFactures,
                FacturesPayees = facturesPayees,
                FacturesNonPayees = facturesNonPayees,
                MontantTotal = montantTotal,
                MontantPaye = montantPaye,
                MontantNonPaye = montantNonPaye,
                PourcentagePayees = Math.Round(pourcentagePayees, 2),
                PourcentageNonPayees = Math.Round(pourcentageNonPayees, 2)
            };
        }

        // Méthode pour obtenir les statistiques de devis
        private async Task<DevisStats> GetDevisStats(int entrepriseId)
        {
            var devis = await _context.Devis
                .Where(d => d.EntrepriseId == entrepriseId)
                .ToListAsync();

            int totalDevis = devis.Count;
            int devisAcceptes = devis.Count(d => d.Statut == "Accepté");
            int devisEnAttente = devis.Count(d => d.Statut == "En attente");
            int devisRefuses = devis.Count(d => d.Statut == "Refusé");

            decimal montantTotal = devis.Sum(d => d.MontantTotal);
            decimal montantAccepte = devis.Where(d => d.Statut == "Accepté").Sum(d => d.MontantTotal);
            decimal montantEnAttente = devis.Where(d => d.Statut == "En attente").Sum(d => d.MontantTotal);
            decimal montantRefuse = devis.Where(d => d.Statut == "Refusé").Sum(d => d.MontantTotal);

            double pourcentageAcceptes = totalDevis > 0 ? (double)devisAcceptes / totalDevis * 100 : 0;
            double pourcentageEnAttente = totalDevis > 0 ? (double)devisEnAttente / totalDevis * 100 : 0;
            double pourcentageRefuses = totalDevis > 0 ? (double)devisRefuses / totalDevis * 100 : 0;

            return new DevisStats
            {
                TotalDevis = totalDevis,
                DevisAcceptes = devisAcceptes,
                DevisEnAttente = devisEnAttente,
                DevisRefuses = devisRefuses,
                MontantTotal = montantTotal,
                MontantAccepte = montantAccepte,
                MontantEnAttente = montantEnAttente,
                MontantRefuse = montantRefuse,
                PourcentageAcceptes = Math.Round(pourcentageAcceptes, 2),
                PourcentageEnAttente = Math.Round(pourcentageEnAttente, 2),
                PourcentageRefuses = Math.Round(pourcentageRefuses, 2)
            };
        }

        // Méthode pour obtenir les clients qui n'ont pas payé leurs factures
        private async Task<ClientsNonPayes> GetClientsNonPayes(int entrepriseId)
        {
            var factures = await _context.Factures
                .Where(f => f.EntrepriseId == entrepriseId && !f.EstPayee)
                .ToListAsync();

            // Regrouper par client
            var clientsGroupes = factures
                .GroupBy(f => f.NomClient)
                .Select(g => new ClientDette
                {
                    NomClient = g.Key,
                    NombreFactures = g.Count(),
                    MontantTotal = g.Sum(f => f.MontantTotal)
                })
                .OrderByDescending(c => c.MontantTotal)
                .ToList();

            int totalClients = clientsGroupes.Count;
            decimal montantTotalDettes = clientsGroupes.Sum(c => c.MontantTotal);

            return new ClientsNonPayes
            {
                TotalClients = totalClients,
                MontantTotalDettes = montantTotalDettes,
                Clients = clientsGroupes
            };
        }

        // Méthode pour obtenir les dépenses par catégorie
        private async Task<List<DepenseCategorie>> GetDepensesParCategorie(int entrepriseId)
        {
            var depenses = await _context.Depenses
                .Where(d => d.EntreprisID == entrepriseId)
                .ToListAsync();

            // Regrouper par catégorie
            var categoriesGroupees = depenses
                .GroupBy(d => d.Categorie)
                .Select(g => new DepenseCategorie
                {
                    Categorie = g.Key,
                    MontantTotal = g.Sum(d => d.Montant),
                    NombreDepenses = g.Count()
                })
                .OrderByDescending(c => c.MontantTotal)
                .ToList();

            return categoriesGroupees;
        }

        // Méthode pour obtenir la liste des dépenses récentes
        private async Task<List<DepenseViewModel>> GetDepensesRecentes(int entrepriseId)
        {
            return await _context.Depenses
                .Where(d => d.EntreprisID == entrepriseId)
                .OrderByDescending(d => d.Date)
                .Take(10)
                .Select(d => new DepenseViewModel
                {
                    Id = d.Id,
                    Fournisseur = d.Fournisseur,
                    Categorie = d.Categorie,
                    Date = d.Date,
                    Montant = d.Montant,
                    Justificatif = d.Justificatif
                })
                .ToListAsync();
        }
    }

    // Classes pour les modèles de vue
    public class DashboardData
    {
        public List<CompteBancaireViewModel> ComptesBancaires { get; set; }
        public RevenueAnalytics RevenueAnalytics { get; set; }
        public PaiementStats PaiementStats { get; set; }
        public DevisStats DevisStats { get; set; }
        public ClientsNonPayes ClientsNonPayes { get; set; }
        public List<DepenseCategorie> DepensesParCategorie { get; set; }
        public List<DepenseViewModel> ListeDepensesRecentes { get; set; }
    }

    public class CompteBancaireViewModel
    {
        public int Id { get; set; }
        public string NomBanque { get; set; }
        public string NumeroCompte { get; set; }
        public string TypeCompte { get; set; }
        public decimal Solde { get; set; }
        public DateTime DateOuverture { get; set; }
        public string Derniers4Chiffres { get; set; }
    }

    public class RevenueAnalytics
    {
        public List<MontantMensuel> RevenusMensuels { get; set; }
        public decimal RevenusTotal { get; set; }
    }

    public class MontantMensuel
    {
        public string Mois { get; set; }
        public decimal Montant { get; set; }
    }

    public class PaiementStats
    {
        public int TotalFactures { get; set; }
        public int FacturesPayees { get; set; }
        public int FacturesNonPayees { get; set; }
        public decimal MontantTotal { get; set; }
        public decimal MontantPaye { get; set; }
        public decimal MontantNonPaye { get; set; }
        public double PourcentagePayees { get; set; }
        public double PourcentageNonPayees { get; set; }
    }

    public class DevisStats
    {
        public int TotalDevis { get; set; }
        public int DevisAcceptes { get; set; }
        public int DevisEnAttente { get; set; }
        public int DevisRefuses { get; set; }
        public decimal MontantTotal { get; set; }
        public decimal MontantAccepte { get; set; }
        public decimal MontantEnAttente { get; set; }
        public decimal MontantRefuse { get; set; }
        public double PourcentageAcceptes { get; set; }
        public double PourcentageEnAttente { get; set; }
        public double PourcentageRefuses { get; set; }
    }

    public class ClientsNonPayes
    {
        public int TotalClients { get; set; }
        public decimal MontantTotalDettes { get; set; }
        public List<ClientDette> Clients { get; set; }
    }

    public class ClientDette
    {
        public string NomClient { get; set; }
        public int NombreFactures { get; set; }
        public decimal MontantTotal { get; set; }
    }

    public class DepenseCategorie
    {
        public string Categorie { get; set; }
        public decimal MontantTotal { get; set; }
        public int NombreDepenses { get; set; }
    }

    public class DepenseViewModel
    {
        public int Id { get; set; }
        public string Fournisseur { get; set; }
        public string Categorie { get; set; }
        public DateTime Date { get; set; }
        public decimal Montant { get; set; }
        public string Justificatif { get; set; }
    }
}
