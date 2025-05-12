import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { 
  DashboardService, 
  FinancialSummary, 
  InvoiceSummary, 
  ExpenseSummary, 
  QuoteSummary, 
  ChartData 
} from '../../services/dashboard.service';
import { UserService } from 'app/core/user/user.service';

// Enregistrer tous les éléments nécessaires pour Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  @ViewChild('revenueExpenseChart') revenueExpenseChartCanvas: ElementRef;
  @ViewChild('invoiceStatusChart') invoiceStatusChartCanvas: ElementRef;
  @ViewChild('monthlyRevenueChart') monthlyRevenueChartCanvas: ElementRef;

  // Données du tableau de bord
  financialSummary: FinancialSummary;
  invoiceSummary: InvoiceSummary;
  expenseSummary: ExpenseSummary;
  quoteSummary: QuoteSummary;
  chartData: ChartData;
  
  // Nom de l'utilisateur
  userName: string = '';

  // Contrôles pour l'état de chargement et les erreurs
  loading = {
    financial: true,
    invoices: true,
    expenses: true,
    quotes: true,
    charts: true
  };
  
  error = {
    financial: false,
    invoices: false,
    expenses: false,
    quotes: false,
    charts: false
  };

  // Instances des graphiques
  revenueExpenseChartInstance: Chart;
  invoiceStatusChartInstance: Chart;
  monthlyRevenueChartInstance: Chart;

  constructor(
    private dashboardService: DashboardService,
    private userService: UserService
  ) { }

  // Écouteur d'événement de redimensionnement de la fenêtre
  @HostListener('window:resize')
  onResize() {
    // Réinitialiser les graphiques lors du redimensionnement
    if (this.chartData) {
      this.initCharts();
    }
  }

  ngOnInit(): void {
    this.getUserInfo();
    this.loadDashboardData();
  }
  
  // Récupérer les informations de l'utilisateur
  getUserInfo(): void {
    if (this.userService.user) {
      this.userName = this.userService.user.name;
    }
  }

  // Chargement de toutes les données du tableau de bord
  loadDashboardData(): void {
    // Chargement du résumé financier
    this.dashboardService.getFinancialSummary().subscribe(
      data => {
        this.financialSummary = data;
        this.loading.financial = false;
      },
      error => {
        console.error('Erreur lors du chargement du résumé financier', error);
        this.error.financial = true;
        this.loading.financial = false;
      }
    );

    // Chargement du résumé des factures
    this.dashboardService.getInvoiceSummary().subscribe(
      data => {
        this.invoiceSummary = data;
        this.loading.invoices = false;
      },
      error => {
        console.error('Erreur lors du chargement du résumé des factures', error);
        this.error.invoices = true;
        this.loading.invoices = false;
      }
    );

    // Chargement du résumé des dépenses
    this.dashboardService.getExpenseSummary().subscribe(
      data => {
        this.expenseSummary = data;
        this.loading.expenses = false;
      },
      error => {
        console.error('Erreur lors du chargement du résumé des dépenses', error);
        this.error.expenses = true;
        this.loading.expenses = false;
      }
    );

    // Chargement du résumé des devis
    this.dashboardService.getQuoteSummary().subscribe(
      data => {
        this.quoteSummary = data;
        this.loading.quotes = false;
      },
      error => {
        console.error('Erreur lors du chargement du résumé des devis', error);
        this.error.quotes = true;
        this.loading.quotes = false;
      }
    );

    // Chargement des données pour les graphiques
    this.dashboardService.getChartData().subscribe(
      data => {
        this.chartData = data;
        this.loading.charts = false;
        // Initialiser les graphiques après le chargement des données
        setTimeout(() => this.initCharts(), 0);
      },
      error => {
        console.error('Erreur lors du chargement des données de graphiques', error);
        this.error.charts = true;
        this.loading.charts = false;
      }
    );
  }

  // Initialisation des graphiques
  initCharts(): void {
    if (this.chartData) {
      this.initRevenueExpenseChart();
      this.initInvoiceStatusChart();
    }
  }

  // Initialisation du graphique revenus vs dépenses
  initRevenueExpenseChart(): void {
    if (this.monthlyRevenueChartCanvas) {
      const ctx = this.monthlyRevenueChartCanvas.nativeElement.getContext('2d');
      
      if (this.monthlyRevenueChartInstance) {
        this.monthlyRevenueChartInstance.destroy();
      }
      
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      this.monthlyRevenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
          datasets: [
            {
              label: 'Revenus',
              data: [28000, 48000, 40000, 19000, 60000, 27000, 40000, 69000, 75000, 86589, 66000, 74000],
              borderColor: '#4f46e5',
              backgroundColor: gradient,
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointBackgroundColor: '#4f46e5',
              pointHoverBackgroundColor: '#4f46e5',
              pointBorderWidth: 0
            },
            {
              label: 'Prévisions',
              data: [25000, 38000, 30000, 25000, 40000, 20000, 35000, 55000, 65000, 75000, 60000, 55000],
              borderColor: '#94a3b8',
              borderWidth: 2,
              borderDash: [5, 5],
              fill: false,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointBackgroundColor: '#94a3b8',
              pointHoverBackgroundColor: '#94a3b8',
              pointBorderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'white',
              titleColor: '#334155',
              bodyColor: '#64748b',
              borderColor: '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              boxPadding: 6,
              usePointStyle: true,
              callbacks: {
                label: function(context) {
                  const value = context.raw as number;
                  return `${context.dataset.label}: ${value.toLocaleString()} DT`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#94a3b8',
                font: {
                  size: 12
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#f1f5f9'
              },
              border: {
                display: false
              },
              ticks: {
                color: '#94a3b8',
                font: {
                  size: 12
                },
                callback: function(value) {
                  return value.toLocaleString() + ' DT';
                },
                maxTicksLimit: 6
              }
            }
          }
        }
      });
    }
  }

  // Initialisation du graphique de statut des factures
  initInvoiceStatusChart(): void {
    if (this.invoiceStatusChartCanvas) {
      const ctx = this.invoiceStatusChartCanvas.nativeElement.getContext('2d');
      
      if (this.invoiceStatusChartInstance) {
        this.invoiceStatusChartInstance.destroy();
      }
      
      this.invoiceStatusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Terminées', 'En attente', 'Rejetées'],
          datasets: [{
            data: [23042, 14658, 4758],
            backgroundColor: ['#6366f1', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'white',
              titleColor: '#334155',
              bodyColor: '#64748b',
              borderColor: '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              boxPadding: 6,
              usePointStyle: true,
              callbacks: {
                label: function(context) {
                  const value = context.raw as number;
                  const dataArray = context.chart.data.datasets[0].data;
                  let total = 0;
                  for (let i = 0; i < dataArray.length; i++) {
                    total += dataArray[i] as number;
                  }
                  const percentage = Math.round((value / total) * 100);
                  return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }

  // Formatage des nombres en monnaie (DT - Dinar Tunisien)
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', { 
      style: 'currency', 
      currency: 'TND',
      maximumFractionDigits: 3
    }).format(amount);
  }

  // Formatage des dates
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Obtention de la classe CSS pour le statut des factures
  getStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'overdue':
        return 'status-overdue';
      default:
        return '';
    }
  }

  // Traduction du statut des factures
  translateStatus(status: string): string {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  }

  // Rechargement des données du tableau de bord
  refreshDashboard(): void {
    // Réinitialiser les états de chargement et d'erreur
    Object.keys(this.loading).forEach(key => this.loading[key] = true);
    Object.keys(this.error).forEach(key => this.error[key] = false);
    
    // Recharger les données
    this.loadDashboardData();
  }
}
