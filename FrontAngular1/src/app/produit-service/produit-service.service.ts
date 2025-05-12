import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserService } from 'app/core/user/user.service';

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

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) { }

  // Créer des en-têtes avec le token d'authentification
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('accessToken');
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

  // Obtenir tous les produits/services d'une entreprise
  getProduitServicesByEntreprise(entrepriseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/entreprise/${entrepriseId}`, { headers: this.getHeaders() });
  }

  // Obtenir les produits/services de l'entreprise par défaut de l'utilisateur ou d'une entreprise spécifiée
  getProduitServices(selectedEntrepriseId?: number): Observable<any> {
    // Si un ID d'entreprise est spécifié, utiliser celui-là
    if (selectedEntrepriseId) {
      return this.getProduitServicesByEntreprise(selectedEntrepriseId);
    }
    
    // Sinon, récupérer les produits de l'entreprise par défaut de l'utilisateur
    return this.userService.user$.pipe(
      switchMap(user => {
        if (user && user.defaultEntrepriseId) {
          console.log('Récupération des produits pour l\'entreprise par défaut:', user.defaultEntrepriseId);
          return this.getProduitServicesByEntreprise(user.defaultEntrepriseId);
        } else {
          console.warn('Aucune entreprise par défaut définie pour l\'utilisateur');
          return of([]);
        }
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des produits:', error);
        return of([]);
      })
    );
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