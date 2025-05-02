import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { EntrepriseService, EntrepriseModel } from '../core/services/entreprise.service';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-entreprise-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatStepperModule
  ],
  template: `
    <div class="flex flex-col w-full max-w-5xl mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">{{ editMode ? 'Modifier' : 'Créer' }} une entreprise</h1>
      
      <!-- Stepper -->
      <mat-stepper linear #stepper>
        <!-- Étape 1: Informations -->
        <mat-step [stepControl]="informationsForm" label="Informations">
          <form [formGroup]="informationsForm" class="flex flex-col gap-4 my-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nom de l'entreprise</mat-label>
              <input matInput formControlName="nom" required>
              <mat-error *ngIf="informationsForm.get('nom')?.hasError('required')">
                Le nom est requis
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Adresse</mat-label>
              <input matInput formControlName="adresse" required>
              <mat-error *ngIf="informationsForm.get('adresse')?.hasError('required')">
                L'adresse est requise
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Matricule fiscal</mat-label>
              <input matInput formControlName="mf">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="tel">
            </mat-form-field>
            
            <div class="flex justify-end mt-4">
              <button mat-raised-button color="primary" matStepperNext [disabled]="informationsForm.invalid">
                Continuer
              </button>
            </div>
          </form>
        </mat-step>
        
        <!-- Étape 2: Documents -->
        <mat-step [stepControl]="documentsForm" label="Documents">
          <form [formGroup]="documentsForm" class="flex flex-col my-4">
            <!-- Logo upload -->
            <div class="flex flex-col mb-6">
              <label class="mb-2 text-lg font-medium">Logo de l'entreprise</label>
              <div class="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                <div 
                  *ngIf="logoPreview || (editMode && entreprise?.hasLogo)" 
                  class="w-32 h-32 border rounded overflow-hidden flex items-center justify-center mb-4">
                  <img 
                    [src]="logoPreview || (editMode && entreprise?.id ? entrepriseService.getDocumentUrl(entreprise.id, 'logo') : '')" 
                    alt="Logo preview" 
                    class="max-w-full max-h-full object-contain" 
                    *ngIf="logoPreview || (editMode && entreprise?.hasLogo)">
                </div>
                
                <div class="flex flex-col items-center">
                  <mat-icon class="text-4xl text-gray-400 mb-2">cloud_upload</mat-icon>
                  <p class="text-center text-gray-500 mb-2">Glissez-déposez votre fichier ici</p>
                  <p class="text-center text-gray-400 text-sm mb-4">ou cliquez pour parcourir vos fichiers (JPG, PNG - Max 10MB)</p>
                  <button 
                    type="button" 
                    mat-raised-button 
                    color="primary" 
                    (click)="logoFileInput.click()">
                    Choisir un logo
                  </button>
                </div>
                
                <input 
                  type="file" 
                  hidden 
                  #logoFileInput
                  accept="image/*"
                  (change)="onFileSelected($event, 'logo')">
                  
                <span *ngIf="selectedFiles.logo" class="mt-2 text-green-600">
                  <mat-icon class="align-middle mr-1">check_circle</mat-icon>
                  {{ selectedFiles.logo.name }}
                </span>
              </div>
            </div>
            
            <!-- RCS upload (obligatoire) -->
            <div class="flex flex-col mb-6">
              <label class="mb-2 text-lg font-medium">Registre de Commerce (RCS) <span class="text-red-500">*</span></label>
              <div class="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                <div class="flex flex-col items-center">
                  <mat-icon class="text-4xl text-gray-400 mb-2">description</mat-icon>
                  <p class="text-center text-gray-500 mb-2">Glissez-déposez votre fichier ici</p>
                  <p class="text-center text-gray-400 text-sm mb-4">ou cliquez pour parcourir vos fichiers (PDF, JPG, PNG - Max 10MB)</p>
                  <button 
                    type="button" 
                    mat-raised-button 
                    color="primary" 
                    (click)="rcsFileInput.click()">
                    Choisir un fichier
                  </button>
                </div>
                
                <input 
                  type="file" 
                  hidden 
                  #rcsFileInput
                  accept=".pdf,.jpg,.jpeg,.png"
                  (change)="onFileSelected($event, 'rcs')">
                  
                <span *ngIf="selectedFiles.rcs" class="mt-2 text-green-600">
                  <mat-icon class="align-middle mr-1">check_circle</mat-icon>
                  {{ selectedFiles.rcs.name }}
                </span>
                <a 
                  *ngIf="editMode && entreprise?.hasRCS && entreprise?.id" 
                  [href]="entrepriseService.getDocumentUrl(entreprise.id, 'rcs')" 
                  target="_blank" 
                  mat-button 
                  color="accent"
                  class="mt-2">
                  <mat-icon class="align-middle mr-1">visibility</mat-icon>
                  Voir le document actuel
                </a>
              </div>
              <div *ngIf="submitted && !selectedFiles.rcs && !editMode" class="text-red-500 text-sm mt-1">
                Le RCS est requis
              </div>
            </div>
            
            <!-- Identité du gérant (optionnel) -->
            <div class="flex flex-col mb-6">
              <label class="mb-2 text-lg font-medium">Pièce d'identité du gérant (optionnel)</label>
              <div class="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                <div class="flex flex-col items-center">
                  <mat-icon class="text-4xl text-gray-400 mb-2">person</mat-icon>
                  <p class="text-center text-gray-500 mb-2">Glissez-déposez votre fichier ici</p>
                  <p class="text-center text-gray-400 text-sm mb-4">ou cliquez pour parcourir vos fichiers (PDF, JPG, PNG - Max 10MB)</p>
                  <button 
                    type="button" 
                    mat-raised-button 
                    color="primary" 
                    (click)="identiteFileInput.click()">
                    Choisir un fichier
                  </button>
                </div>
                
                <input 
                  type="file" 
                  hidden 
                  #identiteFileInput
                  accept=".pdf,.jpg,.jpeg,.png"
                  (change)="onFileSelected($event, 'identitegerant')">
                  
                <span *ngIf="selectedFiles.identitegerant" class="mt-2 text-green-600">
                  <mat-icon class="align-middle mr-1">check_circle</mat-icon>
                  {{ selectedFiles.identitegerant.name }}
                </span>
                <a 
                  *ngIf="editMode && entreprise?.hasIdentitegerant && entreprise?.id" 
                  [href]="entrepriseService.getDocumentUrl(entreprise.id, 'identitegerant')" 
                  target="_blank" 
                  mat-button 
                  color="accent"
                  class="mt-2">
                  <mat-icon class="align-middle mr-1">visibility</mat-icon>
                  Voir le document actuel
                </a>
              </div>
            </div>
            
            <!-- Justificatif de domicile (optionnel) -->
            <div class="flex flex-col mb-6">
              <label class="mb-2 text-lg font-medium">Justificatif de domicile (optionnel)</label>
              <div class="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                <div class="flex flex-col items-center">
                  <mat-icon class="text-4xl text-gray-400 mb-2">home</mat-icon>
                  <p class="text-center text-gray-500 mb-2">Glissez-déposez votre fichier ici</p>
                  <p class="text-center text-gray-400 text-sm mb-4">ou cliquez pour parcourir vos fichiers (PDF, JPG, PNG - Max 10MB)</p>
                  <button 
                    type="button" 
                    mat-raised-button 
                    color="primary" 
                    (click)="domicileFileInput.click()">
                    Choisir un fichier
                  </button>
                </div>
                
                <input 
                  type="file" 
                  hidden 
                  #domicileFileInput
                  accept=".pdf,.jpg,.jpeg,.png"
                  (change)="onFileSelected($event, 'justificatifedomicile')">
                  
                <span *ngIf="selectedFiles.justificatifedomicile" class="mt-2 text-green-600">
                  <mat-icon class="align-middle mr-1">check_circle</mat-icon>
                  {{ selectedFiles.justificatifedomicile.name }}
                </span>
                <a 
                  *ngIf="editMode && entreprise?.hasJustificatifedomicile && entreprise?.id" 
                  [href]="entrepriseService.getDocumentUrl(entreprise.id, 'justificatifedomicile')" 
                  target="_blank" 
                  mat-button 
                  color="accent"
                  class="mt-2">
                  <mat-icon class="align-middle mr-1">visibility</mat-icon>
                  Voir le document actuel
                </a>
              </div>
            </div>
            
            <div class="flex justify-between mt-4">
              <button mat-button matStepperPrevious>Retour</button>
              <button mat-raised-button color="primary" matStepperNext 
                [disabled]="!editMode && !selectedFiles.rcs">
                Continuer
              </button>
            </div>
          </form>
        </mat-step>
        
        <!-- Étape 3: Finalisation -->
        <mat-step label="Finalisation">
          <div class="flex flex-col items-center my-4 p-6 border rounded-lg bg-gray-50">
            <mat-icon class="text-6xl text-green-500 mb-4">check_circle</mat-icon>
            <h2 class="text-2xl font-bold mb-2">Récapitulatif de votre entreprise</h2>
            <p class="text-gray-600 mb-6">Vérifiez les informations avant de finaliser</p>
            
            <div class="w-full max-w-md p-4 bg-white rounded shadow mb-6">
              <div class="mb-4">
                <p class="text-sm text-gray-500">Nom de l'entreprise</p>
                <p class="font-medium">{{ informationsForm.get('nom')?.value }}</p>
              </div>
              <div class="mb-4">
                <p class="text-sm text-gray-500">Adresse</p>
                <p class="font-medium">{{ informationsForm.get('adresse')?.value }}</p>
              </div>
              <div class="mb-4" *ngIf="informationsForm.get('mf')?.value">
                <p class="text-sm text-gray-500">Matricule fiscal</p>
                <p class="font-medium">{{ informationsForm.get('mf')?.value }}</p>
              </div>
              <div class="mb-4" *ngIf="informationsForm.get('tel')?.value">
                <p class="text-sm text-gray-500">Téléphone</p>
                <p class="font-medium">{{ informationsForm.get('tel')?.value }}</p>
              </div>
              
              <div class="mb-4">
                <p class="text-sm text-gray-500">Documents fournis</p>
                <ul class="list-disc pl-5">
                  <li *ngIf="selectedFiles.logo">Logo</li>
                  <li *ngIf="selectedFiles.rcs">Registre de Commerce (RCS)</li>
                  <li *ngIf="selectedFiles.identitegerant">Pièce d'identité du gérant</li>
                  <li *ngIf="selectedFiles.justificatifedomicile">Justificatif de domicile</li>
                </ul>
              </div>
            </div>
            
            <div class="flex justify-between w-full max-w-md">
              <button mat-button matStepperPrevious>Retour</button>
              <button 
                mat-raised-button 
                color="primary"
                (click)="onSubmit()"
                [disabled]="isSubmitting">
                <span *ngIf="!isSubmitting">
                  {{ editMode ? 'Mettre à jour' : 'Créer l\'entreprise' }}
                </span>
                <mat-spinner 
                  *ngIf="isSubmitting" 
                  [diameter]="24" 
                  color="accent">
                </mat-spinner>
              </button>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  animations: fuseAnimations
})
export class EntrepriseFormComponent implements OnInit {
  @ViewChild('logoFileInput') logoFileInput: ElementRef;
  @ViewChild('rcsFileInput') rcsFileInput: ElementRef;
  @ViewChild('identiteFileInput') identiteFileInput: ElementRef;
  @ViewChild('domicileFileInput') domicileFileInput: ElementRef;
  
  informationsForm: FormGroup;
  documentsForm: FormGroup;
  editMode = false;
  isSubmitting = false;
  submitted = false;
  entrepriseId: number;
  entreprise: EntrepriseModel;
  
  selectedFiles: {
    logo?: File;
    rcs?: File;
    identitegerant?: File;
    justificatifedomicile?: File;
  } = {};
  
  logoPreview: string;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public entrepriseService: EntrepriseService
  ) {}
  
  ngOnInit() {
    this.initForms();
    
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        this.entrepriseId = +params['id'];
        this.loadEntreprise(this.entrepriseId);
      }
    });
  }
  
  initForms() {
    this.informationsForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      mf: [''],
      tel: ['']
    });
    
    this.documentsForm = this.fb.group({
      // Ce formulaire est utilisé juste pour la structure du stepper
      // Les fichiers seront gérés via selectedFiles
    });
  }
  
  loadEntreprise(id: number) {
    this.entrepriseService.getEntrepriseById(id).subscribe(
      (entreprise) => {
        this.entreprise = entreprise;
        
        // Mise à jour du formulaire
        this.informationsForm.patchValue({
          nom: entreprise.nom,
          adresse: entreprise.adresse,
          mf: entreprise.mf,
          tel: entreprise.tel
        });
      },
      (error) => {
        this.snackBar.open('Erreur lors du chargement de l\'entreprise', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur:', error);
      }
    );
  }
  
  onFileSelected(event: Event, fileType: 'logo' | 'rcs' | 'identitegerant' | 'justificatifedomicile') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.selectedFiles[fileType] = file;
      
      // Créer un aperçu du logo si c'est une image
      if (fileType === 'logo') {
        const reader = new FileReader();
        reader.onload = () => {
          this.logoPreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }
  
  onSubmit() {
    this.submitted = true;
    
    // Vérifier si le formulaire est valide
    if (this.informationsForm.invalid) {
      return;
    }
    
    // Vérifier si RCS est fourni (requis pour la création)
    if (!this.editMode && !this.selectedFiles.rcs) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Créer le FormData
    const formData = new FormData();
    formData.append('nom', this.informationsForm.get('nom').value);
    formData.append('adresse', this.informationsForm.get('adresse').value);
    formData.append('mf', this.informationsForm.get('mf').value || '');
    formData.append('tel', this.informationsForm.get('tel').value || '');
    
    // Ajouter les fichiers s'ils sont présents
    if (this.selectedFiles.logo) {
      formData.append('logo', this.selectedFiles.logo);
    }
    if (this.selectedFiles.rcs) {
      formData.append('rcs', this.selectedFiles.rcs);
    }
    if (this.selectedFiles.identitegerant) {
      formData.append('identitegerant', this.selectedFiles.identitegerant);
    }
    if (this.selectedFiles.justificatifedomicile) {
      formData.append('justificatifedomicile', this.selectedFiles.justificatifedomicile);
    }
    
    if (this.editMode) {
      // Mise à jour de l'entreprise existante
      this.entrepriseService.updateEntreprise(this.entrepriseId, formData).subscribe(
        (response) => {
          this.isSubmitting = false;
          this.snackBar.open('Entreprise mise à jour avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Mettre à jour le document individuellement si nécessaire
          this.updateDocumentsIfNeeded().then(() => {
            // Rediriger vers la page de liste après tous les traitements
            this.router.navigate(['/entreprises']);
          });
        },
        (error) => {
          this.isSubmitting = false;
          this.snackBar.open('Erreur lors de la mise à jour de l\'entreprise', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erreur:', error);
        }
      );
    } else {
      // Création d'une nouvelle entreprise
      this.entrepriseService.createEntreprise(formData).subscribe(
        (response) => {
          this.isSubmitting = false;
          this.snackBar.open('Entreprise créée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Afficher un message de bienvenue après création de la première entreprise
          if (this.isFirstEntreprise()) {
            this.snackBar.open('Bienvenue chez Comptinov! Votre entreprise a été créée avec succès.', 'Merci', {
              duration: 5000,
              panelClass: ['welcome-snackbar']
            });
          }
          
          // Rediriger vers la liste des entreprises
          this.router.navigate(['/entreprises']);
        },
        (error) => {
          this.isSubmitting = false;
          this.snackBar.open('Erreur lors de la création de l\'entreprise', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erreur:', error);
        }
      );
    }
  }
  
  // Méthode pour vérifier s'il s'agit de la première entreprise
  isFirstEntreprise(): boolean {
    // Cette méthode pourrait être améliorée en vérifiant réellement 
    // si c'est la première entreprise via un service
    return !this.editMode;
  }
  
  // Méthode pour mettre à jour les documents individuellement si nécessaire
  async updateDocumentsIfNeeded(): Promise<void> {
    const promises = [];
    
    if (this.selectedFiles.logo) {
      const logoPromise = this.updateDocumentIfNeeded(this.entrepriseId, 'logo', this.selectedFiles.logo);
      promises.push(logoPromise);
    }
    
    if (this.selectedFiles.rcs) {
      const rcsPromise = this.updateDocumentIfNeeded(this.entrepriseId, 'rcs', this.selectedFiles.rcs);
      promises.push(rcsPromise);
    }
    
    if (this.selectedFiles.identitegerant) {
      const idPromise = this.updateDocumentIfNeeded(this.entrepriseId, 'identitegerant', this.selectedFiles.identitegerant);
      promises.push(idPromise);
    }
    
    if (this.selectedFiles.justificatifedomicile) {
      const domPromise = this.updateDocumentIfNeeded(this.entrepriseId, 'justificatifedomicile', this.selectedFiles.justificatifedomicile);
      promises.push(domPromise);
    }
    
    // Attendre que toutes les promesses soient résolues
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
        this.snackBar.open('Tous les documents ont été mis à jour', 'OK', {
          duration: 2000
        });
      } catch (error) {
        this.snackBar.open('Certains documents n\'ont pas pu être mis à jour', 'Fermer', {
          duration: 3000
        });
      }
    }
  }
  
  async updateDocumentIfNeeded(entrepriseId: number, documentType: string, file: File | null): Promise<boolean> {
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        await this.entrepriseService.updateDocument(entrepriseId, documentType, formData).toPromise();
        return true;
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du document ${documentType}:`, error);
        return false;
      }
    }
    return true; // Aucun fichier à mettre à jour
  }
  
  goBack() {
    this.router.navigate(['/entreprises']);
  }
} 