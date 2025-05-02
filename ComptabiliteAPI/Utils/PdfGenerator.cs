using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ComptabiliteAPI.Models.DTOs;

namespace ComptabiliteAPI.Utils
{
    public static class PdfGenerator
    {
        public static byte[] GenererBilanPdf(RapportBilanDto bilan)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(14));

                    page.Header()
                        .Text("Rapport Bilan Financier")
                        .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Spacing(10);

                            column.Item().Text($"Date du rapport : {DateTime.Now:dd/MM/yyyy}");
                            column.Item().Text($"Total Actifs : {bilan.Actifs} €").FontColor(Colors.Green.Medium);
                            column.Item().Text($"Total Passifs : {bilan.Passifs} €").FontColor(Colors.Red.Medium);
                            column.Item().Text($"Solde : {bilan.Solde} €")
                                .Bold()
                                .FontColor(bilan.Solde >= 0 ? Colors.Green.Darken1 : Colors.Red.Darken1);
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.Span("ComptabilitéAPI - Rapport généré automatiquement");
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}
