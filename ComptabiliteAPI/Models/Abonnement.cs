using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping

namespace ComptabiliteAPI.Models
{
    public class Abonnement
    {
        public int Id { get; set; }
        public string Type { get; set; } // Mensuel , Annuel , Free
        public decimal Prix { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin {  get; set; }

        // Les champs ne sont plus requis
        public List<Utilisateur>? Utilisateurs { get; set; } = new List<Utilisateur>();


    }

}

