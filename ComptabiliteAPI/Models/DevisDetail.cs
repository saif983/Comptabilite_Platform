using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping

namespace ComptabiliteAPI.Models
{
    public class DevisDetail
    {
        public int Id { get; set; }
        public int DevisId { get; set; }
        public Devis Devis { get; set; }

        public int ProduitServiceId { get; set; }
        public ProduitService ProduitService { get; set; }

        public int Quantite { get; set; }
        public decimal PrixTotal => Quantite * ProduitService.PrixUnitaire * (1 + ProduitService.TVA / 100);
    }


}
