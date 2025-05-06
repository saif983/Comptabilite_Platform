using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddtestringNumDevis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "NumDevis",
                table: "Devis",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "NumDevis",
                table: "Devis",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
