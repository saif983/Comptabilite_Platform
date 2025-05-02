using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddteAttrebiFacture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProduitServices_Entreprises_EntrepriseId",
                table: "ProduitServices");

            migrationBuilder.AlterColumn<int>(
                name: "EntrepriseId",
                table: "ProduitServices",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdressClient",
                table: "Factures",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CinClient",
                table: "Factures",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomClient",
                table: "Factures",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TelClient",
                table: "Factures",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_ProduitServices_Entreprises_EntrepriseId",
                table: "ProduitServices",
                column: "EntrepriseId",
                principalTable: "Entreprises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProduitServices_Entreprises_EntrepriseId",
                table: "ProduitServices");

            migrationBuilder.DropColumn(
                name: "AdressClient",
                table: "Factures");

            migrationBuilder.DropColumn(
                name: "CinClient",
                table: "Factures");

            migrationBuilder.DropColumn(
                name: "NomClient",
                table: "Factures");

            migrationBuilder.DropColumn(
                name: "TelClient",
                table: "Factures");

            migrationBuilder.AlterColumn<int>(
                name: "EntrepriseId",
                table: "ProduitServices",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_ProduitServices_Entreprises_EntrepriseId",
                table: "ProduitServices",
                column: "EntrepriseId",
                principalTable: "Entreprises",
                principalColumn: "Id");
        }
    }
}
