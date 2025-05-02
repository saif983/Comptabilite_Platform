using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCompteBancaireTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "TransactionsBancaires",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Solde",
                table: "ComptesBancaires",
                type: "numeric(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateCreation",
                table: "ComptesBancaires",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Devise",
                table: "ComptesBancaires",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "EstActif",
                table: "ComptesBancaires",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Nom",
                table: "ComptesBancaires",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "ComptesBancaires",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "TransactionsBancaires");

            migrationBuilder.DropColumn(
                name: "DateCreation",
                table: "ComptesBancaires");

            migrationBuilder.DropColumn(
                name: "Devise",
                table: "ComptesBancaires");

            migrationBuilder.DropColumn(
                name: "EstActif",
                table: "ComptesBancaires");

            migrationBuilder.DropColumn(
                name: "Nom",
                table: "ComptesBancaires");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "ComptesBancaires");

            migrationBuilder.AlterColumn<decimal>(
                name: "Solde",
                table: "ComptesBancaires",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)");
        }
    }
}
