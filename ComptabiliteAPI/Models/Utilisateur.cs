using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping

namespace ComptabiliteAPI.Models
{
    public class Utilisateur
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Email { get; set; }
        public string MotDePasse { get; set; }
        public string Role { get; set; }

        public int? AbonnementId { get; set; }
        public Abonnement? Abonnement { get; set; }

        // 🔥 Ajoute ceci
        public int? CreeParId { get; set; }
        public Utilisateur? CreePar { get; set; }

        // Entreprise par défaut de l'utilisateur
        public int? DefaultEntrepriseId { get; set; }
        [ForeignKey("DefaultEntrepriseId")]
        public Entreprise? DefaultEntreprise { get; set; }

        public List<Utilisateur>? Utilisateurs { get; set; } = new List<Utilisateur>();
        public List<CompteBancaire>? ComptesBancaires { get; set; } = new List<CompteBancaire>();

        public List<Entreprise>? Entreprises { get; set; } = new();
    }
}

