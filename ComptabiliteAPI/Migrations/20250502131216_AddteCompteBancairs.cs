using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddteCompteBancairs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ComptesBancaires_Entreprises_EntrepriseID",
                table: "ComptesBancaires");

            migrationBuilder.DropIndex(
                name: "IX_ComptesBancaires_EntrepriseID",
                table: "ComptesBancaires");

            migrationBuilder.DropColumn(
                name: "EntrepriseID",
                table: "ComptesBancaires");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EntrepriseID",
                table: "ComptesBancaires",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ComptesBancaires_EntrepriseID",
                table: "ComptesBancaires",
                column: "EntrepriseID");

            migrationBuilder.AddForeignKey(
                name: "FK_ComptesBancaires_Entreprises_EntrepriseID",
                table: "ComptesBancaires",
                column: "EntrepriseID",
                principalTable: "Entreprises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
