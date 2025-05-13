using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComptabiliteAPI.Models
{
    public class Historique
    {
        [Key]
        public int Id { get; set; }
        
        // Relations avec l'utilisateur qui a effectué l'action
        public int UtilisateurId { get; set; }
        
        [ForeignKey("UtilisateurId")]
        public Utilisateur Utilisateur { get; set; }
        
        // Relations avec l'entreprise concernée
        public int EntrepriseId { get; set; }
        
        [ForeignKey("EntrepriseId")]
        public Entreprise Entreprise { get; set; }
        
        // Date et heure de l'action
        public DateTime DateAction { get; set; } =  DateTime.UtcNow;
        
        // Description de l'action effectuée
        [Required]
        [StringLength(255)]
        public string Description { get; set; }
        
        // Type d'action (create, update, delete, etc.)
        [Required]
        [StringLength(50)]
        public string TypeAction { get; set; }
        
        // Module concerné (facture, devis, paiement, etc.)
        [Required]
        [StringLength(50)]
        public string Module { get; set; }
        
        // Identifiant de l'entité concernée (facultatif)
        public int? EntiteId { get; set; }
        
        // Données additionnelles au format JSON (facultatif)
        public string DonneesAdditionnelles { get; set; }
    }
} 