using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Utilisateurs_Utilisateurs_UtilisateurId",
                table: "Utilisateurs");

            migrationBuilder.DropIndex(
                name: "IX_Utilisateurs_UtilisateurId",
                table: "Utilisateurs");

            migrationBuilder.DropColumn(
                name: "UtilisateurId",
                table: "Utilisateurs");

            migrationBuilder.AddColumn<bool>(
                name: "EstVerifie",
                table: "Utilisateurs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TokenVerification",
                table: "Utilisateurs",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_Email",
                table: "Utilisateurs",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Utilisateurs_Email",
                table: "Utilisateurs");

            migrationBuilder.DropColumn(
                name: "EstVerifie",
                table: "Utilisateurs");

            migrationBuilder.DropColumn(
                name: "TokenVerification",
                table: "Utilisateurs");

            migrationBuilder.AddColumn<int>(
                name: "UtilisateurId",
                table: "Utilisateurs",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_UtilisateurId",
                table: "Utilisateurs",
                column: "UtilisateurId");

            migrationBuilder.AddForeignKey(
                name: "FK_Utilisateurs_Utilisateurs_UtilisateurId",
                table: "Utilisateurs",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id");
        }
    }
}
