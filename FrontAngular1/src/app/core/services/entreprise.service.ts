import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EntrepriseModel {
  id?: number;
  nom: string;
  adresse: string;
  mf?: string;
  tel?: string;
  hasLogo?: boolean;
  hasRCS?: boolean;
  hasIdentitegerant?: boolean;
  hasJustificatifedomicile?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {
  private apiUrl = `${environment.apiUrl}/entreprises`;

  constructor(private http: HttpClient) { }

  // Récupérer toutes les entreprises
  getAllEntreprises(): Observable<EntrepriseModel[]> {
    return this.http.get<EntrepriseModel[]>(`${this.apiUrl}/all`);
  }

  // Récupérer une entreprise par id
  getEntrepriseById(id: number): Observable<EntrepriseModel> {
    return this.http.get<EntrepriseModel>(`${this.apiUrl}/${id}`);
  }

  // Créer une entreprise avec téléchargement de fichiers
  createEntreprise(entrepriseData: FormData): Observable<EntrepriseModel> {
    return this.http.post<EntrepriseModel>(`${this.apiUrl}/create`, entrepriseData);
  }

  // Mettre à jour une entreprise
  updateEntreprise(id: number, entrepriseData: FormData): Observable<EntrepriseModel> {
    return this.http.put<EntrepriseModel>(`${this.apiUrl}/update/${id}`, entrepriseData);
  }

  // Supprimer une entreprise
  deleteEntreprise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Télécharger un document spécifique
  uploadDocument(entrepriseId: number, documentType: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<any>(
      `${this.apiUrl}/${entrepriseId}/documents/${documentType}`, 
      formData
    );
  }

  // Obtenir l'URL d'un document (à utiliser dans les balises img par exemple)
  getDocumentUrl(entrepriseId: number, documentType: string): string {
    return `${this.apiUrl}/${entrepriseId}/document/${documentType}`;
  }

  // Mettre à jour un document spécifique
  updateDocument(entrepriseId: number, documentType: string, formData: FormData): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${entrepriseId}/document/${documentType}`,
      formData
    );
  }

  // Supprimer un document spécifique
  deleteDocument(entrepriseId: number, documentType: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${entrepriseId}/documents/${documentType}`
    );
  }
} 