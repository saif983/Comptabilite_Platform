using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ComptabiliteAPI.Migrations
{
    /// <inheritdoc />
    public partial class deleteStatut : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Statut",
                table: "Devis");

            migrationBuilder.CreateTable(
                name: "DevisDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DevisId = table.Column<int>(type: "integer", nullable: false),
                    ProduitServiceId = table.Column<int>(type: "integer", nullable: false),
                    Quantite = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DevisDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DevisDetails_Devis_DevisId",
                        column: x => x.DevisId,
                        principalTable: "Devis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DevisDetails_ProduitServices_ProduitServiceId",
                        column: x => x.ProduitServiceId,
                        principalTable: "ProduitServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DevisDetails_DevisId",
                table: "DevisDetails",
                column: "DevisId");

            migrationBuilder.CreateIndex(
                name: "IX_DevisDetails_ProduitServiceId",
                table: "DevisDetails",
                column: "ProduitServiceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DevisDetails");

            migrationBuilder.AddColumn<string>(
                name: "Statut",
                table: "Devis",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
