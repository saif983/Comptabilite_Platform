using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProjetModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TransactionsBancaires");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Paiements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Paiements",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Paiements");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Paiements");

            migrationBuilder.CreateTable(
                name: "TransactionsBancaires",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompteBancaireId = table.Column<int>(type: "integer", nullable: false),
                    UtilisateurId = table.Column<int>(type: "integer", nullable: true),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Montant = table.Column<decimal>(type: "numeric", nullable: false),
                    Statut = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false)
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
                    table.ForeignKey(
                        name: "FK_TransactionsBancaires_Utilisateurs_UtilisateurId",
                        column: x => x.UtilisateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_TransactionsBancaires_CompteBancaireId",
                table: "TransactionsBancaires",
                column: "CompteBancaireId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionsBancaires_UtilisateurId",
                table: "TransactionsBancaires",
                column: "UtilisateurId");
        }
    }
}
