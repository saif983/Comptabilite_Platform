using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class Updatefinal_2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NumDevis",
                table: "Devis",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "FactureDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FactureId = table.Column<int>(type: "integer", nullable: false),
                    ProduitServiceId = table.Column<int>(type: "integer", nullable: false),
                    Quantite = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FactureDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FactureDetails_Factures_FactureId",
                        column: x => x.FactureId,
                        principalTable: "Factures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FactureDetails_ProduitServices_ProduitServiceId",
                        column: x => x.ProduitServiceId,
                        principalTable: "ProduitServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FactureDetails_FactureId",
                table: "FactureDetails",
                column: "FactureId");

            migrationBuilder.CreateIndex(
                name: "IX_FactureDetails_ProduitServiceId",
                table: "FactureDetails",
                column: "ProduitServiceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FactureDetails");

            migrationBuilder.DropColumn(
                name: "NumDevis",
                table: "Devis");
        }
    }
}
