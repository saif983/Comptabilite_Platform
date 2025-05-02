import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private apiFactureUrl = 'https://localhost:7141/api/facture';
  private apiProduitServiceUrl = 'https://localhost:7141/api/ProduitService';
  private apiEntrepriseUrl = 'https://localhost:7141/api/entreprises';

  constructor(private http: HttpClient) {}

  getProduitsServicesByEntreprise(entrepriseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiProduitServiceUrl}/entreprise/${entrepriseId}`);
  }
  
  
  getEntreprises(): Observable<any> {
    return this.http.get<any>(`${this.apiEntrepriseUrl}/all`);
  }
  getFacturesByEntreprise(entrepriseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiFactureUrl}/by-entreprise?entrepriseId=${entrepriseId}`);
  }
  
  createFacture(facture: any): Observable<any> {
    return this.http.post(`${this.apiFactureUrl}/create`, facture, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  
}
