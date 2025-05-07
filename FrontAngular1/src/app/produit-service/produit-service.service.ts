import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ProduitServiceModel {
  id?: number;
  nom: string;
  prixUnitaire: number;
  tva: number;
  entrepriseId: number;
  utilisateurId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProduitServiceService {
  private apiUrl = 'https://localhost:7141/api/ProduitService';

  constructor(private http: HttpClient) { }

  // Créer des en-têtes avec le token d'authentification
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // Créer un nouveau produit ou service
  createProduitService(produitService: ProduitServiceModel): Observable<ProduitServiceModel> {
    const headers = this.getHeaders();
    
    // Adapter le format du modèle au format attendu par l'API (PascalCase)
    const formattedData = {
      Id: produitService.id || 0,  // Si id est undefined, envoyer 0 ou null
      Nom: produitService.nom,
      PrixUnitaire: produitService.prixUnitaire,
      Tva: produitService.tva,
      EntrepriseId: produitService.entrepriseId,
      UtilisateurId: produitService.utilisateurId || null
    };
    
    console.log('Headers de la requête:', headers);
    console.log('URL de l\'API:', `${this.apiUrl}/create`);
    console.log('Payload JSON:', JSON.stringify(formattedData));
    
    return this.http.post<ProduitServiceModel>(`${this.apiUrl}/create`, formattedData, { headers })
      .pipe(
        tap(
          response => console.log('Réponse du serveur:', response),
          error => console.error('Erreur détaillée:', error)
        )
      );
  }

  // Obtenir un produit/service par ID
  getProduitServiceById(id: number): Observable<ProduitServiceModel> {
    return this.http.get<ProduitServiceModel>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Obtenir tous les produits/services
  getAllProduitServices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`, { headers: this.getHeaders() });
  }

  // Obtenir tous les produits/services d'une entreprise
  getProduitServicesByEntreprise(entrepriseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/entreprise/${entrepriseId}`, { headers: this.getHeaders() });
  }

  // Modifier un produit/service
  updateProduitService(id: number, produitService: ProduitServiceModel): Observable<ProduitServiceModel> {
    // Adapter le format du modèle au format attendu par l'API (PascalCase)
    const formattedData = {
      Id: id,
      Nom: produitService.nom,
      PrixUnitaire: produitService.prixUnitaire,
      Tva: produitService.tva,
      EntrepriseId: produitService.entrepriseId,
      UtilisateurId: produitService.utilisateurId || null
    };
    
    return this.http.put<ProduitServiceModel>(`${this.apiUrl}/update/${id}`, formattedData, { headers: this.getHeaders() });
  }

  // Supprimer un produit/service
  deleteProduitService(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`, { headers: this.getHeaders() });
  }
} 