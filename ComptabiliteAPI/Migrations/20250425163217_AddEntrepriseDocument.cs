using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddEntrepriseDocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "Identitegerant",
                table: "Entreprises",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "Justificatifedomicile",
                table: "Entreprises",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "Logo",
                table: "Entreprises",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RCS",
                table: "Entreprises",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Identitegerant",
                table: "Entreprises");

            migrationBuilder.DropColumn(
                name: "Justificatifedomicile",
                table: "Entreprises");

            migrationBuilder.DropColumn(
                name: "Logo",
                table: "Entreprises");

            migrationBuilder.DropColumn(
                name: "RCS",
                table: "Entreprises");
        }
    }
}
