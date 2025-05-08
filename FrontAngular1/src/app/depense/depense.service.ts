import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DepenseService {
  private apiUrl = 'https://localhost:7141/api';
  private apiDepensesUrl = 'https://localhost:7141/api/depenses';
  private apiEntreprisesUrl = 'https://localhost:7141/api/entreprises';
  
  constructor(private http: HttpClient) { }

  // Récupérer la liste des entreprises
  getEntreprises(): Observable<any> {
    return this.http.get<any>(`${this.apiEntreprisesUrl}/all`);
  }

  // Récupérer la liste des dépenses par entreprise
  getDepensesParEntreprise(entrepriseId: number): Observable<any> {
    return this.http.get(`${this.apiDepensesUrl}/entreprise/${entrepriseId}`);
  }

  // Créer une nouvelle dépense
  createDepense(formData: FormData): Observable<any> {
    console.log('Service: Envoi createDepense sans options');
    
    // Approche simplifiée sans options pour éviter les problèmes
    return this.http.post<any>(`${this.apiDepensesUrl}/create`, formData);
  }

  // Télécharger un justificatif
  getJustificatif(depenseId: number): Observable<any> {
    return this.http.get(`${this.apiDepensesUrl}/${depenseId}/justificatif`, { 
      responseType: 'blob' 
    });
  }
} 