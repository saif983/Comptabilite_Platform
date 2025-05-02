using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Depenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Fournisseur = table.Column<string>(type: "text", nullable: false),
                    Montant = table.Column<decimal>(type: "numeric", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Justificatif = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Depenses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Entreprises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nom = table.Column<string>(type: "text", nullable: false),
                    Adresse = table.Column<string>(type: "text", nullable: false),
                    Parametres = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entreprises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Bilans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntrepriseId = table.Column<int>(type: "integer", nullable: false),
                    ActifTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    PassifTotal = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bilans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bilans_Entreprises_EntrepriseId",
                        column: x => x.EntrepriseId,
                        principalTable: "Entreprises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ComptesResultats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntrepriseId = table.Column<int>(type: "integer", nullable: false),
                    Produits = table.Column<decimal>(type: "numeric", nullable: false),
                    Charges = table.Column<decimal>(type: "numeric", nullable: false),
                    ResultatNet = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComptesResultats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComptesResultats_Entreprises_EntrepriseId",
                        column: x => x.EntrepriseId,
                        principalTable: "Entreprises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DeclarationsCNSSes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntrepriseId = table.Column<int>(type: "integer", nullable: false),
                    Periode = table.Column<string>(type: "text", nullable: false),
                    NombreEmployes = table.Column<int>(type: "integer", nullable: false),
                    MontantCotisation = table.Column<decimal>(type: "numeric", nullable: false),
                    Etat = table.Column<string>(type: "text", nullable: false),
                    Statut = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeclarationsCNSSes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeclarationsCNSSes_Entreprises_EntrepriseId",
                        column: x => x.EntrepriseId,
                        principalTable: "Entreprises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DeclarationsFiscales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntrepriseId = table.Column<int>(type: "integer", nullable: false),
                    Periode = table.Column<string>(type: "text", nullable: false),
                    MontantTva = table.Column<decimal>(type: "numeric", nullable: false),
                    Etat = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeclarationsFiscales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeclarationsFiscales_Entreprises_EntrepriseId",
                        column: x => x.EntrepriseId,
                        principalTable: "Entreprises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Devis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntrepriseId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Statut = table.Column<string>(type: "text", nullable: false),
                    MontantTotal = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devis", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Devis_Entreprises_EntrepriseId",
                        column: x => x.EntrepriseId,
                        principalTable: "Entreprises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Factures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NumeroFacture = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MontantTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    EstPayee = table.Column<bool>(type: "boolean", nullable: false),
                    EntrepriseId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Factures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Factures_Entreprises_EntrepriseId",
                        column: x => x.EntrepriseId,
                        principalTable: "Entreprises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GrandsLivres",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntrepriseId = table.Column<int>(type: "integer", nullable: false),
                    DateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DateModification = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GrandsLivres", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GrandsLivres_Entreprises_EntrepriseId",
                        column: x => x.EntrepriseId,
                        principalTable: "Entreprises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProduitsServices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Description = table.Column<string>(type: "text", nullable: false),
                    PrixUnitaire = table.Column<decimal>(type: "numeric", nullable: false),
                    TVA = table.Column<decimal>(type: "numeric", nullable: false),
                    EntrepriseId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProduitsServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProduitsServices_Entreprises_EntrepriseId",
                        column: x => x.EntrepriseId,
                        principalTable: "Entreprises",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Utilisateurs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nom = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    MotDePasse = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    EntrepriseId = table.Column<int>(type: "integer", nullable: true),
                    UtilisateurId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Utilisateurs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Utilisateurs_Entreprises_EntrepriseId",
                        column: x => x.EntrepriseId,
                        principalTable: "Entreprises",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Utilisateurs_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Paiements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FactureId = table.Column<int>(type: "integer", nullable: false),
                    Montant = table.Column<decimal>(type: "numeric", nullable: false),
                    DatePaiement = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ModePaiement = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Paiements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Paiements_Factures_FactureId",
                        column: x => x.FactureId,
                        principalTable: "Factures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Comptes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nom = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Solde = table.Column<decimal>(type: "numeric", nullable: false),
                    GrandLivreId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comptes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comptes_GrandsLivres_GrandLivreId",
                        column: x => x.GrandLivreId,
                        principalTable: "GrandsLivres",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ComptesBancaires",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UtilisateurId = table.Column<int>(type: "integer", nullable: false),
                    Solde = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComptesBancaires", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComptesBancaires_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransactionsBancaires",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompteBancaireId = table.Column<int>(type: "integer", nullable: false),
                    Montant = table.Column<decimal>(type: "numeric", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Statut = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransactionsBancaires", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransactionsBancaires_ComptesBancaires_CompteBancaireId",
                        column: x => x.CompteBancaireId,
                        principalTable: "ComptesBancaires",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bilans_EntrepriseId",
                table: "Bilans",
                column: "EntrepriseId");

            migrationBuilder.CreateIndex(
                name: "IX_Comptes_GrandLivreId",
                table: "Comptes",
                column: "GrandLivreId");

            migrationBuilder.CreateIndex(
                name: "IX_ComptesBancaires_UtilisateurId",
                table: "ComptesBancaires",
                column: "UtilisateurId");

            migrationBuilder.CreateIndex(
                name: "IX_ComptesResultats_EntrepriseId",
                table: "ComptesResultats",
                column: "EntrepriseId");

            migrationBuilder.CreateIndex(
                name: "IX_DeclarationsCNSSes_EntrepriseId",
                table: "DeclarationsCNSSes",
                column: "EntrepriseId");

            migrationBuilder.CreateIndex(
                name: "IX_DeclarationsFiscales_EntrepriseId",
                table: "DeclarationsFiscales",
                column: "EntrepriseId");

            migrationBuilder.CreateIndex(
                name: "IX_Devis_EntrepriseId",
                table: "Devis",
                column: "EntrepriseId");

            migrationBuilder.CreateIndex(
                name: "IX_Factures_EntrepriseId",
                table: "Factures",
                column: "EntrepriseId");

            migrationBuilder.CreateIndex(
                name: "IX_GrandsLivres_EntrepriseId",
                table: "GrandsLivres",
                column: "EntrepriseId");

            migrationBuilder.CreateIndex(
                name: "IX_Paiements_FactureId",
                table: "Paiements",
                column: "FactureId");

            migrationBuilder.CreateIndex(
                name: "IX_ProduitsServices_EntrepriseId",
                table: "ProduitsServices",
                column: "EntrepriseId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionsBancaires_CompteBancaireId",
                table: "TransactionsBancaires",
                column: "CompteBancaireId");

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_EntrepriseId",
                table: "Utilisateurs",
                column: "EntrepriseId");

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_UtilisateurId",
                table: "Utilisateurs",
                column: "UtilisateurId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bilans");

            migrationBuilder.DropTable(
                name: "Comptes");

            migrationBuilder.DropTable(
                name: "ComptesResultats");

            migrationBuilder.DropTable(
                name: "DeclarationsCNSSes");

            migrationBuilder.DropTable(
                name: "DeclarationsFiscales");

            migrationBuilder.DropTable(
                name: "Depenses");

            migrationBuilder.DropTable(
                name: "Devis");

            migrationBuilder.DropTable(
                name: "Paiements");

            migrationBuilder.DropTable(
                name: "ProduitsServices");

            migrationBuilder.DropTable(
                name: "TransactionsBancaires");

            migrationBuilder.DropTable(
                name: "GrandsLivres");

            migrationBuilder.DropTable(
                name: "Factures");

            migrationBuilder.DropTable(
                name: "ComptesBancaires");

            migrationBuilder.DropTable(
                name: "Utilisateurs");

            migrationBuilder.DropTable(
                name: "Entreprises");
        }
    }
}
