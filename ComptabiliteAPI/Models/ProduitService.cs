using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace ComptabiliteAPI.Models
{

    public class ProduitService
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public decimal PrixUnitaire { get; set; }
        public decimal TVA { get; set; }
        public int UtilisateurId { get; set; }
        public int EntrepriseId { get; set; }
        [JsonIgnore]
        [ValidateNever]
        public Utilisateur Utilisateur { get; set; }
    }

}