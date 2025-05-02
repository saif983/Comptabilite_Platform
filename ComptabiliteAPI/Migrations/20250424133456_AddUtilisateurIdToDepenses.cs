using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUtilisateurIdToDepenses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Depenses_Utilisateurs_UtilisateurId",
                table: "Depenses");

            migrationBuilder.AlterColumn<int>(
                name: "UtilisateurId",
                table: "Depenses",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Depenses_Utilisateurs_UtilisateurId",
                table: "Depenses",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Depenses_Utilisateurs_UtilisateurId",
                table: "Depenses");

            migrationBuilder.AlterColumn<int>(
                name: "UtilisateurId",
                table: "Depenses",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Depenses_Utilisateurs_UtilisateurId",
                table: "Depenses",
                column: "UtilisateurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
