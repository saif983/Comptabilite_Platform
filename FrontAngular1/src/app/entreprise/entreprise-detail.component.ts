import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EntrepriseService, EntrepriseModel } from '../core/services/entreprise.service';
import { fuseAnimations } from '@fuse/animations';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { factureRoutes } from '../facture/facture.routes';

@Component({
  selector: 'app-entreprise-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="flex flex-col w-full p-6">
      <!-- Barre de navigation avec boutons retour et actions -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          <button mat-icon-button (click)="goBack()" matTooltip="Retour à la liste">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="text-3xl font-bold ml-2">Détails de l'entreprise</h1>
        </div>
        <div class="flex gap-2">
          <button 
            mat-stroked-button 
            color="primary" 
            [routerLink]="['/entreprises', entrepriseId, 'edit']">
            <mat-icon>edit</mat-icon>
            Modifier
          </button>
          <button 
            mat-raised-button 
            color="primary" 
            [routerLink]="['/entreprises', entrepriseId, 'dashboard']">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>
        </div>
      </div>

      <!-- Loader -->
      <div *ngIf="isLoading" class="flex justify-center my-8">
        <mat-spinner [diameter]="50"></mat-spinner>
      </div>

      <!-- Contenu principal -->
      <div *ngIf="!isLoading && entreprise" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Carte d'informations générales -->
        <mat-card class="md:col-span-2">
          <mat-card-header class="bg-blue-50 p-4">
            <div class="flex items-center w-full">
              <div *ngIf="entreprise.hasLogo" class="w-24 h-24 overflow-hidden rounded-full mr-4 border-2 border-blue-200 bg-white flex items-center justify-center">
                <img 
                  [src]="getLogo()" 
                  alt="Logo {{ entreprise.nom }}" 
                  class="w-full h-full p-1 object-contain"
                  onerror="this.src='assets/images/logo/logo.svg'">
              </div>
              <div *ngIf="!entreprise.hasLogo" class="w-24 h-24 overflow-hidden rounded-full mr-4 bg-blue-100 flex items-center justify-center">
                <mat-icon class="text-blue-500 text-4xl">business</mat-icon>
              </div>
              <div class="flex-grow">
                <h2 class="text-2xl font-bold">{{ entreprise.nom }}</h2>
                <p *ngIf="entreprise.mf" class="text-gray-600">Matricule Fiscal: {{ entreprise.mf }}</p>
              </div>
              <div *ngIf="isDefaultEntreprise" class="bg-blue-500 text-white text-xs px-3 py-1 rounded-full flex items-center h-fit">
                <mat-icon class="text-xs mr-1">star</mat-icon>
                Par défaut
                <button mat-icon-button color="warn" (click)="removeDefaultEntreprise()" matTooltip="Retirer comme entreprise par défaut" class="ml-2">
                  <mat-icon>remove_circle</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-medium mb-3">Informations générales</h3>
                <p class="mb-2"><strong>Adresse:</strong> {{ entreprise.adresse }}</p>
                <p *ngIf="entreprise.tel" class="mb-2"><strong>Téléphone:</strong> {{ entreprise.tel }}</p>
              </div>
              
              <div>
                <h3 class="text-lg font-medium mb-3">Documents disponibles</h3>
                <div class="flex flex-wrap gap-2">
                  <div *ngIf="entreprise.hasLogo" 
                      class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium flex items-center">
                    <img [src]="getLogo()" class="w-5 h-5 mr-1 object-contain" alt="Logo" />
                    Logo
                  </div>
                  <div *ngIf="entreprise.hasRCS" 
                      class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                    <mat-icon class="text-sm mr-1">description</mat-icon>
                    RCS
                  </div>
                  <div *ngIf="entreprise.hasIdentitegerant" 
                      class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center">
                    <mat-icon class="text-sm mr-1">person</mat-icon>
                    Identité Gérant
                  </div>
                  <div *ngIf="entreprise.hasJustificatifedomicile" 
                      class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center">
                    <mat-icon class="text-sm mr-1">home</mat-icon>
                    Justificatif Domicile
                  </div>
                </div>
              </div>
            </div>
            
            <mat-divider class="my-6"></mat-divider>
            
            <mat-tab-group>
              <mat-tab label="Documents">
                <div class="p-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- RCS -->
                    <div *ngIf="entreprise.hasRCS" class="border rounded-lg p-4">
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-medium">Registre de Commerce (RCS)</h4>
                        <a 
                          [href]="entrepriseService.getDocumentUrl(entreprise.id, 'rcs')" 
                          target="_blank" 
                          mat-icon-button 
                          color="primary"
                          matTooltip="Voir le document"
                          (click)="openDocument('rcs')">
                          <mat-icon>visibility</mat-icon>
                        </a>
                      </div>
                      <p class="text-sm text-gray-500">Document officiel attestant l'existence légale de l'entreprise</p>
                    </div>
                    
                    <!-- Identité gérant -->
                    <div *ngIf="entreprise.hasIdentitegerant" class="border rounded-lg p-4">
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-medium">Pièce d'identité du gérant</h4>
                        <a 
                          [href]="entrepriseService.getDocumentUrl(entreprise.id, 'identitegerant')" 
                          target="_blank" 
                          mat-icon-button 
                          color="primary"
                          matTooltip="Voir le document"
                          (click)="openDocument('identitegerant')">
                          <mat-icon>visibility</mat-icon>
                        </a>
                      </div>
                      <p class="text-sm text-gray-500">Document d'identité du responsable légal de l'entreprise</p>
                    </div>
                    
                    <!-- Justificatif de domicile -->
                    <div *ngIf="entreprise.hasJustificatifedomicile" class="border rounded-lg p-4">
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-medium">Justificatif de domicile</h4>
                        <a 
                          [href]="entrepriseService.getDocumentUrl(entreprise.id, 'justificatifedomicile')" 
                          target="_blank" 
                          mat-icon-button 
                          color="primary"
                          matTooltip="Voir le document"
                          (click)="openDocument('justificatifedomicile')">
                          <mat-icon>visibility</mat-icon>
                        </a>
                      </div>
                      <p class="text-sm text-gray-500">Document prouvant l'adresse de l'entreprise</p>
                    </div>
                  </div>
                </div>
              </mat-tab>
              
              <mat-tab label="Statistiques">
                <div class="p-4 text-center">
                  <mat-icon class="text-6xl text-gray-400 mb-2">insert_chart</mat-icon>
                  <h3 class="text-xl font-medium mb-2">Statistiques de l'entreprise</h3>
                  <p class="text-gray-500">Les statistiques et rapports détaillés seront disponibles prochainement.</p>
                </div>
              </mat-tab>
              
              <mat-tab label="Historique">
                <div class="p-4 text-center">
                  <mat-icon class="text-6xl text-gray-400 mb-2">history</mat-icon>
                  <h3 class="text-xl font-medium mb-2">Historique des opérations</h3>
                  <p class="text-gray-500">L'historique des modifications et opérations sera disponible prochainement.</p>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
          
          <mat-card-actions class="p-4 flex justify-between border-t bg-gray-50">
            <div>
              <button 
                mat-button 
                color="warn" 
                (click)="confirmDelete()"
                matTooltip="Supprimer cette entreprise">
                <mat-icon>delete</mat-icon>
                Supprimer
              </button>
            </div>
            <button 
              mat-button 
              color="primary" 
              (click)="setAsDefault()" 
              *ngIf="!isDefaultEntreprise"
              matTooltip="Définir comme entreprise par défaut">
              <mat-icon>star</mat-icon>
              Définir par défaut
            </button>
          </mat-card-actions>
        </mat-card>
        
        <!-- Carte de navigation rapide -->
        <mat-card>
          <mat-card-header class="bg-blue-50 p-4">
            <h2 class="text-xl font-bold">Navigation rapide</h2>
          </mat-card-header>
          
          <mat-card-content class="p-4">
            <div class="flex flex-col gap-3">
              <button 
                mat-raised-button 
                color="primary" 
                class="justify-start" 
                [routerLink]="['/entreprises', entrepriseId, 'dashboard']">
                <mat-icon class="mr-2">dashboard</mat-icon>
                Dashboard
              </button>
              
              <button 
                mat-stroked-button 
                class="justify-start" 
                (click)="redirectToFactures()">
                <mat-icon class="mr-2">receipt</mat-icon>
                Factures
              </button>
              
              <button 
                mat-stroked-button 
                class="justify-start" 
                [routerLink]="['/entreprises', entrepriseId, 'clients']">
                <mat-icon class="mr-2">people</mat-icon>
                Clients
              </button>
              
              <button 
                mat-stroked-button 
                class="justify-start" 
                (click)="redirectToProduitService()">
                <mat-icon class="mr-2">inventory_2</mat-icon>
                Produits & Services
              </button>
              
              <mat-divider class="my-3"></mat-divider>
              
              <button 
                mat-stroked-button 
                color="accent" 
                class="justify-start" 
                [routerLink]="['/entreprises', entrepriseId, 'edit']">
                <mat-icon class="mr-2">edit</mat-icon>
                Modifier l'entreprise
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <!-- Message d'erreur -->
      <div *ngIf="!isLoading && !entreprise" class="flex flex-col items-center my-12 p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <mat-icon class="text-6xl mb-4 text-gray-400">error</mat-icon>
        <h2 class="text-2xl font-medium text-gray-700 mb-2">Entreprise non trouvée</h2>
        <p class="text-gray-500 text-center mb-6 max-w-lg">L'entreprise demandée n'existe pas ou a été supprimée.</p>
        <button 
          mat-raised-button 
          color="primary" 
          class="mt-4" 
          routerLink="/entreprises">
          <mat-icon>list</mat-icon>
          Retour à la liste des entreprises
        </button>
      </div>
    </div>
  `,
  animations: fuseAnimations
})
export class EntrepriseDetailComponent implements OnInit, OnDestroy {
  entrepriseId: number;
  entreprise: EntrepriseModel;
  isLoading = true;
  isDefaultEntreprise = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public entrepriseService: EntrepriseService,
    private userService: UserService
  ) {}
  
  ngOnInit() {
    // Récupérer l'ID de l'entreprise depuis l'URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.entrepriseId = +params['id'];
        this.loadEntreprise();
        this.checkIfDefault();
      }
    });
  }
  
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
  
  loadEntreprise() {
    this.isLoading = true;
    this.entrepriseService.getEntrepriseById(this.entrepriseId).subscribe(
      (entreprise) => {
        this.entreprise = entreprise;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des détails de l\'entreprise', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur:', error);
      }
    );
  }
  
  checkIfDefault() {
    // Vérifier si l'entreprise est définie comme entreprise par défaut
    this.userService.getUserProfile().subscribe(
      (user) => {
        if (user && user.defaultEntrepriseId === this.entrepriseId) {
          this.isDefaultEntreprise = true;
        } else {
          this.isDefaultEntreprise = false;
        }
      },
      (error) => {
        console.error('Erreur lors de la vérification de l\'entreprise par défaut:', error);
        this.isDefaultEntreprise = false;
      }
    );
  }
  
  setAsDefault() {
    // Appeler l'API pour définir cette entreprise comme entreprise par défaut
    this.userService.setDefaultEntreprise(this.entrepriseId).subscribe(
      () => {
        this.isDefaultEntreprise = true;
        this.snackBar.open('Entreprise définie comme entreprise par défaut', 'OK', {
          duration: 3000
        });
      },
      (error) => {
        this.snackBar.open('Erreur lors de la définition de l\'entreprise par défaut', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur:', error);
      }
    );
  }
  
  confirmDelete() {
    // Idéalement, on utiliserait un dialogue de confirmation ici
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise "${this.entreprise.nom}"?`)) {
      this.deleteEntreprise();
    }
  }
  
  deleteEntreprise() {
    this.isLoading = true;
    this.entrepriseService.deleteEntreprise(this.entrepriseId).subscribe(
      () => {
        this.isLoading = false;
        this.snackBar.open('Entreprise supprimée avec succès', 'Fermer', {
          duration: 3000
        });
        this.router.navigate(['/entreprises']);
      },
      (error) => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors de la suppression de l\'entreprise', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur:', error);
      }
    );
  }
  
  goBack() {
    this.router.navigate(['/entreprises']);
  }
  
  openDocument(documentType: string): void {
    if (!this.entreprise || !this.entreprise.id) return;
    
    const url = this.entrepriseService.getDocumentUrl(this.entreprise.id, documentType);
    window.open(url, '_blank');
  }
  
  getLogo(): string {
    if (this.entreprise && this.entreprise.id && this.entreprise.hasLogo) {
      return this.entrepriseService.getDocumentUrl(this.entreprise.id, 'logo');
    }
    return 'assets/images/logo/logo.svg';
  }
  
  removeDefaultEntreprise() {
    this.userService.deleteDefaultEntreprise().subscribe(
      () => {
        this.isDefaultEntreprise = false;
        this.snackBar.open('Entreprise par défaut retirée avec succès.', 'Fermer', { duration: 3000 });
      },
      (error) => {
        this.snackBar.open('Erreur lors du retrait de l\'entreprise par défaut.', 'Fermer', { duration: 3000 });
        console.error('Erreur:', error);
      }
    );
  }
  
  redirectToFactures() {
    this.router.navigateByUrl('/pages/facture');
  }
  
  redirectToProduitService() {
    this.router.navigateByUrl('/pages/produit-service');
  }
} 