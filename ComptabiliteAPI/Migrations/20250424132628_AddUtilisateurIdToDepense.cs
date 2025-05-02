using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUtilisateurIdToDepense : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UtilisateurId",
                table: "Depenses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Depenses_UtilisateurId",
                table: "Depenses",
                column: "UtilisateurId");

            migrationBuilder.AddForeignKey(
                name: "FK_Depenses_Utilisateurs_UtilisateurId",
                table: "Depenses",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Depenses_Utilisateurs_UtilisateurId",
                table: "Depenses");

            migrationBuilder.DropIndex(
                name: "IX_Depenses_UtilisateurId",
                table: "Depenses");

            migrationBuilder.DropColumn(
                name: "UtilisateurId",
                table: "Depenses");
        }
    }
}
