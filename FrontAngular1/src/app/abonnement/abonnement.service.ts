import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Abonnement {
  type: string;
  prix: number;
  dateDebut: string;
  dateFin: string;
}

@Injectable({
  providedIn: 'root'
})
export class AbonnementService {
  private apiUrl = 'https://localhost:7141/api/Abonnement';
  
  constructor(private http: HttpClient) {}

  /**
   * Changer le type d'abonnement
   */
  changerAbonnement(type: string): Observable<{
    message: string;
    type: string;
    prix: number;
    dateDebut: string;
    dateFin: string;
  }> {
    return this.http.post<{
      message: string;
      type: string;
      prix: number;
      dateDebut: string;
      dateFin: string;
    }>(
      `${this.apiUrl}/changer`,
      { type },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }

  /**
   * Récupérer l'abonnement actuel de l'utilisateur connecté
   */
  getMonAbonnement(): Observable<Abonnement> {
    return this.http.get<Abonnement>(`${this.apiUrl}/mon`); 
  }
  
  /**
   * Récupérer la liste des abonnements disponibles (optionnel)
   */
 
}