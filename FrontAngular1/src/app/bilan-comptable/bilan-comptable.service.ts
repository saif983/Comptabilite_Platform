import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

export interface BilanElement {
  label: string;
  montant: number;
}

export interface BilanComptable {
  title: string;
  actif: {
    immobilisations: BilanElement[];
    total_immobilisations: number;
    actif_circulant: BilanElement[];
    total_actif_circulant: number;
    total_actif: number;
  };
  passif: {
    capitaux_propres: BilanElement[];
    total_capitaux_propres: number;
    dettes: BilanElement[];
    total_dettes: number;
    total_passif: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BilanComptableService {
  private apiUrl = `${environment.apiUrl}/bilan`;

  constructor(private http: HttpClient) { 
    console.log('BilanComptableService URL:', this.apiUrl);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem('accessToken') || ''}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur détaillée:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      message: error.message,
      url: error.url
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

  getBilanForEntreprise(entrepriseId: number, capital?: number): Observable<BilanComptable> {
    console.log('Récupération du bilan pour entreprise:', entrepriseId, 'avec capital:', capital);
    
    if (!entrepriseId) {
      console.error('ID d\'entreprise non valide:', entrepriseId);
      return throwError(() => new Error('ID d\'entreprise non valide'));
    }

    let url = `${this.apiUrl}/${entrepriseId}`;
    if (capital !== undefined && capital !== null) {
      url += `?capital=${capital}`;
    }
    console.log('URL de requête:', url);

    return this.http.get<BilanComptable>(url, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        console.log('Réponse brute du serveur (bilan):', response);
      }),
      catchError(this.handleError)
    );
  }

  // Cette méthode est pour tester si l'API est accessible
  testApiConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`, {
      headers: this.getHeaders()
    }).pipe(
      tap(_ => console.log('Test de connexion API réussi')),
      catchError(_ => {
        console.log('API non accessible, mais ce n\'est pas une erreur bloquante');
        return of(false);
      })
    );
  }
}
