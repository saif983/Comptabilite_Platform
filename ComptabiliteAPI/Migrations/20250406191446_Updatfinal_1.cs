using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class Updatfinal_1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NumeroFacture",
                table: "Factures");

            migrationBuilder.AddColumn<int>(
                name: "NumFacture",
                table: "Factures",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NumFacture",
                table: "Factures");

            migrationBuilder.AddColumn<string>(
                name: "NumeroFacture",
                table: "Factures",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
