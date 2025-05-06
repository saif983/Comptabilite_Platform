import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private apiDevisUrl = 'https://localhost:7141/api/devis';
  private apiProduitServiceUrl = 'https://localhost:7141/api/ProduitService';
  private apiEntrepriseUrl = 'https://localhost:7141/api/entreprises';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  getProduitsServicesByEntreprise(entrepriseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiProduitServiceUrl}/entreprise/${entrepriseId}`);
  }
  
  getEntreprises(): Observable<any> {
    return this.http.get<any>(`${this.apiEntrepriseUrl}/all`);
  }
  
  getDevisByEntreprise(entrepriseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiDevisUrl}/by-entreprise?entrepriseId=${entrepriseId}`);
  }
  
  createDevis(devis: any): Observable<any> {
    console.log('Service - Sending request with data:', JSON.stringify(devis, null, 2));
    return this.http.post<any>(`${this.apiDevisUrl}/create`, devis, this.httpOptions);
  }
  
  updateDevisStatus(devisId: number, statut: string): Observable<any> {
    console.log(`Service - Mise à jour du statut - ID: ${devisId}, Nouveau statut: ${statut}`);
    const url = `${this.apiDevisUrl}/update-status/${devisId}`;
    const payload = { statut }; // Correspond au DTO côté backend

    return this.http.put<any>(url, payload, this.httpOptions).pipe(
      tap(response => {
        console.log('Service - Réponse réussie:', response);
      }),
      catchError(error => {
        console.error('Service - Erreur lors de la mise à jour du statut:', error);
        return throwError(() => error);
      })
    );
  }
} 