using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // ✅ Nécessaire pour [JsonIgnore]

namespace ComptabiliteAPI.Models
{
    public class Depense
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Le fournisseur est requis")]
        public string Fournisseur { get; set; }

        [Required(ErrorMessage = "Le montant est requis")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Le montant doit être supérieur à zéro")]
        public decimal Montant { get; set; }

        [Required(ErrorMessage = "La date est requise")]
        public DateTime Date { get; set; }

        public string Justificatif { get; set; }

        // ✅ Ajouter cette ligne pour corriger l'erreur :
        public string Categorie { get; set; }

        public byte[] VerificatioFacture { get; set; }
        public string type { get; set; }

        public int? UtilisateurId { get; set; }
        public int EntreprisID { get; set; }

        [ForeignKey("UtilisateurId")]
        [JsonIgnore]
        public virtual Utilisateur? Utilisateur { get; set; }
    }

}
