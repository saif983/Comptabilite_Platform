using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace ComptabiliteAPI.Models
{
    public class CompteBancaire
    {
        public int Id { get; set; }
        public int UtilisateurId { get; set; }
        public Utilisateur Utilisateur { get; set; }
        public int EntrepriseID { get; set; }
        public Entreprise Entreprise { get; set; }// 🔗 Association
        public string NumeroCompte { get; set; } = string.Empty;
        public string NomBanque { get; set; } = string.Empty;
        public string TypeCompte { get; set; } = "Courant"; // ou "Epargne", etc.
        public DateTime DateOuverture { get; set; } = DateTime.UtcNow;
        public DateTime? DateFermeture { get; set; }
        public decimal Solde { get; set; }
        public string Derniers4Chiffres => NumeroCompte?.Length >= 4
            ? NumeroCompte.Substring(NumeroCompte.Length - 4)
            : NumeroCompte;

    }

}
