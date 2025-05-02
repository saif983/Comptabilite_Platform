using Microsoft.EntityFrameworkCore;
using ComptabiliteAPI.Models;
using ComptabiliteAPI.Models;

namespace ComptabiliteAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Définition des DbSet pour toutes les entités
        public DbSet<Abonnement> Abonnements { get; set; }
        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Entreprise> Entreprises { get; set; }
        public DbSet<CompteBancaire> ComptesBancaires { get; set; }
        
        public DbSet<Facture> Factures { get; set; }
        public DbSet<FactureDetail> FactureDetails { get; set; }
        public DbSet<Paiement> Paiements { get; set; }
        public DbSet<Depense> Depenses { get; set; }
        public DbSet<DeclarationFiscale> DeclarationsFiscales { get; set; }
        public DbSet<DeclarationCNSS> DeclarationsCNSSes { get; set; }
        public DbSet<Bilan> Bilans { get; set; }
        public DbSet<Devis> Devis { get; set; }
        public DbSet<DevisDetail> DevisDetails { get; set; }
        public DbSet<ProduitService> ProduitServices { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Utilisateur>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Facture>()
                .Property(f => f.Date)
                .HasConversion(
                    v => v.ToUniversalTime(),
                    v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                );


            modelBuilder.Entity<Devis>()
                .Property(d => d.Statut)
                .HasDefaultValue("En attente");

            modelBuilder.Entity<Facture>()
                .HasMany(f => f.Paiements)
                .WithOne(p => p.Facture)
                .HasForeignKey(p => p.FactureId);

            // ✅ Configuration explicite Entreprise → Utilisateur
            modelBuilder.Entity<Entreprise>()
                .HasOne(e => e.Utilisateur)
                .WithMany(u => u.Entreprises)
                .HasForeignKey(e => e.UtilisateurId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    } 
            


    

}