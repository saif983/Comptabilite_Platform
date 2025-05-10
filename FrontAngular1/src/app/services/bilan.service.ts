import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { UserService } from 'app/core/user/user.service';

interface EntrepriseModel {
  id?: number;
  nom: string;
  adresse?: string;
  mf?: string;
  tel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BilanService {
  private apiUrl = `${environment.apiUrl}/Bilan`;
  private apiEntreprisesUrl = `${environment.apiUrl}/entreprises`;

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) { }

  getEnterprises(): Observable<EntrepriseModel[]> {
    // Utiliser l'endpoint qui récupère toutes les entreprises de l'utilisateur connecté
    return this.http.get<any>(`${this.apiEntreprisesUrl}/all`).pipe(
      map(response => {
        // Gestion des différents formats de réponse possibles
        let enterprises: any[] = [];
        
        if (Array.isArray(response)) {
          console.log('Format de réponse: tableau simple');
          enterprises = response;
        } else if (response && '$values' in response && Array.isArray(response.$values)) {
          console.log('Format de réponse: objet avec $values');
          enterprises = response.$values;
        } else if (response && typeof response === 'object') {
          console.log('Format de réponse: objet sans $values, tentative de conversion');
          // Essayer de convertir l'objet en tableau si possible
          const entries = Object.entries(response)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([_, value]) => value);
          
          if (entries.length > 0) {
            enterprises = entries;
          }
        }
        
        // Vérification et normalisation des données
        if (enterprises.length > 0) {
          // Vérifier et normaliser chaque entreprise pour s'assurer qu'elle a une propriété 'nom'
          return enterprises.map(enterprise => {
            // Si l'entreprise a 'name' mais pas 'nom', utiliser 'name' comme 'nom'
            if (!enterprise.nom && enterprise.name) {
              console.log(`Entreprise ${enterprise.id} a 'name' mais pas 'nom', normalisation effectuée`);
              return { ...enterprise, nom: enterprise.name };
            }
            // Si l'entreprise n'a ni 'nom' ni 'name', ajouter un nom générique
            if (!enterprise.nom) {
              console.log(`Entreprise ${enterprise.id} n'a pas de nom, ajout d'un nom par défaut`);
              return { ...enterprise, nom: `Entreprise #${enterprise.id || 'Inconnue'}` };
            }
            // Sinon, retourner l'entreprise telle quelle
            return enterprise;
          });
        }
        
        // Si aucun format reconnu
        console.warn('Format de réponse non reconnu:', response);
        return [];
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des entreprises:', error);
        return of([]);
      })
    );
  }

  generateBilan(entrepriseId: number, capital?: number): Observable<any> {
    console.log(`Génération du bilan pour l'entreprise ID: ${entrepriseId}, Capital: ${capital || 'Non spécifié'}`);
    
    // Utilisez le paramètre entrepriseId dans le chemin de l'URL selon le contrôleur
    const url = `${this.apiUrl}/${entrepriseId}`;
    
    // Créez les paramètres HTTP explicitement
    let params = new HttpParams();
    if (capital !== undefined && capital !== null) {
      params = params.set('capital', capital.toString());
    }
    
    console.log(`URL d'appel API: ${url}`);
    
    // Utilisez GET comme spécifié dans le contrôleur [HttpGet("{entrepriseId}")]
    return this.http.get<any>(url, { params }).pipe(
      catchError(error => {
        console.error('Erreur détaillée lors de la génération du bilan:', error);
        return of({
          error: true,
          message: error.message || 'Erreur lors de la génération du bilan',
          details: error.error || {}
        });
      })
    );
  }
} 