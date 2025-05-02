using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateProduitService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProduitsServices_Entreprises_EntrepriseId",
                table: "ProduitsServices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProduitsServices",
                table: "ProduitsServices");

            migrationBuilder.RenameTable(
                name: "ProduitsServices",
                newName: "ProduitServices");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "ProduitServices",
                newName: "Nom");

            migrationBuilder.RenameIndex(
                name: "IX_ProduitsServices_EntrepriseId",
                table: "ProduitServices",
                newName: "IX_ProduitServices_EntrepriseId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProduitServices",
                table: "ProduitServices",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProduitServices_Entreprises_EntrepriseId",
                table: "ProduitServices",
                column: "EntrepriseId",
                principalTable: "Entreprises",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProduitServices_Entreprises_EntrepriseId",
                table: "ProduitServices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProduitServices",
                table: "ProduitServices");

            migrationBuilder.RenameTable(
                name: "ProduitServices",
                newName: "ProduitsServices");

            migrationBuilder.RenameColumn(
                name: "Nom",
                table: "ProduitsServices",
                newName: "Description");

            migrationBuilder.RenameIndex(
                name: "IX_ProduitServices_EntrepriseId",
                table: "ProduitsServices",
                newName: "IX_ProduitsServices_EntrepriseId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProduitsServices",
                table: "ProduitsServices",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProduitsServices_Entreprises_EntrepriseId",
                table: "ProduitsServices",
                column: "EntrepriseId",
                principalTable: "Entreprises",
                principalColumn: "Id");
        }
    }
}
