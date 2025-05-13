// historique.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getHistoriques(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/Historiques`).pipe(
      map(response => {
        // Vérifier si la réponse a un format particulier avec $values
        if (response && response.$values) {
          console.log('Données brutes d\'historique:', response);
          
          // Transformer le format spécial en tableau simple
          return response.$values.map(item => {
            const historique = {
              id: item.id,
              entrepriseId: item.entrepriseId,
              userId: item.utilisateurId,
              nomUtilisateur: item.utilisateur ? item.utilisateur.nom : 'Inconnu',
              dateAction: new Date(item.dateAction),
              description: item.description,
              typeAction: item.typeAction,
              module: item.module
            };
            
            console.log('Historique transformé:', historique);
            return historique;
          });
        } else if (Array.isArray(response)) {
          // Si la réponse est déjà un tableau (au cas où)
          return response.map(item => ({
            id: item.id,
            entrepriseId: item.entrepriseId,
            userId: item.utilisateurId,
            nomUtilisateur: item.utilisateur ? item.utilisateur.nom : 'Inconnu',
            dateAction: new Date(item.dateAction),
            description: item.description,
            typeAction: item.typeAction,
            module: item.module
          }));
        }
        
        // En cas de format inattendu, retourner un tableau vide
        console.error('Format de réponse inattendu:', response);
        return [];
      })
    );
  }

  getStatistiques(entrepriseId: number): Observable<any> {
    // Comme l'endpoint stats n'existe pas, nous allons calculer les statistiques côté client
    return this.getHistoriques().pipe(
      map(historiques => {
        console.log('Calcul des statistiques pour les historiques:', historiques);
        
        // Filtrer les historiques pour l'entreprise spécifiée
        const filteredHistoriques = historiques.filter(h => h.entrepriseId === entrepriseId);
        
        // Date il y a 30 jours
        const date30JoursAvant = new Date();
        date30JoursAvant.setDate(date30JoursAvant.getDate() - 30);
        
        // Calculer les statistiques
        const totalActions = filteredHistoriques.length;
        
        // Actions des 30 derniers jours
        const actionsRecentes = filteredHistoriques.filter(h => 
          new Date(h.dateAction) >= date30JoursAvant
        ).length;
        
        // Regrouper par module
        const moduleMap = new Map<string, number>();
        filteredHistoriques.forEach(h => {
          const module = h.module || 'Inconnu';
          moduleMap.set(module, (moduleMap.get(module) || 0) + 1);
        });
        
        // Regrouper par type d'action
        const typeMap = new Map<string, number>();
        filteredHistoriques.forEach(h => {
          const type = h.typeAction || 'Inconnu';
          typeMap.set(type, (typeMap.get(type) || 0) + 1);
        });
        
        // Convertir les Maps en tableaux
        const actionsParModule = Array.from(moduleMap.entries()).map(([module, count]) => ({ module, count }));
        const actionsParType = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));
        
        const stats = {
          totalActions,
          actionsRecentes,
          actionsParModule,
          actionsParType
        };
        
        console.log('Statistiques calculées:', stats);
        return stats;
      })
    );
  }
}