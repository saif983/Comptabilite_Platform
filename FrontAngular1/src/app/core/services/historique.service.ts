import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface HistoriqueModel {
  id: number;
  utilisateurId: number;
  nomUtilisateur: string;
  entrepriseId: number;
  nomEntreprise: string;
  dateAction: Date;
  description: string;
  typeAction: string;
  module: string;
  entiteId?: number;
}

export interface CreateHistoriqueModel {
  utilisateurId?: number;
  entrepriseId: number;
  description: string;
  typeAction: string;
  module: string;
  entiteId?: number;
  donneesAdditionnelles?: string;
}

export interface HistoriqueResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  items: HistoriqueModel[];
}

export interface HistoriqueStats {
  totalActions: number;
  actionsRecentes: number;
  actionsParModule: { module: string; total: number }[];
  actionsParType: { type: string; total: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {
  private apiUrl = `${environment.apiUrl}/historique`;

  constructor(private http: HttpClient) {}

  // Obtenir l'historique d'une entreprise avec pagination
  getHistoriqueEntreprise(entrepriseId: number, page: number = 1, pageSize: number = 10): Observable<HistoriqueResponse> {
    return this.http.get<HistoriqueResponse>(`${this.apiUrl}/entreprise/${entrepriseId}?page=${page}&pageSize=${pageSize}`);
  }

  // Enregistrer une nouvelle action
  enregistrerAction(action: CreateHistoriqueModel): Observable<{ message: string; historiqueId: number }> {
    return this.http.post<{ message: string; historiqueId: number }>(`${this.apiUrl}/enregistrer`, action);
  }

  // Obtenir des statistiques sur les actions
  getStatistiques(entrepriseId: number): Observable<HistoriqueStats> {
    return this.http.get<HistoriqueStats>(`${this.apiUrl}/statistiques/entreprise/${entrepriseId}`);
  }
} 