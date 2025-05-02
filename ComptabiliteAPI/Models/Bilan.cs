using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComptabiliteAPI.Models
{
    public class Bilan
    {
        public int Id { get; set; }
        public int EntrepriseId { get; set; }
        public Entreprise Entreprise { get; set; }
        public decimal ActifTotal { get; set; }
        public decimal PassifTotal { get; set; }
    }

}