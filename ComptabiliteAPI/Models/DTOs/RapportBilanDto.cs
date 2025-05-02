using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; 
using System.ComponentModel.DataAnnotations.Schema; 

namespace ComptabiliteAPI.Models.DTOs
{
	public class RapportBilanDto
	{
		public decimal Actifs { get; set; }
		public decimal Passifs { get; set; }
		public decimal Solde { get; set; } 
	}

}
