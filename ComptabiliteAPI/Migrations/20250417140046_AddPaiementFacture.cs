using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPaiementFacture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Paiements_FactureId",
                table: "Paiements");

            migrationBuilder.AddColumn<int>(
                name: "UtilisateurId",
                table: "Paiements",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UtilisateurId",
                table: "Factures",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Paiements_FactureId",
                table: "Paiements",
                column: "FactureId");

            migrationBuilder.CreateIndex(
                name: "IX_Paiements_UtilisateurId",
                table: "Paiements",
                column: "UtilisateurId");

            migrationBuilder.CreateIndex(
                name: "IX_Factures_UtilisateurId",
                table: "Factures",
                column: "UtilisateurId");

            migrationBuilder.AddForeignKey(
                name: "FK_Factures_Utilisateurs_UtilisateurId",
                table: "Factures",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Paiements_Utilisateurs_UtilisateurId",
                table: "Paiements",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Factures_Utilisateurs_UtilisateurId",
                table: "Factures");

            migrationBuilder.DropForeignKey(
                name: "FK_Paiements_Utilisateurs_UtilisateurId",
                table: "Paiements");

            migrationBuilder.DropIndex(
                name: "IX_Paiements_FactureId",
                table: "Paiements");

            migrationBuilder.DropIndex(
                name: "IX_Paiements_UtilisateurId",
                table: "Paiements");

            migrationBuilder.DropIndex(
                name: "IX_Factures_UtilisateurId",
                table: "Factures");

            migrationBuilder.DropColumn(
                name: "UtilisateurId",
                table: "Paiements");

            migrationBuilder.DropColumn(
                name: "UtilisateurId",
                table: "Factures");

            migrationBuilder.CreateIndex(
                name: "IX_Paiements_FactureId",
                table: "Paiements",
                column: "FactureId",
                unique: true);
        }
    }
}
