using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUtilisateur : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsEmailVerified",
                table: "Utilisateurs");

            migrationBuilder.DropColumn(
                name: "TokenExpiration",
                table: "Utilisateurs");

            migrationBuilder.DropColumn(
                name: "VerificationToken",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                name: "IsEmailVerified",
                table: "Utilisateurs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

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
    }
}
