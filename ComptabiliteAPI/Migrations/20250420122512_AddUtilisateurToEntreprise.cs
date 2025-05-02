using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUtilisateurToEntreprise : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UtilisateurId",
                table: "Entreprises",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Entreprises_UtilisateurId",
                table: "Entreprises",
                column: "UtilisateurId");

            migrationBuilder.AddForeignKey(
                name: "FK_Entreprises_Utilisateurs_UtilisateurId",
                table: "Entreprises",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Entreprises_Utilisateurs_UtilisateurId",
                table: "Entreprises");

            migrationBuilder.DropIndex(
                name: "IX_Entreprises_UtilisateurId",
                table: "Entreprises");

            migrationBuilder.DropColumn(
                name: "UtilisateurId",
                table: "Entreprises");
        }
    }
}
