using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ComptabiliteAPI.DTOs
{
    public class CreaEntrepriseDto
    {
        public string Nom { get; set; }
        public string Adresse { get; set; }
        public string MF { get; set; }
        public string Tel { get; set; }
        
        // Propriétés pour les fichiers à télécharger
        public IFormFile Logo { get; set; }
        public IFormFile RCS { get; set; }
        public IFormFile Identitegerant { get; set; } // optionnel
        public IFormFile Justificatifedomicile { get; set; } // optionnel
    }
}
