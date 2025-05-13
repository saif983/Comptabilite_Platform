import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';

// Interfaces pour les données du dashboard
export interface CompteBancaire {
  id: number;
  nomBanque: string;
  numeroCompte: string;
  typeCompte: string;
  solde: number;
  dateOuverture: Date;
  derniers4Chiffres: string;
}

export interface MontantMensuel {
  mois: string;
  montant: number;
}

export interface RevenueAnalytics {
  revenusMensuels: MontantMensuel[];
  revenusTotal: number;
}

export interface PaiementStats {
  totalFactures: number;
  facturesPayees: number;
  facturesNonPayees: number;
  montantTotal: number;
  montantPaye: number;
  montantNonPaye: number;
  pourcentagePayees: number;
  pourcentageNonPayees: number;
}

export interface DevisStats {
  totalDevis: number;
  devisAcceptes: number;
  devisEnAttente: number;
  devisRefuses: number;
  montantTotal: number;
  montantAccepte: number;
  montantEnAttente: number;
  montantRefuse: number;
  pourcentageAcceptes: number;
  pourcentageEnAttente: number;
  pourcentageRefuses: number;
}

export interface ClientDette {
  nomClient: string;
  nombreFactures: number;
  montantTotal: number;
}

export interface ClientsNonPayes {
  totalClients: number;
  montantTotalDettes: number;
  clients: ClientDette[];
}

export interface DepenseCategorie {
  categorie: string;
  montantTotal: number;
  nombreDepenses: number;
}

export interface DepenseRecente {
  id: number;
  fournisseur: string;
  categorie: string;
  date: Date;
  montant: number;
  justificatif: string;
}

export interface DashboardData {
  comptesBancaires: CompteBancaire[];
  revenueAnalytics: RevenueAnalytics;
  paiementStats: PaiementStats;
  devisStats: DevisStats;
  clientsNonPayes: ClientsNonPayes;
  depensesParCategorie: DepenseCategorie[];
  listeDepensesRecentes: DepenseRecente[];
}

// Interfaces pour le nouveau dashboard component
export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
  accountBalance: number;
  currency: string;
}

export interface InvoiceSummary {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averagePaymentTime: number;
  recentInvoices: {
    id: number;
    client: string;
    amount: number;
    date: Date;
    dueDate: Date;
    status: string;
  }[];
}

export interface ExpenseSummary {
  totalExpenses: number;
  expensesByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  largestExpense: {
    vendor: string;
    category: string;
    amount: number;
    date: Date;
  };
  recentExpenses: {
    id: number;
    vendor: string;
    category: string;
    amount: number;
    date: Date;
  }[];
}

export interface QuoteSummary {
  totalQuotes: number;
  acceptedQuotes: number;
  pendingQuotes: number;
  rejectedQuotes: number;
  totalAmount: number;
  acceptedAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
  conversionRate: number;
}

