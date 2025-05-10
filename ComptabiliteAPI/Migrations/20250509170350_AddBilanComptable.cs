using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddBilanComptable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EntrepriseId",
                table: "ComptesBancaires",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ComptesBancaires_EntrepriseId",
                table: "ComptesBancaires",
                column: "EntrepriseId");

            migrationBuilder.AddForeignKey(
                name: "FK_ComptesBancaires_Entreprises_EntrepriseId",
                table: "ComptesBancaires",
                column: "EntrepriseId",
                principalTable: "Entreprises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ComptesBancaires_Entreprises_EntrepriseId",
                table: "ComptesBancaires");

            migrationBuilder.DropIndex(
                name: "IX_ComptesBancaires_EntrepriseId",
                table: "ComptesBancaires");

            migrationBuilder.DropColumn(
                name: "EntrepriseId",
                table: "ComptesBancaires");
        }
    }
}
