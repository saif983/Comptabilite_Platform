import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgApexchartsModule } from 'ng-apexcharts';

import { 
  DashboardService, 
  DashboardData, 
  DepenseCategorie, 
  ClientDette 
} from '../core/services/dashboard.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressBarModule,
    NgApexchartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Données du dashboard
  dashboardData: DashboardData;
  
  // État de chargement
  isLoading = true;
  
  // Colonnes pour les tableaux
  depensesColumns: string[] = ['categorie', 'nombreDepenses', 'montantTotal'];
  clientsNonPayesColumns: string[] = ['nomClient', 'nombreFactures', 'montantTotal'];
  depensesRecentesColumns: string[] = ['date', 'fournisseur', 'categorie', 'montant'];
  
  // Options pour les graphiques
  revenueChartOptions: any;
  depensesChartOptions: any;
  paiementChartOptions: any;
  devisChartOptions: any;
  
  // Gestion des souscriptions
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  ngOnDestroy(): void {
    // Désabonnement des observables
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
  
  /**
   * Charge les données du dashboard depuis l'API
   */
  loadDashboardData(): void {
    this.isLoading = true;
    
    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          console.log('Données du tableau de bord chargées:', data);
          this.dashboardData = data;
          this.isLoading = false;
          
          // Initialiser les graphiques après avoir obtenu les données
          this.initRevenueChart();
          this.initPaiementsChart();
          this.initDevisChart();
          this.initDepensesChart();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur lors du chargement des données du tableau de bord:', error);
          
          // Afficher un message d'erreur plus détaillé
          const errorMessage = error.status === 0 
            ? 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.' 
            : error.error || 'Une erreur est survenue lors du chargement des données.';
            
          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  /**
   * Initialise le graphique des revenus
   */
  initRevenueChart(): void {
    if (!this.dashboardData?.revenueAnalytics) return;
    
    const categories = this.dashboardData.revenueAnalytics.revenusMensuels.map(m => m.mois);
    const data = this.dashboardData.revenueAnalytics.revenusMensuels.map(m => m.montant);
    
    this.revenueChartOptions = {
      series: [{
        name: 'Revenus',
        data: data
      }],
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return val.toFixed(2) + ' €';
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#304758"]
        }
      },
      xaxis: {
        categories: categories,
        position: 'bottom',
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        labels: {
          show: true,
          formatter: function(val) {
            return val.toFixed(0) + ' €';
          }
        }
      },
      title: {
        text: 'Revenus mensuels',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      }
    };
  }
  
  /**
   * Initialise le graphique des paiements
   */
  initPaiementsChart(): void {
    if (!this.dashboardData?.paiementStats) return;
    
    this.paiementChartOptions = {
      series: [
        this.dashboardData.paiementStats.pourcentagePayees,
        this.dashboardData.paiementStats.pourcentageNonPayees
      ],
      chart: {
        height: 350,
        type: 'donut'
      },
      labels: ['Factures payées', 'Factures non payées'],
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: function(w) {
                  return w.globals.seriesTotals.reduce((a, b) => {
                    return a + b;
                  }, 0) + '%';
                }
              }
            }
          }
        }
      },
      colors: ['#28a745', '#dc3545'],
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      title: {
        text: 'Statut des paiements',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      }
    };
  }
  
  /**
   * Initialise le graphique des devis
   */
  initDevisChart(): void {
    if (!this.dashboardData?.devisStats) return;
    
    this.devisChartOptions = {
      series: [
        this.dashboardData.devisStats.pourcentageAcceptes,
        this.dashboardData.devisStats.pourcentageEnAttente,
        this.dashboardData.devisStats.pourcentageRefuses
      ],
      chart: {
        height: 350,
        type: 'donut'
      },
      labels: ['Acceptés', 'En attente', 'Refusés'],
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: function(w) {
                  return w.globals.seriesTotals.reduce((a, b) => {
                    return a + b;
                  }, 0) + '%';
                }
              }
            }
          }
        }
      },
      colors: ['#28a745', '#ffc107', '#dc3545'],
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      title: {
        text: 'Statut des devis',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      }
    };
  }
  
  /**
   * Initialise le graphique des dépenses par catégorie
   */
  initDepensesChart(): void {
    if (!this.dashboardData?.depensesParCategorie) return;
    
    const categories = this.dashboardData.depensesParCategorie.map(d => d.categorie);
    const data = this.dashboardData.depensesParCategorie.map(d => d.montantTotal);
    
    this.depensesChartOptions = {
      series: [{
        name: 'Dépenses',
        data: data
      }],
      chart: {
        height: 350,
        type: 'pie'
      },
      labels: categories,
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      title: {
        text: 'Dépenses par catégorie',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      }
    };
  }
  
  /**
   * Formate un montant pour l'affichage
   */
  formatMontant(montant: number): string {
    return montant.toFixed(2) + ' €';
  }
  
  /**
   * Formate une date pour l'affichage
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
  
  /**
   * Calcule le pourcentage de factures payées
   */
  getPourcentageFacturesPayees(): number {
    if (!this.dashboardData?.paiementStats) return 0;
    
    const { totalFactures, facturesPayees } = this.dashboardData.paiementStats;
    if (totalFactures === 0) return 0;
    
    return (facturesPayees / totalFactures) * 100;
  }
  
  /**
   * Vérifie si les données du dashboard sont complètes
   * Permet d'éviter les erreurs si certaines propriétés sont nulles
   */
  hasAllDashboardData(): boolean {
    return !!this.dashboardData &&
           !!this.dashboardData.comptesBancaires &&
           !!this.dashboardData.revenueAnalytics &&
           !!this.dashboardData.paiementStats &&
           !!this.dashboardData.devisStats &&
           !!this.dashboardData.clientsNonPayes &&
           !!this.dashboardData.depensesParCategorie &&
           !!this.dashboardData.listeDepensesRecentes;
  }

  /**
   * Vérifie si un ensemble de données spécifique est disponible
   */
  hasData(dataType: keyof DashboardData): boolean {
    if (!this.dashboardData) return false;
    
    const data = this.dashboardData[dataType];
    
    if (Array.isArray(data)) {
      return data.length > 0;
    }
    
    return !!data;
  }

  /**
   * Réessaie de charger les données si elles sont incomplètes
   */
  reloadDashboardData(): void {
    this.loadDashboardData();
  }
} 