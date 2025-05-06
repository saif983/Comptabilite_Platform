using ComptabiliteAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class DevisDetail
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("Devis")]
    public int DevisId { get; set; }
    public Devis Devis { get; set; }

    [ForeignKey("ProduitService")]
    public int ProduitServiceId { get; set; }
    public ProduitService ProduitService { get; set; }

    public int Quantite { get; set; }

    [NotMapped]
    public decimal PrixTotal => Quantite * ProduitService.PrixUnitaire * (1 + ProduitService.TVA / 100);
}
