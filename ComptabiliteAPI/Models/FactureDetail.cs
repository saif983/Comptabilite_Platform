using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Required for [Key]
using System.ComponentModel.DataAnnotations.Schema; // Optional for table mapping

namespace ComptabiliteAPI.Models
{
	public class FactureDetail
	{
		public int Id { get; set; }
		public int FactureId { get; set; }
		public Facture Facture { get; set; }
		
		public int ProduitServiceId { get; set; }
		public ProduitService ProduitService { get; set; }

		public int Quantite { get; set; }
		public decimal TTC {  get; set; }
		public decimal HT {  get; set; }

    }


}
