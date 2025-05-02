using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCompteBancaire : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstActif",
                table: "ComptesBancaires");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "ComptesBancaires",
                newName: "TypeCompte");

            migrationBuilder.RenameColumn(
                name: "Nom",
                table: "ComptesBancaires",
                newName: "NumeroCompte");

            migrationBuilder.RenameColumn(
                name: "Devise",
                table: "ComptesBancaires",
                newName: "NomBanque");

            migrationBuilder.RenameColumn(
                name: "DateCreation",
                table: "ComptesBancaires",
                newName: "DateOuverture");

            migrationBuilder.AlterColumn<decimal>(
                name: "Solde",
                table: "ComptesBancaires",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateFermeture",
                table: "ComptesBancaires",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateFermeture",
                table: "ComptesBancaires");

            migrationBuilder.RenameColumn(
                name: "TypeCompte",
                table: "ComptesBancaires",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "NumeroCompte",
                table: "ComptesBancaires",
                newName: "Nom");

            migrationBuilder.RenameColumn(
                name: "NomBanque",
                table: "ComptesBancaires",
                newName: "Devise");

            migrationBuilder.RenameColumn(
                name: "DateOuverture",
                table: "ComptesBancaires",
                newName: "DateCreation");

            migrationBuilder.AlterColumn<decimal>(
                name: "Solde",
                table: "ComptesBancaires",
                type: "numeric(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AddColumn<bool>(
                name: "EstActif",
                table: "ComptesBancaires",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
