using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping

namespace ComptabiliteAPI.Models
{
    public enum Statut { EnAttente, Accepte, Rejete }
    public class DeclarationCNSS
    {
        public int Id { get; set; }
        public int EntrepriseId { get; set; }
        public Entreprise Entreprise { get; set; }
        public string Periode { get; set; }
        public int NombreEmployes { get; set; }
        public decimal MontantCotisation { get; set; }
        public string Etat { get; set; }
        public Statut Statut { get; set; }
    }


}
