using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace ComptabiliteAPI.Models.DTOs
{
    public class CompteBancaireDto
    {
        public int Id { get; set; }
        public string NumeroCompte { get; set; }
        public string NomBanque { get; set; }
        public string TypeCompte { get; set; }
        public DateTime DateOuverture { get; set; }
        public decimal Solde { get; set; }
        public string Derniers4Chiffres { get; set; }
        public int EntrepriseID { get; set; } // 🔗 Association
        
    }


}