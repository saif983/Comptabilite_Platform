import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private apiFactureUrl = 'https://localhost:7141/api/facture';
  private apiProduitServiceUrl = 'https://localhost:7141/api/ProduitService';
  private apiEntrepriseUrl = 'https://localhost:7141/api/entreprises';
  private apiPaiementUrl = 'https://localhost:7141/api/paiement';

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
  
  importerFacturePDF(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.apiFactureUrl}/importer-pdf`, formData).pipe(
      tap(() => {
        // Refresh the page immediately after successful import
        window.location.reload();
      })
    );
  }
  
  // Méthodes pour la gestion des paiements
  getAllPaiements(): Observable<any> {
    return this.http.get<any>(`${this.apiPaiementUrl}/all`);
  }
  
  ajouterPaiement(paiement: any): Observable<any> {
    console.log('Service - Sending payment data:', JSON.stringify(paiement, null, 2));
    
    return this.http.post(`${this.apiPaiementUrl}/ajouter`, paiement, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }
}
