using System;
using System.Collections.Generic;

namespace ComptabiliteAPI.Models.DTOs
{
    // DTO principal pour les données du dashboard
    public class DashboardDto
    {
        public FinancialSummaryDto FinancialSummary { get; set; }
        public InvoiceSummaryDto InvoiceSummary { get; set; }
        public ExpenseSummaryDto ExpenseSummary { get; set; }
        public QuoteSummaryDto QuoteSummary { get; set; }
        public ChartDataDto ChartData { get; set; }
        public string EntrepriseName { get; set; }
    }

    // DTO pour le résumé financier
    public class FinancialSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal Profit { get; set; }
        public decimal CashFlow { get; set; }
        public decimal AccountBalance { get; set; }
    }

    // DTO pour le résumé des factures
    public class InvoiceSummaryDto
    {
        public decimal Paid { get; set; }
        public decimal Pending { get; set; }
        public decimal Overdue { get; set; }
        public decimal Total { get; set; }
        public List<InvoiceDto> RecentInvoices { get; set; }
    }

    // DTO pour une facture individuelle
    public class InvoiceDto
    {
        public int Id { get; set; }
        public string ClientName { get; set; }
        public DateTime Date { get; set; }
        public DateTime DueDate { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
    }

    // DTO pour le résumé des dépenses
    public class ExpenseSummaryDto
    {
        public decimal TotalAmount { get; set; }
        public List<ExpenseCategoryDto> Categories { get; set; }
        public List<ExpenseDto> RecentExpenses { get; set; }
    }

    // DTO pour une catégorie de dépense
    public class ExpenseCategoryDto
    {
        public string Category { get; set; }
        public decimal Amount { get; set; }
    }

    // DTO pour une dépense individuelle
    public class ExpenseDto
    {
        public int Id { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
    }

    // DTO pour le résumé des devis
    public class QuoteSummaryDto
    {
        public int Sent { get; set; }
        public int Accepted { get; set; }
        public int Rejected { get; set; }
        public int Expired { get; set; }
        public int Total { get; set; }
    }

    // DTO pour les données des graphiques
    public class ChartDataDto
    {
        public RevenueExpenseChartDto RevenueExpenseChart { get; set; }
        public InvoiceStatusChartDto InvoiceStatusChart { get; set; }
        public MonthlyRevenueChartDto MonthlyRevenueChart { get; set; }
    }

    // DTO pour le graphique des revenus et dépenses
    public class RevenueExpenseChartDto
    {
        public List<string> Labels { get; set; }
        public List<ChartDatasetDto> Datasets { get; set; }
    }

    // DTO pour un dataset de graphique
    public class ChartDatasetDto
    {
        public string Label { get; set; }
        public List<decimal> Data { get; set; }
        public string BackgroundColor { get; set; }
    }

    // DTO pour le graphique du statut des factures
    public class InvoiceStatusChartDto
    {
        public List<string> Labels { get; set; }
        public List<decimal> Data { get; set; }
        public List<string> BackgroundColor { get; set; }
    }

    // DTO pour le graphique des revenus mensuels
    public class MonthlyRevenueChartDto
    {
        public List<string> Labels { get; set; }
        public List<decimal> Data { get; set; }
    }
} 