using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToTransactionBancaire : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Paiements_FactureId",
                table: "Paiements");

            migrationBuilder.AddColumn<int>(
                name: "UtilisateurId",
                table: "TransactionsBancaires",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransactionsBancaires_UtilisateurId",
                table: "TransactionsBancaires",
                column: "UtilisateurId");

            migrationBuilder.CreateIndex(
                name: "IX_Paiements_FactureId",
                table: "Paiements",
                column: "FactureId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionsBancaires_Utilisateurs_UtilisateurId",
                table: "TransactionsBancaires",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransactionsBancaires_Utilisateurs_UtilisateurId",
                table: "TransactionsBancaires");

            migrationBuilder.DropIndex(
                name: "IX_TransactionsBancaires_UtilisateurId",
                table: "TransactionsBancaires");

            migrationBuilder.DropIndex(
                name: "IX_Paiements_FactureId",
                table: "Paiements");

            migrationBuilder.DropColumn(
                name: "UtilisateurId",
                table: "TransactionsBancaires");

            migrationBuilder.CreateIndex(
                name: "IX_Paiements_FactureId",
                table: "Paiements",
                column: "FactureId");
        }
    }
}
