import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface Entreprise {
  id: number;
  nom: string;
  adresse: string;
  mf: string;
  tel: string;
  hasLogo: boolean;
  hasRCS: boolean;
  hasIdentitegerant: boolean;
  hasJustificatifedomicile: boolean;
}

export interface Depense {
  id: number;
  categorie: string;
  fournisseur: string;
  montant: number;
  date: string;
  type: string;
  justificatif: string;
  entreprisID: number;
}

export interface DepenseResponse {
  message: string;
  id: number;
  $id?: string;
}

export interface ApiResponse<T> {
  $values?: T[];
  $id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepenseService {
  private apiDepensesUrl = 'https://localhost:7141/api/depenses';
  private apiEntreprisesUrl = 'https://localhost:7141/api/entreprises';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    // Log détaillé de l'erreur
    console.error('Erreur détaillée:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      message: error.message,
      url: error.url,
      headers: error.headers,
      name: error.name,
      ok: error.ok,
      type: error.type
    });

    let errorMessage = 'Une erreur est survenue';
    let errorDetails = '';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Données invalides';
        errorDetails = error.error?.details || '';
      } else if (error.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.status === 403) {
        errorMessage = 'Accès refusé';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur interne';
        errorDetails = error.error?.details || error.error?.message || 'Une erreur inattendue s\'est produite sur le serveur';
        console.error('Détails de l\'erreur serveur:', errorDetails);
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      details: errorDetails,
      originalError: error
    }));
  }

  getEntreprises(): Observable<Entreprise[]> {
    console.log('Récupération des entreprises depuis:', `${this.apiEntreprisesUrl}/all`);
    
    return this.http.get<ApiResponse<Entreprise> | Entreprise[]>(`${this.apiEntreprisesUrl}/all`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        console.log('Réponse brute du serveur (entreprises):', response);
      }),
      map(response => {
        // Gérer les différents formats de réponse possibles
        if (Array.isArray(response)) {
          console.log('Format de réponse: tableau simple');
          return response;
        } else if (response && '$values' in response && Array.isArray(response.$values)) {
          console.log('Format de réponse: objet avec $values');
          return response.$values;
        } else if (response && typeof response === 'object') {
          console.log('Format de réponse: objet sans $values, tentative de conversion');
          // Essayer de convertir l'objet en tableau si possible
          const entries = Object.entries(response)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([_, value]) => value as Entreprise);
          
          if (entries.length > 0) {
            return entries;
          }
        }
        
        // Si aucun format reconnu
        console.warn('Format de réponse non reconnu:', response);
        return [];
      }),
      catchError(error => {
        console.error('Erreur complète lors de la récupération des entreprises:', error);
        
        if (error.status === 0) {
          alert('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
        } else if (error.status >= 500) {
          alert(`Erreur serveur (${error.status}). Veuillez réessayer plus tard.`);
        }
        
        return of([]);
      })
    );
  }

  createDepense(formData: any): Observable<any> {
    // Log des données envoyées de manière sécurisée (sans les binaires)
    console.log('Envoi de la requête à', `${this.apiDepensesUrl}/create`);
    
    // Ne pas définir le Content-Type pour FormData (le navigateur l'ajoutera avec la boundary)
    return this.http.post(`${this.apiDepensesUrl}/create`, formData, {
      headers: {
        'Accept': 'application/json'
      }
    }).pipe(
      tap(response => {
        console.log('Réponse reçue du serveur:', response);
      }),
      catchError(error => {
        console.error('Erreur lors de la création de la dépense:', error);
        console.error('Détails de l\'erreur:', error.error);
        
        // Extraire les détails de l'erreur le cas échéant
        let details = '';
        if (error.error && typeof error.error === 'object') {
          if (error.error.message) details = error.error.message;
          if (error.error.details) details += ` (${error.error.details})`;
        }
        
        return throwError(() => ({
          status: error.status,
          message: 'Erreur lors de la création de la dépense',
          details: details || error.message,
          error: error
        }));
      })
    );
  }

  getDepensesByEntreprise(entrepriseId: number): Observable<Depense[]> {
    console.log('Récupération des dépenses pour entreprise:', entrepriseId);
    
    if (!entrepriseId) {
      console.error('ID d\'entreprise non valide:', entrepriseId);
      return of([]);
    }

    const url = `${this.apiDepensesUrl}/entreprise/${entrepriseId}`;
    console.log('URL de requête:', url);

    return this.http.get<ApiResponse<Depense> | Depense[]>(url, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        console.log('Réponse brute du serveur (dépenses):', response);
      }),
      map(response => {
        // Gérer les différents formats de réponse possibles
        if (Array.isArray(response)) {
          console.log('Format de réponse: tableau simple');
          return response;
        } else if (response && '$values' in response && Array.isArray(response.$values)) {
          console.log('Format de réponse: objet avec $values');
          return response.$values;
        } else if (response && typeof response === 'object') {
          console.log('Format de réponse: objet sans $values, tentative de conversion');
          // Essayer de convertir l'objet en tableau si possible
          const entries = Object.entries(response)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([_, value]) => value as Depense);
          
          if (entries.length > 0) {
            return entries;
          }
        }
        
        // Si aucun format reconnu
        console.warn('Format de réponse non reconnu:', response);
        return [];
      }),
      catchError(error => {
        console.error('Erreur complète lors de la récupération des dépenses:', error);
        
        if (error.status === 0) {
          alert('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
        } else if (error.status >= 500) {
          alert(`Erreur serveur (${error.status}) lors de la récupération des dépenses. Veuillez réessayer plus tard.`);
        }
        
        return of([]);
      })
    );
  }

  getJustificatif(id: number): Observable<Blob> {
    return this.http.get(`${this.apiDepensesUrl}/${id}/justificatif`, {
      responseType: 'blob',
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erreur lors du téléchargement du justificatif:', error);
        return throwError(() => error);
      })
    );
  }
} 