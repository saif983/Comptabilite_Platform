using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping


    namespace ComptabiliteAPI.Models
    {
        public class Entreprise
        {
            public int Id { get; set; }
            public string Nom { get; set; }
            public string Adresse { get; set; }
            public string MF { get; set; }
            public string Tel { get; set; }
           
            // 🔐 Propriétaire de l'entreprise
            public int UtilisateurId { get; set; }
            public Utilisateur? Utilisateur { get; set; }

            public List<Utilisateur>? Utilisateurs { get; set; } = new();
            public List<ProduitService>? ProduitServices { get; set; } = new();
            public List<Facture>? Factures { get; set; } = new();

             //Nouveau Modification
            public byte[] Logo { get; set; }
            public byte[] RCS { get; set; }
            public byte[] Identitegerant { get; set; } //optionnel
            public byte[] Justificatifedomicile  { get; set; } //optionnel
        }
    }


