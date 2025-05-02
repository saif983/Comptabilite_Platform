using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class DeleteProjetModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comptes");

            migrationBuilder.DropTable(
                name: "ComptesResultats");

            migrationBuilder.DropTable(
                name: "GrandsLivres");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ComptesResultats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntrepriseId = table.Column<int>(type: "integer", nullable: false),
                    Charges = table.Column<decimal>(type: "numeric", nullable: false),
                    Produits = table.Column<decimal>(type: "numeric", nullable: false),
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
                name: "Comptes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GrandLivreId = table.Column<int>(type: "integer", nullable: true),
                    Nom = table.Column<string>(type: "text", nullable: false),
                    Solde = table.Column<decimal>(type: "numeric", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "IX_Comptes_GrandLivreId",
                table: "Comptes",
                column: "GrandLivreId");

            migrationBuilder.CreateIndex(
                name: "IX_ComptesResultats_EntrepriseId",
                table: "ComptesResultats",
                column: "EntrepriseId");

            migrationBuilder.CreateIndex(
                name: "IX_GrandsLivres_EntrepriseId",
                table: "GrandsLivres",
                column: "EntrepriseId");
        }
    }
}
