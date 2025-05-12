import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  cashFlow: number;
  accountBalance: number;
}

export interface InvoiceSummary {
  paid: number;
  pending: number;
  overdue: number;
  total: number;
  recentInvoices: Invoice[];
}

export interface ExpenseSummary {
  totalAmount: number;
  categories: {category: string, amount: number}[];
  recentExpenses: Expense[];
}

export interface Invoice {
  id: number;
  clientName: string;
  date: Date;
  dueDate: Date;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Expense {
  id: number;
  category: string;
  description: string;
  date: Date;
  amount: number;
}

export interface QuoteSummary {
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  total: number;
}

export interface ChartData {
  revenueExpenseChart: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  invoiceStatusChart: {
    labels: string[];
    data: number[];
    backgroundColor: string[];
  };
  monthlyRevenueChart: {
    labels: string[];
    data: number[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient) { }

  // Obtenir un résumé financier pour l'entreprise par défaut de l'utilisateur
  getFinancialSummary(): Observable<FinancialSummary> {
    return this.http.get<FinancialSummary>(`${this.apiUrl}/dashboard/financial-summary`)
      .pipe(
        catchError(this.handleError<FinancialSummary>('getFinancialSummary', this.getMockFinancialSummary()))
      );
  }

  // Obtenir un résumé des factures pour l'entreprise par défaut de l'utilisateur
  getInvoiceSummary(): Observable<InvoiceSummary> {
    return this.http.get<InvoiceSummary>(`${this.apiUrl}/dashboard/invoice-summary`)
      .pipe(
        catchError(this.handleError<InvoiceSummary>('getInvoiceSummary', this.getMockInvoiceSummary()))
      );
  }

  // Obtenir un résumé des dépenses pour l'entreprise par défaut de l'utilisateur
  getExpenseSummary(): Observable<ExpenseSummary> {
    return this.http.get<ExpenseSummary>(`${this.apiUrl}/dashboard/expense-summary`)
      .pipe(
        catchError(this.handleError<ExpenseSummary>('getExpenseSummary', this.getMockExpenseSummary()))
      );
  }

  // Obtenir un résumé des devis pour l'entreprise par défaut de l'utilisateur
  getQuoteSummary(): Observable<QuoteSummary> {
    return this.http.get<QuoteSummary>(`${this.apiUrl}/dashboard/quote-summary`)
      .pipe(
        catchError(this.handleError<QuoteSummary>('getQuoteSummary', this.getMockQuoteSummary()))
      );
  }

  // Obtenir les données pour les graphiques
  getChartData(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.apiUrl}/dashboard/chart-data`)
      .pipe(
        catchError(this.handleError<ChartData>('getChartData', this.getMockChartData()))
      );
  }

  // Gestionnaire d'erreur générique
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Retourner des données mock en cas d'erreur
      return of(result as T);
    };
  }

  // Données mock pour les tests et le développement

  // Mock de résumé financier
  private getMockFinancialSummary(): FinancialSummary {
    return {
      totalRevenue: 125000,
      totalExpenses: 78500,
      profit: 46500,
      cashFlow: 38700,
      accountBalance: 65200
    };
  }

  // Mock de résumé des factures
  private getMockInvoiceSummary(): InvoiceSummary {
    return {
      paid: 42500,
      pending: 15800,
      overdue: 7300,
      total: 65600,
      recentInvoices: [
        {
          id: 1001,
          clientName: 'Entreprise ABC',
          date: new Date(2023, 4, 15),
          dueDate: new Date(2023, 5, 15),
          amount: 2500,
          status: 'paid'
        },
        {
          id: 1002,
          clientName: 'Société XYZ',
          date: new Date(2023, 5, 2),
          dueDate: new Date(2023, 6, 2),
          amount: 3800,
          status: 'pending'
        },
        {
          id: 1003,
          clientName: 'Entreprise 123',
          date: new Date(2023, 4, 1),
          dueDate: new Date(2023, 5, 1),
          amount: 1700,
          status: 'overdue'
        },
        {
          id: 1004,
          clientName: 'Client Premium',
          date: new Date(2023, 5, 10),
          dueDate: new Date(2023, 6, 10),
          amount: 4200,
          status: 'paid'
        }
      ]
    };
  }

  // Mock de résumé des dépenses
  private getMockExpenseSummary(): ExpenseSummary {
    return {
      totalAmount: 78500,
      categories: [
        { category: 'Salaires', amount: 45000 },
        { category: 'Loyer', amount: 12000 },
        { category: 'Services', amount: 8500 },
        { category: 'Matériel', amount: 7500 },
        { category: 'Marketing', amount: 5500 }
      ],
      recentExpenses: [
        {
          id: 2001,
          category: 'Salaires',
          description: 'Salaires employés mai',
          date: new Date(2023, 4, 28),
          amount: 15000
        },
        {
          id: 2002,
          category: 'Loyer',
          description: 'Loyer bureau juin',
          date: new Date(2023, 5, 5),
          amount: 4000
        },
        {
          id: 2003,
          category: 'Services',
          description: 'Services cloud',
          date: new Date(2023, 5, 3),
          amount: 1200
        },
        {
          id: 2004,
          category: 'Marketing',
          description: 'Campagne publicitaire',
          date: new Date(2023, 5, 10),
          amount: 2500
        }
      ]
    };
  }

  // Mock de résumé des devis
  private getMockQuoteSummary(): QuoteSummary {
    return {
      sent: 32,
      accepted: 18,
      rejected: 7,
      expired: 4,
      total: 61
    };
  }

  // Mock de données pour les graphiques
  private getMockChartData(): ChartData {
    return {
      revenueExpenseChart: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui'],
        datasets: [
          {
            label: 'Revenus',
            data: [15200, 18500, 20100, 21500, 22800, 26900],
            backgroundColor: 'rgba(46, 204, 113, 0.7)'
          },
          {
            label: 'Dépenses',
            data: [10300, 12100, 13200, 14500, 13800, 14600],
            backgroundColor: 'rgba(231, 76, 60, 0.7)'
          }
        ]
      },
      invoiceStatusChart: {
        labels: ['Payées', 'En attente', 'En retard'],
        data: [42500, 15800, 7300],
        backgroundColor: [
          'rgba(46, 204, 113, 0.7)',
          'rgba(52, 152, 219, 0.7)',
          'rgba(231, 76, 60, 0.7)'
        ]
      },
      monthlyRevenueChart: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        data: [15200, 18500, 20100, 21500, 22800, 26900, 24700, 23800, 25600, 27900, 28700, 30200]
      }
    };
  }
} 