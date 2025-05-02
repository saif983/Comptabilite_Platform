using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUtilisateurToProduitService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UtilisateurId",
                table: "ProduitServices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ProduitServices_UtilisateurId",
                table: "ProduitServices",
                column: "UtilisateurId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProduitServices_Utilisateurs_UtilisateurId",
                table: "ProduitServices",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProduitServices_Utilisateurs_UtilisateurId",
                table: "ProduitServices");

            migrationBuilder.DropIndex(
                name: "IX_ProduitServices_UtilisateurId",
                table: "ProduitServices");

            migrationBuilder.DropColumn(
                name: "UtilisateurId",
                table: "ProduitServices");
        }
    }
}
