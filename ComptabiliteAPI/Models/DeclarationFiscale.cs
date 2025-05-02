using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping

namespace ComptabiliteAPI.Models
{
    public class DeclarationFiscale
    {
        public int Id { get; set; }
        public int EntrepriseId { get; set; }
        public Entreprise Entreprise { get; set; }
        public string Periode { get; set; }
        public decimal MontantTva { get; set; }
        public Statut Etat { get; set; } 

    }

}
