using System;

namespace ComptabiliteAPI.Models.DTOs
{
    public class HistoriqueDto
    {
        public int Id { get; set; }
        public int UtilisateurId { get; set; }
        public string NomUtilisateur { get; set; }
        public int EntrepriseId { get; set; }
        public string NomEntreprise { get; set; }
        public DateTime DateAction { get; set; }
        public string Description { get; set; }
        public string TypeAction { get; set; }
        public string Module { get; set; }
        public int? EntiteId { get; set; }
    }

    public class CreateHistoriqueDto
    {
        public int UtilisateurId { get; set; }
        public int EntrepriseId { get; set; }
        public string Description { get; set; }
        public string TypeAction { get; set; }
        public string Module { get; set; }
        public int? EntiteId { get; set; }
        public string DonneesAdditionnelles { get; set; }
    }
} 