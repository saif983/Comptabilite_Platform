using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping
using System.Text.Json.Serialization; // Add this for JsonIgnore


namespace ComptabiliteAPI.Models
{
    public enum TypeTransaction { Actif, Passif }
    public class Paiement
    {
        public int Id { get; set; }
        public int? FactureId { get; set; }
        public decimal Montant { get; set; }
        public DateTime DatePaiement { get; set; }
        public string ModePaiement { get; set; }
        public TypeTransaction Type { get; set; }
        public string Description { get; set; }

        [JsonIgnore]
        public Facture? Facture { get; set; }

        public int? UtilisateurId { get; set; }

        [ForeignKey("UtilisateurId")]
        public Utilisateur? Utilisateur { get; set; }

        public int? CompteBancaireId { get; set; }

        [ForeignKey("CompteBancaireId")]
        public CompteBancaire? CompteBancaire { get; set; }

    }

}