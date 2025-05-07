import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProduitServiceService, ProduitServiceModel } from './produit-service.service';
import { EntrepriseService, EntrepriseModel } from '../core/services/entreprise.service';
import { UserService } from '../core/user/user.service';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-produit-service',
  templateUrl: './produit-service.component.html',
  styleUrls: ['./produit-service.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ]
})
export class ProduitServiceComponent implements OnInit {
  // Rendre Math accessible au template
  Math = Math;
  
  produitServices: ProduitServiceModel[] = [];
  filteredProduitServices: ProduitServiceModel[] = [];
  produitServiceForm: FormGroup;
  entreprises: EntrepriseModel[] = [];
  selectedEntrepriseId: number | null = null;
  isLoading = false;
  isEditing = false;
  searchTerm = '';
  selectedProduitService: ProduitServiceModel | null = null;
  currentUserId: number | null = null;
  
  // Filtres avancés
  filterNom = '';
  filterPrixMin: number | null = null;
  filterPrixMax: number | null = null;
  filterTVA: number | null = null;
  tvaSuggestions: number[] = [];
  isFiltered = false;
  
  // Pagination
  pageSize = 15; // Pagination à 15 produits par page
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 15, 25, 50];
  
  // Tri
  sortDirection: 'asc' | 'desc' = 'asc';
  sortField: string = 'nom';
  
  // Colonnes à afficher dans le tableau
  displayedColumns: string[] = ['nom', 'prixUnitaire', 'tva', 'actions'];

  constructor(
    private fb: FormBuilder,
    private produitServiceService: ProduitServiceService,
    private entrepriseService: EntrepriseService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.produitServiceForm = this.fb.group({
      id: [null],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0.01)]],
      tva: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      entrepriseId: ['', Validators.required]
    });
    
    // Récupérer l'ID de l'utilisateur actuel
    this.userService.user$.subscribe(user => {
      if (user && user.id) {
        this.currentUserId = +user.id; // Convertir en nombre
        console.log('ID utilisateur actuel:', this.currentUserId);
      }
    });
  }

  ngOnInit(): void {
    this.loadEntreprises();
  }

  // Chargement des entreprises
  loadEntreprises(): void {
    this.isLoading = true;
    this.entrepriseService.getAllEntreprises()
      .subscribe({
        next: (data: any) => {
          // Gérer les formats de réponse possibles
          if (data && data.$values) {
            this.entreprises = data.$values;
          } else {
            this.entreprises = Array.isArray(data) ? data : [];
          }
          
          if (this.entreprises.length > 0 && this.entreprises[0].id) {
            this.selectedEntrepriseId = this.entreprises[0].id;
            this.produitServiceForm.get('entrepriseId')?.setValue(this.selectedEntrepriseId);
            this.loadProduitServices();
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des entreprises:', error);
          this.snackBar.open('Erreur lors du chargement des entreprises', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
          this.entreprises = [];
          this.isLoading = false;
        }
      });
  }

  // Chargement des produits et services
  loadProduitServices(): void {
    if (!this.selectedEntrepriseId) return;
    
    this.isLoading = true;
    this.produitServiceService.getProduitServicesByEntreprise(this.selectedEntrepriseId)
      .subscribe({
        next: (data) => {
          // Gérer les formats de réponse possibles
          if (data.$values) {
            this.produitServices = data.$values;
          } else {
            this.produitServices = Array.isArray(data) ? data : [];
          }
          
          // Extraire les valeurs de TVA uniques pour les suggestions
          this.extractTvaSuggestions();
          
          this.applyFilter();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des produits/services:', error);
          this.snackBar.open('Erreur lors du chargement des produits et services', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
          this.produitServices = [];
          this.filteredProduitServices = [];
          this.isLoading = false;
        }
      });
  }

  // Filtrer les produits et services
  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProduitServices = [...this.produitServices];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      this.filteredProduitServices = this.produitServices.filter(item => 
        item.nom.toLowerCase().includes(searchTermLower) ||
        item.prixUnitaire.toString().includes(searchTermLower) ||
        item.tva.toString().includes(searchTermLower)
      );
    }
    
    // Après un filtre global, appliquer également les filtres avancés
    this.applyAdvancedFilters(false);
    
    // Réinitialiser à la première page après un filtre
    this.currentPage = 0;
  }
  
  // Appliquer les filtres avancés
  applyAdvancedFilters(resetPage: boolean = true): void {
    // Conserver les produits filtrés par la recherche globale
    let result = this.searchTerm.trim() ? [...this.filteredProduitServices] : [...this.produitServices];
    
    // Filtre par nom (spécifique)
    if (this.filterNom.trim()) {
      const nomFilter = this.filterNom.toLowerCase().trim();
      result = result.filter(item => item.nom.toLowerCase().includes(nomFilter));
    }
    
    // Filtre par prix minimum
    if (this.filterPrixMin !== null && !isNaN(this.filterPrixMin)) {
      result = result.filter(item => item.prixUnitaire >= (this.filterPrixMin || 0));
    }
    
    // Filtre par prix maximum
    if (this.filterPrixMax !== null && !isNaN(this.filterPrixMax)) {
      result = result.filter(item => item.prixUnitaire <= (this.filterPrixMax || Number.MAX_VALUE));
    }
    
    // Filtre par TVA
    if (this.filterTVA !== null) {
      result = result.filter(item => item.tva === this.filterTVA);
    }
    
    // Mettre à jour les résultats filtrés
    this.filteredProduitServices = result;
    
    // Vérifier si des filtres sont appliqués
    this.isFiltered = 
      this.filterNom.trim() !== '' || 
      (this.filterPrixMin !== null && !isNaN(this.filterPrixMin)) || 
      (this.filterPrixMax !== null && !isNaN(this.filterPrixMax)) || 
      this.filterTVA !== null;
    
    // Réinitialiser à la première page après un filtre
    if (resetPage) {
      this.currentPage = 0;
    }
  }
  
  // Réinitialiser les filtres avancés
  resetFilters(): void {
    this.filterNom = '';
    this.filterPrixMin = null;
    this.filterPrixMax = null;
    this.filterTVA = null;
    this.isFiltered = false;
    
    // Réappliquer uniquement le filtre global
    this.applyFilter();
  }
  
  // Extraire les valeurs de TVA uniques pour les suggestions
  private extractTvaSuggestions(): void {
    const uniqueTvaSet = new Set<number>();
    this.produitServices.forEach(item => uniqueTvaSet.add(item.tva));
    this.tvaSuggestions = Array.from(uniqueTvaSet).sort((a, b) => a - b);
  }

  // Soumettre le formulaire
  onSubmit(): void {
    if (this.produitServiceForm.invalid) {
      // Afficher les erreurs du formulaire dans la console
      console.log('Formulaire invalide:', this.produitServiceForm.errors);
      console.log('Erreurs par champ:', {
        nom: this.produitServiceForm.get('nom')?.errors,
        prixUnitaire: this.produitServiceForm.get('prixUnitaire')?.errors,
        tva: this.produitServiceForm.get('tva')?.errors,
        entrepriseId: this.produitServiceForm.get('entrepriseId')?.errors
      });
      return;
    }
    
    const formValue = this.produitServiceForm.value;
    
    if (this.isEditing && formValue.id) {
      // Mise à jour d'un produit/service existant
      this.updateProduitService(formValue);
    } else {
      // Création d'un nouveau produit/service
      this.createProduitService(formValue);
    }
  }

  // Créer un nouveau produit/service
  createProduitService(formValue: ProduitServiceModel): void {
    this.isLoading = true;
    
    // Ajouter l'ID utilisateur au produit
    formValue.utilisateurId = this.currentUserId;
    
    // S'assurer que les valeurs numériques sont bien des nombres
    formValue.prixUnitaire = +formValue.prixUnitaire;
    formValue.tva = +formValue.tva;
    formValue.entrepriseId = +formValue.entrepriseId;
    
    // Ajout d'un log pour voir les données envoyées à l'API
    console.log('Données envoyées à l\'API:', formValue);
    
    this.produitServiceService.createProduitService(formValue)
      .subscribe({
        next: () => {
          this.snackBar.open('Produit/Service créé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.resetForm();
          this.loadProduitServices();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          // Afficher plus de détails sur l'erreur
          if (error.error) {
            console.error('Détails de l\'erreur:', error.error);
          }
          this.snackBar.open(
            'Erreur: ' + (error.error?.message || error.error?.title || 'Impossible de créer le produit/service'),
            'Fermer',
            { duration: 5000, panelClass: ['snackbar-error'] }
          );
          this.isLoading = false;
        }
      });
  }

  // Mettre à jour un produit/service
  updateProduitService(formValue: ProduitServiceModel): void {
    if (!formValue.id) return;
    
    this.isLoading = true;
    
    // Ajouter l'ID utilisateur au produit si non défini
    formValue.utilisateurId = formValue.utilisateurId || this.currentUserId;
    
    // S'assurer que les valeurs numériques sont bien des nombres
    formValue.id = +formValue.id;
    formValue.prixUnitaire = +formValue.prixUnitaire;
    formValue.tva = +formValue.tva;
    formValue.entrepriseId = +formValue.entrepriseId;
    
    // Log pour debug
    console.log('Données de mise à jour envoyées à l\'API:', formValue);
    
    this.produitServiceService.updateProduitService(formValue.id, formValue)
      .subscribe({
        next: () => {
          this.snackBar.open('Produit/Service mis à jour avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.resetForm();
          this.loadProduitServices();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.snackBar.open(
            'Erreur: ' + (error.error?.message || 'Impossible de mettre à jour le produit/service'),
            'Fermer',
            { duration: 5000, panelClass: ['snackbar-error'] }
          );
          this.isLoading = false;
        }
      });
  }

  // Éditer un produit/service existant
  editProduitService(produitService: ProduitServiceModel): void {
    this.isEditing = true;
    this.selectedProduitService = produitService;
    
    this.produitServiceForm.patchValue({
      id: produitService.id,
      nom: produitService.nom,
      prixUnitaire: produitService.prixUnitaire,
      tva: produitService.tva,
      entrepriseId: produitService.entrepriseId
    });
  }

  // Supprimer un produit/service
  deleteProduitService(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit/service ?')) {
      this.isLoading = true;
      
      this.produitServiceService.deleteProduitService(id)
        .subscribe({
          next: () => {
            this.snackBar.open('Produit/Service supprimé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
            this.loadProduitServices();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open(
              'Erreur: ' + (error.error?.message || 'Impossible de supprimer le produit/service'),
              'Fermer',
              { duration: 5000, panelClass: ['snackbar-error'] }
            );
            this.isLoading = false;
          }
        });
    }
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.produitServiceForm.reset({
      id: null,
      nom: '',
      prixUnitaire: 0,
      tva: 0,
      entrepriseId: this.selectedEntrepriseId
    });
    this.isEditing = false;
    this.selectedProduitService = null;
  }

  // Changer l'entreprise sélectionnée
  onEntrepriseChange(): void {
    this.selectedEntrepriseId = Number(this.produitServiceForm.get('entrepriseId')?.value);
    this.loadProduitServices();
  }

  // Gestion de la pagination
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }
  
  // Obtenir les éléments de la page actuelle
  get paginatedProduitServices(): ProduitServiceModel[] {
    const startIndex = this.currentPage * this.pageSize;
    const sorted = this.getSortedData([...this.filteredProduitServices]);
    return sorted.slice(startIndex, startIndex + this.pageSize);
  }
  
  // Tri des données
  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';
    this.currentPage = 0; // Réinitialiser à la première page après le tri
  }
  
  // Appliquer le tri aux données
  getSortedData(data: ProduitServiceModel[]): ProduitServiceModel[] {
    if (!this.sortField || !this.sortDirection) {
      return data;
    }
    
    return data.sort((a, b) => {
      const isAsc = this.sortDirection === 'asc';
      switch (this.sortField) {
        case 'nom': return this.compare(a.nom, b.nom, isAsc);
        case 'prixUnitaire': return this.compare(a.prixUnitaire, b.prixUnitaire, isAsc);
        case 'tva': return this.compare(a.tva, b.tva, isAsc);
        default: return 0;
      }
    });
  }
  
  // Utilitaire de comparaison pour le tri
  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
  // Nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.filteredProduitServices.length / this.pageSize);
  }
  
  // Générer un array de numéros de pages pour l'affichage
  getPagesToShow(): number[] {
    const totalPages = this.totalPages;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    // Afficher les premières pages, les pages autour de la page actuelle, et les dernières pages
    let pages: number[] = [0, 1]; // Toujours afficher les 2 premières pages
    
    // Ajouter la page courante et ses voisines
    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(totalPages - 3, this.currentPage + 1);
    
    // Ajouter des ellipses si nécessaire
    if (startPage > 2) {
      pages.push(-1); // -1 représente une ellipse
    }
    
    // Ajouter les pages autour de la page courante
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Ajouter des ellipses si nécessaire
    if (endPage < totalPages - 3) {
      pages.push(-1); // -1 représente une ellipse
    }
    
    // Toujours afficher les 2 dernières pages
    pages.push(totalPages - 2, totalPages - 1);
    
    return pages;
  }
  
  // Changer de page
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
    }
  }
} 