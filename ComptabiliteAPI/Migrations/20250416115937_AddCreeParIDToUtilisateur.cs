using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCreeParIDToUtilisateur : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Utilisateurs_Utilisateurs_UtilisateurId",
                table: "Utilisateurs");

            migrationBuilder.RenameColumn(
                name: "UtilisateurId",
                table: "Utilisateurs",
                newName: "CreeParId");

            migrationBuilder.RenameIndex(
                name: "IX_Utilisateurs_UtilisateurId",
                table: "Utilisateurs",
                newName: "IX_Utilisateurs_CreeParId");

            migrationBuilder.AddForeignKey(
                name: "FK_Utilisateurs_Utilisateurs_CreeParId",
                table: "Utilisateurs",
                column: "CreeParId",
                principalTable: "Utilisateurs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Utilisateurs_Utilisateurs_CreeParId",
                table: "Utilisateurs");

            migrationBuilder.RenameColumn(
                name: "CreeParId",
                table: "Utilisateurs",
                newName: "UtilisateurId");

            migrationBuilder.RenameIndex(
                name: "IX_Utilisateurs_CreeParId",
                table: "Utilisateurs",
                newName: "IX_Utilisateurs_UtilisateurId");

            migrationBuilder.AddForeignKey(
                name: "FK_Utilisateurs_Utilisateurs_UtilisateurId",
                table: "Utilisateurs",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id");
        }
    }
}