export interface ChartData {
  monthlyRevenue: {
    month: string;
    revenue: number;
    expenses: number;
  }[];
  invoiceStatus: {
    status: string;
    count: number;
    amount: number;
  }[];
  expensesByCategory: {
    category: string;
    amount: number;
  }[];
  quarterlyGrowth: {
    quarter: string;
    revenue: number;
    growth: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/Dashboard`;

  constructor(private http: HttpClient) { }

  /**
   * Fonction utilitaire pour traiter le format JSON spécial
   */
  private transformSpecialJsonFormat(data: any): any {
    if (!data) return null;
    
    console.log('Données brutes reçues:', data);
    
    // Si les données sont dans le format spécial avec $values
    if (data.$values) {
      return data.$values;
    }
    
    // Si les données contiennent des propriétés avec $values
    const transformedData = { ...data };
    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] && transformedData[key].$values) {
        transformedData[key] = transformedData[key].$values;
      }
    });
    
    return transformedData;
  }

  /**
   * Récupère les données complètes du tableau de bord
   */
  getDashboardData(): Observable<DashboardData> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(data => this.transformSpecialJsonFormat(data)),
      catchError(error => {
        console.error('Erreur lors du chargement des données du dashboard:', error);
        return of(null);
      })
    );
  }

  /**
   * Récupère les comptes bancaires
   */
  getComptesBancaires(): Observable<CompteBancaire[]> {
    return this.getDashboardData().pipe(
      map(data => data?.comptesBancaires || [])
    );
  }

  /**
   * Récupère le résumé financier
   */
  getFinancialSummary(): Observable<FinancialSummary> {
    // Comme l'API ne retourne pas directement ces données, on les génère
    // à partir des données du dashboard ou on utilise des données simulées
    return this.getDashboardData().pipe(
      map(data => {
        if (!data) return this.getDefaultFinancialSummary();
        
        // Calculer le résumé financier à partir des données du dashboard
        const revenueTotal = data.revenueAnalytics?.revenusTotal || 0;
        const depensesTotal = data.depensesParCategorie?.reduce((total, dep) => total + dep.montantTotal, 0) || 0;
        
        return {
          totalRevenue: revenueTotal,
          totalExpenses: depensesTotal,
          netProfit: revenueTotal - depensesTotal,
          revenueGrowth: 12.5,  // Valeur simulée
          expenseGrowth: 8.2,   // Valeur simulée
          profitGrowth: 15.7,   // Valeur simulée
          accountBalance: data.comptesBancaires?.reduce((total, compte) => total + compte.solde, 0) || 0,
          currency: 'DT'
        };
      }),
      catchError(() => of(this.getDefaultFinancialSummary()))
    );
  }

  /**
   * Récupère le résumé des factures (à partir des données de paiement)
   */
  getInvoiceSummary(): Observable<InvoiceSummary> {
    return this.getDashboardData().pipe(
      map(data => {
        if (!data || !data.paiementStats) return this.getDefaultInvoiceSummary();
        
        const paiementStats = data.paiementStats;
        
        // Convertir les données de paiement en résumé de factures
        return {
          totalInvoices: paiementStats.totalFactures,
          paidInvoices: paiementStats.facturesPayees,
          pendingInvoices: paiementStats.facturesNonPayees,
          overdueInvoices: 0, // Non disponible dans les données d'origine
          totalAmount: paiementStats.montantTotal,
          paidAmount: paiementStats.montantPaye,
          pendingAmount: paiementStats.montantNonPaye,
          overdueAmount: 0, // Non disponible dans les données d'origine
          averagePaymentTime: 15, // Valeur simulée
          recentInvoices: [] // Nous n'avons pas ces données détaillées
        };
      }),
      catchError(() => of(this.getDefaultInvoiceSummary()))
    );
  }

  /**
   * Récupère le résumé des dépenses
   */
  getExpenseSummary(): Observable<ExpenseSummary> {
    return this.getDashboardData().pipe(
      map(data => {
        if (!data || !data.depensesParCategorie) return this.getDefaultExpenseSummary();
        
        const depensesTotal = data.depensesParCategorie.reduce((total, dep) => total + dep.montantTotal, 0);
        
        return {
          totalExpenses: depensesTotal,
          expensesByCategory: data.depensesParCategorie.map(dep => ({
            category: dep.categorie,
            amount: dep.montantTotal,
            percentage: (dep.montantTotal / depensesTotal) * 100
          })),
          largestExpense: data.listeDepensesRecentes && data.listeDepensesRecentes.length > 0 
            ? {
                vendor: data.listeDepensesRecentes[0].fournisseur,
                category: data.listeDepensesRecentes[0].categorie,
                amount: data.listeDepensesRecentes[0].montant,
                date: new Date(data.listeDepensesRecentes[0].date)
              }
            : null,
          recentExpenses: (data.listeDepensesRecentes || []).map(dep => ({
            id: dep.id,
            vendor: dep.fournisseur,
            category: dep.categorie,
            amount: dep.montant,
            date: new Date(dep.date)
          }))
        };
      }),
      catchError(() => of(this.getDefaultExpenseSummary()))
    );
  }

  /**
   * Récupère le résumé des devis
   */
  getQuoteSummary(): Observable<QuoteSummary> {
    return this.getDashboardData().pipe(
      map(data => {
        if (!data || !data.devisStats) return this.getDefaultQuoteSummary();
        
        const devisStats = data.devisStats;
        
        return {
          totalQuotes: devisStats.totalDevis,
          acceptedQuotes: devisStats.devisAcceptes,
          pendingQuotes: devisStats.devisEnAttente,
          rejectedQuotes: devisStats.devisRefuses,
          totalAmount: devisStats.montantTotal,
          acceptedAmount: devisStats.montantAccepte,
          pendingAmount: devisStats.montantEnAttente,
          rejectedAmount: devisStats.montantRefuse,
          conversionRate: devisStats.pourcentageAcceptes
        };
      }),
      catchError(() => of(this.getDefaultQuoteSummary()))
    );
  }

  /**
   * Récupère les données pour les graphiques
   */
  getChartData(): Observable<ChartData> {
    return this.getDashboardData().pipe(
      map(data => {
        if (!data) return this.getDefaultChartData();
        
        // Créer les données de graphique à partir des données du dashboard
        return {
          monthlyRevenue: data.revenueAnalytics?.revenusMensuels?.map(m => ({
            month: m.mois,
            revenue: m.montant,
            expenses: m.montant * 0.6 // Simulation de dépenses
          })) || this.getDefaultChartData().monthlyRevenue,
          
          invoiceStatus: [
            { status: 'Payées', count: data.paiementStats?.facturesPayees || 0, amount: data.paiementStats?.montantPaye || 0 },
            { status: 'En attente', count: data.paiementStats?.facturesNonPayees || 0, amount: data.paiementStats?.montantNonPaye || 0 }
          ],
          
          expensesByCategory: data.depensesParCategorie?.map(dep => ({
            category: dep.categorie,
            amount: dep.montantTotal
          })) || [],
          
          quarterlyGrowth: this.getDefaultChartData().quarterlyGrowth
        };
      }),
      catchError(() => of(this.getDefaultChartData()))
    );
  }

  /**
   * Données par défaut pour le résumé financier
   */
  private getDefaultFinancialSummary(): FinancialSummary {
    return {
      totalRevenue: 86589,
      totalExpenses: 43250,
      netProfit: 43339,
      revenueGrowth: 12.5,
      expenseGrowth: 8.2,
      profitGrowth: 15.7,
      accountBalance: 92458,
      currency: 'DT'
    };
  }

  /**
   * Données par défaut pour le résumé des factures
   */
  private getDefaultInvoiceSummary(): InvoiceSummary {
    return {
      totalInvoices: 125,
      paidInvoices: 82,
      pendingInvoices: 32,
      overdueInvoices: 11,
      totalAmount: 86589,
      paidAmount: 57250,
      pendingAmount: 23250,
      overdueAmount: 6089,
      averagePaymentTime: 15,
      recentInvoices: []
    };
  }

  /**
   * Données par défaut pour le résumé des dépenses
   */
  private getDefaultExpenseSummary(): ExpenseSummary {
    return {
      totalExpenses: 43250,
      expensesByCategory: [
        { category: 'Fournitures de bureau', amount: 12500, percentage: 28.9 },
        { category: 'Loyer', amount: 8500, percentage: 19.7 },
        { category: 'Services', amount: 15250, percentage: 35.3 },
        { category: 'Autres', amount: 7000, percentage: 16.1 }
      ],
      largestExpense: {
        vendor: 'STE Immobilière Tunis',
        category: 'Loyer',
        amount: 8500,
        date: new Date()
      },
      recentExpenses: []
    };
  }

  /**
   * Données par défaut pour le résumé des devis
   */
  private getDefaultQuoteSummary(): QuoteSummary {
    return {
      totalQuotes: 42,
      acceptedQuotes: 23,
      pendingQuotes: 14,
      rejectedQuotes: 5,
      totalAmount: 92458,
      acceptedAmount: 54258,
      pendingAmount: 32450,
      rejectedAmount: 5750,
      conversionRate: 54.8
    };
  }

  /**
   * Données par défaut pour les graphiques
   */
  private getDefaultChartData(): ChartData {
    return {
      monthlyRevenue: [
        { month: 'Jan', revenue: 28000, expenses: 16800 },
        { month: 'Fév', revenue: 48000, expenses: 28800 },
        { month: 'Mar', revenue: 40000, expenses: 24000 },
        { month: 'Avr', revenue: 19000, expenses: 11400 },
        { month: 'Mai', revenue: 60000, expenses: 36000 },
        { month: 'Jun', revenue: 27000, expenses: 16200 },
        { month: 'Jul', revenue: 40000, expenses: 24000 },
        { month: 'Aoû', revenue: 69000, expenses: 41400 },
        { month: 'Sep', revenue: 75000, expenses: 45000 },
        { month: 'Oct', revenue: 86589, expenses: 51953 },
        { month: 'Nov', revenue: 66000, expenses: 39600 },
        { month: 'Déc', revenue: 74000, expenses: 44400 }
      ],
      invoiceStatus: [
        { status: 'Payées', count: 82, amount: 57250 },
        { status: 'En attente', count: 32, amount: 23250 },
        { status: 'En retard', count: 11, amount: 6089 }
      ],
      expensesByCategory: [
        { category: 'Fournitures de bureau', amount: 12500 },
        { category: 'Loyer', amount: 8500 },
        { category: 'Services', amount: 15250 },
        { category: 'Autres', amount: 7000 }
      ],
      quarterlyGrowth: [
        { quarter: 'Q1', revenue: 116000, growth: 8.5 },
        { quarter: 'Q2', revenue: 106000, growth: -8.6 },
        { quarter: 'Q3', revenue: 184000, growth: 73.6 },
        { quarter: 'Q4', revenue: 226589, growth: 23.1 }
      ]
    };
  }
} 