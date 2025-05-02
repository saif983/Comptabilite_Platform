using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class migratioAbonnemets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AbonnementId",
                table: "Utilisateurs",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Abonnements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Prix = table.Column<decimal>(type: "numeric", nullable: false),
                    DateDebut = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DateFin = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Abonnements", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_AbonnementId",
                table: "Utilisateurs",
                column: "AbonnementId");

            migrationBuilder.AddForeignKey(
                name: "FK_Utilisateurs_Abonnements_AbonnementId",
                table: "Utilisateurs",
                column: "AbonnementId",
                principalTable: "Abonnements",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Utilisateurs_Abonnements_AbonnementId",
                table: "Utilisateurs");

            migrationBuilder.DropTable(
                name: "Abonnements");

            migrationBuilder.DropIndex(
                name: "IX_Utilisateurs_AbonnementId",
                table: "Utilisateurs");

            migrationBuilder.DropColumn(
                name: "AbonnementId",
                table: "Utilisateurs");
        }
    }
}
