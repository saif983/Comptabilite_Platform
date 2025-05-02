import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { EntrepriseService, EntrepriseModel } from '../core/services/entreprise.service';
import { fuseAnimations } from '@fuse/animations';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-entreprise-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    ConfirmDialogComponent
  ],
  template: `
    <div class="flex flex-col w-full p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold mb-1">Gestion des entreprises</h1>
          <p class="text-gray-600">Gérez toutes vos entreprises en un seul endroit</p>
        </div>
        <button 
          mat-raised-button 
          color="primary" 
          routerLink="/entreprises/new">
          <mat-icon>add</mat-icon>
          Nouvelle entreprise
        </button>
      </div>

      <!-- Message de bienvenue et introduction -->
      <div *ngIf="!isLoading && entreprises.length === 0" class="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex items-start">
          <mat-icon class="text-blue-500 mr-4">info</mat-icon>
          <div>
            <h2 class="text-xl font-semibold text-blue-800 mb-2">Bienvenue chez Comptinov!</h2>
            <p class="mb-3">Commencez par créer votre première entreprise pour gérer votre comptabilité et vos finances de manière efficace.</p>
            <p class="text-sm text-blue-700">Vous pourrez y ajouter vos factures, gérer vos produits et services, suivre vos paiements et générer des rapports financiers.</p>
          </div>
        </div>
      </div>
      
      <div *ngIf="isLoading" class="flex justify-center my-8">
        <mat-spinner [diameter]="50"></mat-spinner>
      </div>
      
      <div *ngIf="!isLoading && entreprises.length === 0" class="flex flex-col items-center justify-center my-12 p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <mat-icon class="text-6xl mb-4 text-gray-400">business</mat-icon>
        <h2 class="text-2xl font-medium text-gray-700 mb-2">Aucune entreprise trouvée</h2>
        <p class="text-gray-500 text-center mb-6 max-w-lg">Commencez par créer votre première entreprise pour pouvoir gérer votre comptabilité.</p>
        <button 
          mat-raised-button 
          color="primary" 
          class="mt-4" 
          routerLink="/entreprises/new">
          <mat-icon>add</mat-icon>
          Créer votre première entreprise
        </button>
      </div>
      
      <div *ngIf="!isLoading && entreprises.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <mat-card *ngFor="let entreprise of entreprises" class="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div class="flex justify-between items-center p-4 bg-blue-50 border-b">
            <div class="flex items-center">
              <div *ngIf="entreprise.hasLogo" class="w-12 h-12 overflow-hidden rounded-full mr-4">
                <img 
                  [src]="entrepriseService.getDocumentUrl(entreprise.id, 'logo')" 
                  alt="Logo {{ entreprise.nom }}" 
                  class="w-full h-full object-cover"
                  onerror="this.src='assets/images/logo/logo.svg'">
              </div>
              <div *ngIf="!entreprise.hasLogo" class="w-12 h-12 overflow-hidden rounded-full mr-4 bg-blue-100 flex items-center justify-center">
                <mat-icon class="text-blue-500">business</mat-icon>
              </div>
              <div>
                <h2 class="text-xl font-bold">{{ entreprise.nom }}</h2>
                <p *ngIf="entreprise.mf" class="text-sm text-gray-500">MF: {{ entreprise.mf }}</p>
              </div>
            </div>
            <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Options">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item [routerLink]="['/entreprises', entreprise.id]">
                <mat-icon>visibility</mat-icon>
                <span>Voir les détails</span>
              </button>
              <button mat-menu-item [routerLink]="['/entreprises', entreprise.id, 'edit']">
                <mat-icon>edit</mat-icon>
                <span>Modifier</span>
              </button>
              <button mat-menu-item (click)="setDefaultEntreprise(entreprise.id)" *ngIf="entreprise.id !== getDefaultEntrepriseId()">
                <mat-icon>star</mat-icon>
                <span>Définir par défaut</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="confirmDelete(entreprise)" class="text-red-500">
                <mat-icon class="text-red-500">delete</mat-icon>
                <span>Supprimer</span>
              </button>
            </mat-menu>
          </div>
          
          <mat-card-content class="p-4 flex-grow">
            <p class="mb-2"><strong>Adresse:</strong> {{ entreprise.adresse }}</p>
            <p *ngIf="entreprise.tel" class="mb-4"><strong>Tél:</strong> {{ entreprise.tel }}</p>
            
            <div class="flex flex-wrap gap-2 mt-4">
              <div *ngIf="entreprise.hasLogo" 
                   class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                Logo
              </div>
              <div *ngIf="entreprise.hasRCS" 
                   class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                RCS
              </div>
              <div *ngIf="entreprise.hasIdentitegerant" 
                   class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Identité Gérant
              </div>
              <div *ngIf="entreprise.hasJustificatifedomicile" 
                   class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Justificatif Domicile
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions class="p-4 pt-0 flex justify-between border-t bg-gray-50">
            <button 
              mat-stroked-button 
              color="primary" 
              [routerLink]="['/entreprises', entreprise.id, 'dashboard']"
              class="flex-grow mr-1">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </button>
            <button 
              mat-stroked-button 
              color="accent" 
              [routerLink]="['/entreprises', entreprise.id, 'edit']"
              class="flex-grow ml-1">
              <mat-icon>edit</mat-icon>
              Modifier
            </button>
          </mat-card-actions>
          
          <div class="absolute top-0 right-0 m-2" *ngIf="entreprise.id === getDefaultEntrepriseId()">
            <div class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <mat-icon class="text-xs mr-1">star</mat-icon>
              Par défaut
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  animations: fuseAnimations
})
export class EntrepriseListComponent implements OnInit, OnDestroy {
  entreprises: EntrepriseModel[] = [];
  isLoading = true;
  defaultEntrepriseId: number | null = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public entrepriseService: EntrepriseService,
    private authService: AuthService,
    private userService: UserService
  ) {}
  
  ngOnInit() {
    // Charger d'abord le profil utilisateur pour obtenir l'entreprise par défaut
    this.userService.getUserProfile().subscribe(
      (user) => {
        if (user && user.defaultEntrepriseId) {
          this.defaultEntrepriseId = user.defaultEntrepriseId;
          
          // Rediriger immédiatement vers l'entreprise par défaut
          this.router.navigate(['/entreprises', this.defaultEntrepriseId]);
        } else {
          // Seulement charger la liste des entreprises si pas d'entreprise par défaut
          this.loadEntreprises();
        }
      },
      (error) => {
        console.error('Erreur lors du chargement du profil utilisateur:', error);
        // Charger quand même les entreprises en cas d'erreur
        this.loadEntreprises();
      }
    );
  }
  
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
  
  loadEntreprises() {
    this.isLoading = true;
    this.entrepriseService.getAllEntreprises().subscribe(
      (response: any) => {
        // Vérifier si la réponse contient un $values (format du backend)
        if (response && response.$values) {
          this.entreprises = response.$values;
        } else {
          // Si le format est déjà un tableau simple
          this.entreprises = Array.isArray(response) ? response : [];
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des entreprises', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur:', error);
      }
    );
  }
  
  getDefaultEntrepriseId(): number | null {
    return this.defaultEntrepriseId;
  }
  
  setDefaultEntreprise(entrepriseId: number) {
    // Appeler l'API pour définir l'entreprise par défaut
    this.userService.setDefaultEntreprise(entrepriseId).subscribe(
      () => {
        this.defaultEntrepriseId = entrepriseId;
        this.snackBar.open('Entreprise définie par défaut', 'OK', {
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
  
  confirmDelete(entreprise: EntrepriseModel) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'entreprise "${entreprise.nom}"?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });
    
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteEntreprise(entreprise.id);
      }
    });
  }
  
  deleteEntreprise(id: number) {
    this.entrepriseService.deleteEntreprise(id).subscribe(
      () => {
        this.snackBar.open('Entreprise supprimée avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadEntreprises();
      },
      (error) => {
        this.snackBar.open('Erreur lors de la suppression de l\'entreprise', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur:', error);
      }
    );
  }
} 