using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping

namespace ComptabiliteAPI.Models
{
    public class Devis
    {
        public int Id { get; set; }
        public int NumDevis { get; set; }
        public int EntrepriseId { get; set; }
        public Entreprise Entreprise { get; set; }
        public DateTime Date { get; set; }
        public decimal MontantTotal { get; set; }
        public string Statut { get; set; } // ✅ doit être initialisé


    }

}