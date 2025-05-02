using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultEntrepriseIdToUtil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Utilisateurs_Entreprises_EntrepriseId",
                table: "Utilisateurs");

            migrationBuilder.RenameColumn(
                name: "EntrepriseId",
                table: "Utilisateurs",
                newName: "DefaultEntrepriseId");

            migrationBuilder.RenameIndex(
                name: "IX_Utilisateurs_EntrepriseId",
                table: "Utilisateurs",
                newName: "IX_Utilisateurs_DefaultEntrepriseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Utilisateurs_Entreprises_DefaultEntrepriseId",
                table: "Utilisateurs",
                column: "DefaultEntrepriseId",
                principalTable: "Entreprises",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Utilisateurs_Entreprises_DefaultEntrepriseId",
                table: "Utilisateurs");

            migrationBuilder.RenameColumn(
                name: "DefaultEntrepriseId",
                table: "Utilisateurs",
                newName: "EntrepriseId");

            migrationBuilder.RenameIndex(
                name: "IX_Utilisateurs_DefaultEntrepriseId",
                table: "Utilisateurs",
                newName: "IX_Utilisateurs_EntrepriseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Utilisateurs_Entreprises_EntrepriseId",
                table: "Utilisateurs",
                column: "EntrepriseId",
                principalTable: "Entreprises",
                principalColumn: "Id");
        }
    }
}
