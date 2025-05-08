using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

namespace ComptabiliteAPI.Models.DTOs
{
    public class DepenseFormDto
    {
        [Required]
        public string Categorie { get; set; }

        [Required]
        public string Fournisseur { get; set; }
        
        
        [Required]
        public string Justificatif { get; set; }


        [Required]
        public decimal Montant { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public int EntreprisID { get; set; }

        public IFormFile? FichierVerification { get; set; }
    }
}
