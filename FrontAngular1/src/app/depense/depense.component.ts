import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DepenseService, Depense, Entreprise, DepenseResponse, ApiResponse } from './depense.service';
import { catchError, finalize, tap, delay } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-depense',
  templateUrl: './depense.component.html',
  styleUrls: ['./depense.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class DepenseComponent implements OnInit {
  // Propriétés du formulaire
  depenseForm: FormGroup;
  entreprises: Entreprise[] = [];
  
  // Propriétés pour les dépenses
  depenses: Depense[] = [];
  filteredDepenses: Depense[] = [];
  selectedEntrepriseId: number | null = null;
  activeTab: 'create' | 'list' = 'list'; // Par défaut on affiche la liste
  
  // Propriétés pour les filtres
  searchTerm: string = '';
  dateFilter: string = 'all';
  categorieFilter: string = '';
  fournisseurFilter: string = '';
  montantFilter: string = '';
  statutFilter: string = 'all';
  
  // Propriétés pour le tri
  sortColumn: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Propriétés pour la pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  Math = Math;

  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private depenseService: DepenseService) {
    // Formater la date du jour pour les champs de type date HTML
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD pour les inputs date HTML
    
    this.depenseForm = this.fb.group({
      categorie: ['', Validators.required],
      fournisseur: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      date: [today, Validators.required],
      justificatif: ['', Validators.required],
      entreprisID: ['', Validators.required],
      fichierVerification: [null]
    });
  }
  
  ngOnInit(): void {
    console.log('Initialisation du composant Depense');
    
    // Date du jour formatée correctement pour le formulaire HTML
    const today = new Date().toISOString().split('T')[0];
    this.depenseForm.get('date')?.setValue(today);
    
    // Chargement des entreprises
    this.depenseService.getEntreprises().subscribe({
      next: (data) => {
        console.log('Entreprises reçues:', data);
        this.entreprises = data;
        
        // Si des entreprises sont trouvées, on sélectionne la première par défaut
        if (this.entreprises && this.entreprises.length > 0) {
          this.selectedEntrepriseId = this.entreprises[0].id;
          this.depenseForm.get('entreprisID')?.setValue(this.selectedEntrepriseId);
          console.log(`Entreprise sélectionnée par défaut: ID=${this.selectedEntrepriseId}`);
          
          // Charger les dépenses pour cette entreprise
          this.chargerDepenses();
        } else {
          console.warn('Aucune entreprise trouvée');
          alert('Aucune entreprise n\'est disponible. Veuillez d\'abord créer une entreprise.');
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des entreprises:", err);
        this.entreprises = [];
        alert('Erreur lors du chargement des entreprises. Veuillez rafraîchir la page.');
      }
    });
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  submit(): void {
    if (!this.depenseForm.valid) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    // Récupérer les valeurs du formulaire
    const formData = new FormData();
    const formValues = this.depenseForm.value;
    
    // Log des valeurs du formulaire
    console.log('Valeurs du formulaire:', formValues);

    // Vérifier que toutes les valeurs requises sont présentes
    const requiredFields = ['categorie', 'fournisseur', 'montant', 'date', 'justificatif', 'entreprisID'];
    const missingFields = requiredFields.filter(field => !formValues[field]);
    
    if (missingFields.length > 0) {
      console.error('Champs manquants:', missingFields);
      alert('Veuillez remplir tous les champs requis: ' + missingFields.join(', '));
      return;
    }

    // Formater correctement la date avant de l'ajouter au FormData
    const dateValue = formValues.date;
    let formattedDate;
    
    if (dateValue) {
      try {
        // Convertir en objet Date
        const date = new Date(dateValue);
        
        // Vérifier que la date est valide
        if (isNaN(date.getTime())) {
          throw new Error('Date invalide');
        }
        
        // Formatage correct pour correspondre au format attendu par le backend
        formattedDate = date.toISOString();
        
        console.log('Date formatée pour le backend:', formattedDate);
      } catch (error) {
        console.error('Erreur lors du formatage de la date:', error);
        alert('Date invalide. Veuillez sélectionner une date valide.');
        return;
      }
    } else {
      console.error('Date manquante');
      alert('Veuillez sélectionner une date');
      return;
    }

    // Ajouter les valeurs au FormData avec la date formatée
    Object.keys(formValues).forEach(key => {
      if (key !== 'fichierVerification' && key !== 'date') {
        formData.append(key, formValues[key]);
      }
    });
    
    // Ajouter la date correctement formatée
    formData.append('date', formattedDate);

    // Ajouter le fichier de vérification sous le nom correct (FichierVerification)
    if (this.selectedFile) {
      formData.append('fichierVerification', this.selectedFile, this.selectedFile.name);
    }

    // Log des données envoyées
    console.log('Données envoyées au serveur:', {
      categorie: formValues.categorie,
      fournisseur: formValues.fournisseur,
      montant: formValues.montant,
      date: formattedDate,
      justificatif: formValues.justificatif,
      entreprisID: formValues.entreprisID,
      fichier: this.selectedFile ? this.selectedFile.name : 'aucun'
    });

    // Désactiver le formulaire pendant le traitement
    this.depenseForm.disable();

    this.depenseService.createDepense(formData)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création de la dépense:', error);
          
          // Afficher un message d'erreur approprié avec les détails
          let errorMessage = error.message || 'Erreur lors de la création de la dépense';
          if (error.details) {
            errorMessage += '\n\nDétails: ' + error.details;
          }
          
          if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
          } else if (error.status === 500) {
            errorMessage = 'Erreur serveur interne.\n\nVeuillez vérifier que tous les champs sont correctement remplis et que le fichier joint est valide.';
            if (error.error && error.error.details) {
              errorMessage += '\n\nDétails techniques: ' + error.error.details;
            }
          }
          
          alert(errorMessage);
          return of(null);
        }),
        finalize(() => {
          this.depenseForm.enable();
        })
      )
      .subscribe(response => {
        if (response) {
          console.log('Réponse du serveur:', response);
          
          // Stocker l'ID de la dépense créée
          const depenseId = response.id;
          
          if (depenseId) {
            // Afficher le message de succès
            alert('Dépense créée avec succès (ID: ' + depenseId + ')');
            
            // Réinitialiser le formulaire
            this.depenseForm.reset();
            this.depenseForm.get('date')?.setValue(new Date().toISOString().substring(0, 10));
            this.depenseForm.get('entreprisID')?.setValue(this.selectedEntrepriseId);
            this.selectedFile = null;
            
            // Passer à l'onglet de liste
            this.activeTab = 'list';
            
            // Recharger les dépenses avec un délai pour s'assurer que la base de données est à jour
            setTimeout(() => {
              console.log('Rechargement des dépenses...');
              this.chargerDepenses();
            }, 1000);
          } else {
            console.error('ID de dépense manquant dans la réponse:', response);
            alert('Erreur: ID de dépense manquant dans la réponse');
          }
        } else {
          console.error('Réponse vide du serveur');
          alert('Erreur: Réponse invalide du serveur');
        }
      });
  }

  chargerDepenses(): void {
    if (!this.selectedEntrepriseId) {
      console.error('Aucune entreprise sélectionnée');
      return;
    }

    console.log('Chargement des dépenses pour entreprise:', this.selectedEntrepriseId);
    
    this.depenseService.getDepensesByEntreprise(this.selectedEntrepriseId)
      .subscribe({
        next: (data) => {
          console.log('Dépenses reçues:', data);
          
          if (!data || data.length === 0) {
            console.log('Aucune dépense trouvée pour cette entreprise');
            this.depenses = [];
          } else {
            this.depenses = data;
            console.log(`${this.depenses.length} dépense(s) chargée(s)`);
          }
          
          this.applyFilters();
          this.calculateTotalPages();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des dépenses:', err);
          this.depenses = [];
          this.filteredDepenses = [];
          this.calculateTotalPages();
          alert('Erreur lors du chargement des dépenses. Veuillez réessayer.');
        }
      });
  }

  telechargerJustificatif(depenseId: number): void {
    this.depenseService.getJustificatif(depenseId).subscribe({
      next: (response: Blob) => {
        // Créer un blob à partir des données et le télécharger
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `justificatif_${depenseId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        // Rafraîchir la liste des dépenses pour refléter le changement de statut
        this.chargerDepenses();
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du justificatif:', error);
        alert('Erreur lors du téléchargement du justificatif');
      }
    });
  }

  // Méthodes de filtrage et tri
  applyFilters(): void {
    let filtered = [...this.depenses];
    console.log('Filtrage en cours sur', filtered.length, 'dépenses');

    // Filtrage par terme de recherche (sur plusieurs champs)
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      const countBefore = filtered.length;
      filtered = filtered.filter(depense => 
        depense.fournisseur.toLowerCase().includes(searchTermLower) || 
        depense.categorie.toLowerCase().includes(searchTermLower) ||
        depense.justificatif.toLowerCase().includes(searchTermLower)
      );
      console.log(`Filtre "Recherche" (${this.searchTerm}): ${countBefore} -> ${filtered.length}`);
    }

    // Filtrage par date
    if (this.dateFilter !== 'all') {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      const countBefore = filtered.length;

      filtered = filtered.filter(depense => {
        const depenseDate = new Date(depense.date);
        if (this.dateFilter === 'this-month') {
          return depenseDate >= firstDayOfMonth;
        } else if (this.dateFilter === 'last-month') {
          return depenseDate >= firstDayOfLastMonth && depenseDate < firstDayOfMonth;
        } else if (this.dateFilter === 'this-year') {
          return depenseDate >= firstDayOfYear;
        }
        return true;
      });
      console.log(`Filtre "Date" (${this.dateFilter}): ${countBefore} -> ${filtered.length}`);
    }

    // Filtrage par catégorie
    if (this.categorieFilter) {
      const countBefore = filtered.length;
      filtered = filtered.filter(depense => 
        depense.categorie.toLowerCase().includes(this.categorieFilter.toLowerCase())
      );
      console.log(`Filtre "Catégorie" (${this.categorieFilter}): ${countBefore} -> ${filtered.length}`);
    }

    // Filtrage par fournisseur
    if (this.fournisseurFilter) {
      const countBefore = filtered.length;
      filtered = filtered.filter(depense => 
        depense.fournisseur.toLowerCase().includes(this.fournisseurFilter.toLowerCase())
      );
      console.log(`Filtre "Fournisseur" (${this.fournisseurFilter}): ${countBefore} -> ${filtered.length}`);
    }

    // Filtrage par montant
    if (this.montantFilter) {
      const montant = parseFloat(this.montantFilter);
      if (!isNaN(montant)) {
        const countBefore = filtered.length;
        filtered = filtered.filter(depense => depense.montant === montant);
        console.log(`Filtre "Montant" (${this.montantFilter}): ${countBefore} -> ${filtered.length}`);
      }
    }

    // Filtrage par statut
    if (this.statutFilter !== 'all') {
      const countBefore = filtered.length;
      filtered = filtered.filter(depense => depense.type === this.statutFilter);
      console.log(`Filtre "Statut" (${this.statutFilter}): ${countBefore} -> ${filtered.length}`);
    }

    // Tri
    filtered.sort((a, b) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        return this.sortDirection === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      }
    });

    this.filteredDepenses = filtered;
    console.log('Filtrage terminé, résultat:', filtered.length, 'dépenses');
    this.calculateTotalPages();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredDepenses.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  get paginatedDepenses(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredDepenses.slice(start, end);
  }

  get produitsFormArray(): FormArray {
    return this.depenseForm.get('produitsServices') as FormArray;
  }

  // Fonction de diagnostic pour vérifier les problèmes
  diagnostiquerProblemeAffichage(): void {
    // 1. Vérifier les filtres actifs
    console.log('=== DIAGNOSTIC DES FILTRES ACTIFS ===');
    console.log('Date:', this.dateFilter);
    console.log('Statut:', this.statutFilter);
    console.log('Catégorie:', this.categorieFilter);
    console.log('Fournisseur:', this.fournisseurFilter);
    console.log('Montant:', this.montantFilter);
    console.log('Recherche:', this.searchTerm);
    
    // 2. Vérifier l'état des dépenses avant filtrage
    console.log('=== DIAGNOSTIC DES DONNÉES ===');
    console.log('Total dépenses chargées:', this.depenses.length);
    console.log('Total dépenses après filtrage:', this.filteredDepenses.length);
    
    if (this.depenses.length > 0) {
      // Afficher quelques données d'exemple
      console.log('Exemple de dépense:', this.depenses[0]);
    }
    
    // 3. Vérifier directement l'API
    if (this.selectedEntrepriseId) {
      console.log('=== VÉRIFICATION DIRECTE DE L\'API ===');
      const timestamp = new Date().getTime();
      const url = `${this.depenseService['apiDepensesUrl']}/entreprise/${this.selectedEntrepriseId}?t=${timestamp}`;
      
      console.log('Appel API direct:', url);
      
      // Appel direct à l'API pour voir ce qu'elle retourne réellement
      this.depenseService['http'].get(url).subscribe({
        next: (data: any) => {
          console.log('Réponse brute de l\'API:', data);
          
          // Si les données sont disponibles, vérifier les IDs
          if (Array.isArray(data)) {
            console.log('IDs des dépenses retournées:', data.map((d: any) => d.id));
          } else if (data && typeof data === 'object' && '$values' in data && Array.isArray(data.$values)) {
            console.log('IDs des dépenses retournées:', data.$values.map((d: any) => d.id));
          }
        },
        error: (err) => {
          console.error('Erreur lors de la vérification directe:', err);
        }
      });
    }
    
    // 4. Réinitialiser tous les filtres
    const resetFiltres = confirm('Voulez-vous réinitialiser tous les filtres pour voir toutes les dépenses?');
    if (resetFiltres) {
      this.dateFilter = 'all';
      this.statutFilter = 'all';
      this.categorieFilter = '';
      this.fournisseurFilter = '';
      this.montantFilter = '';
      this.searchTerm = '';
      this.applyFilters();
      
      // Recharger les données
      this.chargerDepenses();
    }
  }
} 