using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TokenVerification",
                table: "Utilisateurs");

            migrationBuilder.RenameColumn(
                name: "EstVerifie",
                table: "Utilisateurs",
                newName: "IsEmailVerified");

            migrationBuilder.AddColumn<DateTime>(
                name: "TokenExpiration",
                table: "Utilisateurs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationToken",
                table: "Utilisateurs",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TokenExpiration",
                table: "Utilisateurs");

            migrationBuilder.DropColumn(
                name: "VerificationToken",
                table: "Utilisateurs");

            migrationBuilder.RenameColumn(
                name: "IsEmailVerified",
                table: "Utilisateurs",
                newName: "EstVerifie");

            migrationBuilder.AddColumn<string>(
                name: "TokenVerification",
                table: "Utilisateurs",
                type: "text",
                nullable: true);
        }
    }
}
