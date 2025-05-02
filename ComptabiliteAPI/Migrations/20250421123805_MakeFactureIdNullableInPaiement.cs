using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeFactureIdNullableInPaiement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Paiements_Factures_FactureId",
                table: "Paiements");

            migrationBuilder.AlterColumn<int>(
                name: "FactureId",
                table: "Paiements",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Paiements_Factures_FactureId",
                table: "Paiements",
                column: "FactureId",
                principalTable: "Factures",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Paiements_Factures_FactureId",
                table: "Paiements");

            migrationBuilder.AlterColumn<int>(
                name: "FactureId",
                table: "Paiements",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Paiements_Factures_FactureId",
                table: "Paiements",
                column: "FactureId",
                principalTable: "Factures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
