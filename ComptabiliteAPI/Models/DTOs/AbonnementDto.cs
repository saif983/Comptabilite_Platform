using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComptabiliteAPI.Models.DTOs
{
    public class AbonnementDto
    {
        public int UtilisateurId { get; set; }
        public string Type { get; set; } // "Free", "Mensuel", etc.
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
    }


}
