using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePaiement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompteBancaireId",
                table: "Paiements",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Paiements_CompteBancaireId",
                table: "Paiements",
                column: "CompteBancaireId");

            migrationBuilder.AddForeignKey(
                name: "FK_Paiements_ComptesBancaires_CompteBancaireId",
                table: "Paiements",
                column: "CompteBancaireId",
                principalTable: "ComptesBancaires",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Paiements_ComptesBancaires_CompteBancaireId",
                table: "Paiements");

            migrationBuilder.DropIndex(
                name: "IX_Paiements_CompteBancaireId",
                table: "Paiements");

            migrationBuilder.DropColumn(
                name: "CompteBancaireId",
                table: "Paiements");
        }
    }
}
