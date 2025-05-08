import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DepenseService } from './depense.service';
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
  entreprises: any[] = [];
  
  // Propriétés pour les dépenses
  depenses: any[] = [];
  filteredDepenses: any[] = [];
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
    this.depenseForm = this.fb.group({
      categorie: ['', Validators.required],
      fournisseur: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      justificatif: ['', Validators.required],
      entreprisID: ['', Validators.required],
      fichierVerification: [null]
    });
  }
  
  ngOnInit(): void {
    // Chargement des entreprises
    this.depenseService.getEntreprises().subscribe({
      next: (data) => {
        this.entreprises = data.$values || data;
        // Si des entreprises sont trouvées, on sélectionne la première par défaut
        if (this.entreprises.length > 0) {
          this.selectedEntrepriseId = this.entreprises[0].id;
          this.depenseForm.get('entreprisID')?.setValue(this.selectedEntrepriseId);
          this.chargerDepenses();
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des entreprises:", err);
        this.entreprises = [];
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
    const categorie = this.depenseForm.get('categorie')?.value;
    const fournisseur = this.depenseForm.get('fournisseur')?.value;
    const montant = this.depenseForm.get('montant')?.value;
    const date = this.depenseForm.get('date')?.value;
    const justificatif = this.depenseForm.get('justificatif')?.value;
    const entreprisID = this.depenseForm.get('entreprisID')?.value;
    
    // S'assurer que les valeurs sont valides
    if (!categorie || !fournisseur || !montant || !date || !justificatif || !entreprisID) {
      console.error('Valeurs de formulaire manquantes');
      alert('Veuillez remplir tous les champs requis');
      return;
    }
    
    // Log les valeurs pour déboguer
    console.log('Valeurs du formulaire:', {
      categorie,
      fournisseur,
      montant,
      date,
      justificatif,
      entreprisID,
      fichier: this.selectedFile ? this.selectedFile.name : 'aucun'
    });
    
    // S'assurer que entreprisID est un nombre
    const entreprisIDNum = Number(entreprisID);
    if (isNaN(entreprisIDNum)) {
      console.error('EntreprisID invalide:', entreprisID);
      alert('ID d\'entreprise invalide');
      return;
    }
    
    // Créer le FormData
    const formData = new FormData();
    formData.append('categorie', categorie);
    formData.append('fournisseur', fournisseur);
    formData.append('montant', montant.toString());
    formData.append('date', date);
    formData.append('justificatif', justificatif);
    formData.append('entreprisID', entreprisIDNum.toString());

    if (this.selectedFile) {
      formData.append('fichierVerification', this.selectedFile, this.selectedFile.name);
    }
    
    console.log('Envoi de FormData avec entreprisID:', entreprisIDNum);
    
    // Désactiver le formulaire pendant le traitement
    this.depenseForm.disable();
    
    // Variable pour stocker l'ID de la dépense créée
    let createdDepenseId: number | null = null;
    
    this.depenseService.createDepense(formData)
      .pipe(
        tap(response => {
          console.log('Réponse brute du serveur:', response);
          
          // Extraire l'ID de la dépense créée
          if (response && response.id) {
            createdDepenseId = response.id;
            console.log('ID de la dépense créée:', createdDepenseId);
          }
        }),
        catchError(error => {
          console.error('Erreur interceptée:', error);
          
          // Vérifier si le corps de l'erreur contient un ID de dépense
          if (error && error.error && error.error.id) {
            createdDepenseId = error.error.id;
            console.log('ID de la dépense trouvé dans l\'erreur:', createdDepenseId);
          }
          
          // Si c'est une erreur 500 OK ou contient un message de succès
          if ((error.status === 500 && error.statusText === 'OK') || 
              (error.error && error.error.message && error.error.message.includes('succès'))) {
            console.log('Traitement comme succès malgré l\'erreur');
            return of({ 
              message: 'Dépense créée avec succès', 
              isErrorButSuccess: true,
              id: createdDepenseId
            });
          }
          
          // Propager l'erreur
          throw error;
        }),
        // Attendre pour s'assurer que la transaction est terminée
        delay(1500),
        // Réactiver le formulaire dans tous les cas
        finalize(() => {
          this.depenseForm.enable();
        })
      )
      .subscribe({
        next: (response) => {
          // Si on a reçu un ID dans la réponse et qu'il n'est pas déjà stocké
          if (response.id && !createdDepenseId) {
            createdDepenseId = response.id;
          }
          
          console.log('Réponse finale, ID dépense:', createdDepenseId);
          
          // Afficher le message de succès
          alert('Dépense créée avec succès' + (createdDepenseId ? ` (ID: ${createdDepenseId})` : ''));
          
          // Réinitialiser le formulaire
          this.depenseForm.reset();
          this.depenseForm.get('date')?.setValue(new Date().toISOString().substring(0, 10));
          this.selectedFile = null;
          
          // Passer à l'onglet de liste
          this.activeTab = 'list';
          
          // Fonction pour vérifier si la dépense est dans la liste après chargement
          const verifierPresenceDependeCreee = (attemptsLeft = 3) => {
            setTimeout(() => {
              this.chargerDepenses();
              
              // Si on a un ID, vérifier si la dépense est dans la liste
              if (createdDepenseId) {
                setTimeout(() => {
                  const depenseTrouvee = this.depenses.some(d => d.id === createdDepenseId);
                  console.log(`Dépense ID ${createdDepenseId} trouvée dans la liste: ${depenseTrouvee}`);
                  
                  // Si la dépense n'est pas trouvée et qu'il reste des tentatives, réessayer
                  if (!depenseTrouvee && attemptsLeft > 0) {
                    console.log(`Nouvelle tentative de chargement (${attemptsLeft} restantes)...`);
                    verifierPresenceDependeCreee(attemptsLeft - 1);
                  }
                }, 500);
              }
            }, 1000);
          };
          
          // Lancer la vérification
          verifierPresenceDependeCreee();
        },
        error: (finalError) => {
          console.error('Erreur finale lors de la création:', finalError);
          alert('Erreur lors de la création de la dépense: ' + (finalError.message || 'Erreur inconnue'));
        }
      });
  }

  chargerDepenses(): void {
    console.log('Chargement des dépenses pour entreprise ID:', this.selectedEntrepriseId);
    
    if (!this.selectedEntrepriseId) {
      console.error('Aucune entreprise sélectionnée pour charger les dépenses');
      return;
    }
    
    // S'assurer que l'ID est un nombre
    const entrepriseId = Number(this.selectedEntrepriseId);
    if (isNaN(entrepriseId)) {
      console.error('ID d\'entreprise invalide pour charger les dépenses:', this.selectedEntrepriseId);
      return;
    }
    
    console.log('Appel API pour charger les dépenses de l\'entreprise ID:', entrepriseId);
    
    this.depenseService.getDepensesParEntreprise(entrepriseId)
      .pipe(
        tap(data => console.log('Données reçues pour les dépenses:', data)),
        catchError(err => {
          console.error('Erreur lors du chargement des dépenses:', err);
          // Retourner un tableau vide en cas d'erreur pour éviter de bloquer le flux
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          // Vérifier si les données sont dans un format attendu
          if (data && Array.isArray(data)) {
            this.depenses = data;
          } else if (data && data.$values && Array.isArray(data.$values)) {
            this.depenses = data.$values;
          } else if (data) {
            console.warn('Format de données inattendu:', data);
            // Essayer de convertir en tableau si possible
            this.depenses = Array.isArray(data) ? data : [data];
          } else {
            this.depenses = [];
          }
          
          console.log(`${this.depenses.length} dépenses chargées.`);
          this.applyFilters();
          this.calculateTotalPages();
        }
      });
  }

  telechargerJustificatif(depenseId: number): void {
    this.depenseService.getJustificatif(depenseId).subscribe({
      next: (response: any) => {
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

    // Filtrage par terme de recherche (sur plusieurs champs)
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(depense => 
        depense.fournisseur.toLowerCase().includes(searchTermLower) || 
        depense.categorie.toLowerCase().includes(searchTermLower) ||
        depense.justificatif.toLowerCase().includes(searchTermLower)
      );
    }

    // Filtrage par date
    if (this.dateFilter !== 'all') {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

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
    }

    // Filtrage par catégorie
    if (this.categorieFilter) {
      filtered = filtered.filter(depense => 
        depense.categorie.toLowerCase().includes(this.categorieFilter.toLowerCase())
      );
    }

    // Filtrage par fournisseur
    if (this.fournisseurFilter) {
      filtered = filtered.filter(depense => 
        depense.fournisseur.toLowerCase().includes(this.fournisseurFilter.toLowerCase())
      );
    }

    // Filtrage par montant
    if (this.montantFilter) {
      const montant = parseFloat(this.montantFilter);
      if (!isNaN(montant)) {
        filtered = filtered.filter(depense => depense.montant === montant);
      }
    }

    // Filtrage par statut
    if (this.statutFilter !== 'all') {
      filtered = filtered.filter(depense => depense.type === this.statutFilter);
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
} 