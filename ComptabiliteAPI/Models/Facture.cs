using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping

namespace ComptabiliteAPI.Models
{
    public class Facture
    {
        public int Id { get; set; }
        public int NumFacture { get; set; }
        public DateTime Date { get; set; }
        public bool EstPayee { get; set; }
        public int EntrepriseId { get; set; }
        public decimal MontantTotal { get; set; } //TTC
        public decimal THT {  get; set; }
        public string NomClient {  get; set; }
        public string AdressClient { get; set; }
        public string TelClient { get; set; }
        public string CinClient { get; set; }
        public int? UtilisateurId { get; set; }

        [ForeignKey("UtilisateurId")]
        public Utilisateur? Utilisateur { get; set; }

        public ICollection<Paiement> Paiements { get; set; } = new List<Paiement>();
        public ICollection<FactureDetail> FactureDetails { get; set; } = new List<FactureDetail>();
    }



}
