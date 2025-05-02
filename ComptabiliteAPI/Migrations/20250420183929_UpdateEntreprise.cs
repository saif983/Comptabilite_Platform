using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEntreprise : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Parametres",
                table: "Entreprises",
                newName: "Tel");

            migrationBuilder.AddColumn<string>(
                name: "MF",
                table: "Entreprises",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MF",
                table: "Entreprises");

            migrationBuilder.RenameColumn(
                name: "Tel",
                table: "Entreprises",
                newName: "Parametres");
        }
    }
}
