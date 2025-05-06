import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DevisService } from './devis.component.service';

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class DevisComponent implements OnInit {
  // Propriétés du formulaire
  devisForm: FormGroup;
  produitsServices: any[] = [];
  entreprises: any[] = [];
  
  // Propriétés pour les devis
  devisList: any[] = [];
  filteredDevisList: any[] = [];
  selectedEntrepriseId: number | null = null;
  activeTab: 'create' | 'list' = 'list'; // Par défaut on affiche la liste
  
  // Propriétés pour les filtres
  searchTerm: string = '';
  dateFilter: string = 'all';
  numeroFilter: string = '';
  statutFilter: string = 'all';
  montantFilter: string = '';
  
  // Propriétés pour le tri
  sortColumn: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Propriétés pour la pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Propriété pour le menu déroulant de statut
  activeDropdownDevisId: number | null = null;

  constructor(private fb: FormBuilder, private devisService: DevisService) {
    this.devisForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      entrepriseId: ['', Validators.required],
      produitsServices: this.fb.array([])
    });
  }

  chargerDevis() {
    // Si on a un ID d'entreprise
    const entrepriseId = this.selectedEntrepriseId;
    
    if (entrepriseId) {
      this.devisService.getDevisByEntreprise(entrepriseId).subscribe({
        next: (res) => {
          // Handle the response structure from the backend
          if (res.$values) {
            this.devisList = res.$values;
          } else {
            this.devisList = [];
            console.warn("Format de réponse inattendu:", res);
          }
          
          // Appliquer les filtres initiaux et mettre à jour la pagination
          this.applyFilters();
        },
        error: (err) => {
          console.error("Erreur chargement devis:", err);
          this.devisList = [];
          this.filteredDevisList = [];
          this.updatePagination();
        }
      });
    } else {
      // Réinitialiser si aucune entreprise sélectionnée
      this.devisList = [];
      this.filteredDevisList = [];
      this.updatePagination();
    }
  }
  
  ngOnInit(): void {
    // Chargement des entreprises
    this.devisService.getEntreprises().subscribe({
      next: (data) => {
        this.entreprises = data.$values || data;
        // Si des entreprises sont trouvées, on sélectionne la première par défaut
        if (this.entreprises.length > 0) {
          this.selectedEntrepriseId = this.entreprises[0].id;
          this.devisForm.get('entrepriseId')?.setValue(this.selectedEntrepriseId);
          this.chargerDevis();
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des entreprises:", err);
        this.entreprises = [];
      }
    });

    // Réagir au changement d'entreprise dans le formulaire
    this.devisForm.get('entrepriseId')?.valueChanges.subscribe(id => {
      if (id) {
        this.loadProduitsServices(id);
      }
    });
  
    this.addProduit(); // Ajouter un champ produit par défaut
  }

  // Applique tous les filtres aux devis
  applyFilters() {
    let result = [...this.devisList];
    
    // Filtre de recherche globale
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      result = result.filter(d => 
        d.numDevis.toString().includes(search) ||
        d.statut.toLowerCase().includes(search)
      );
    }
    
    // Filtre par date
    if (this.dateFilter !== 'all') {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      
      result = result.filter(d => {
        const devisDate = new Date(d.date);
        
        switch(this.dateFilter) {
          case 'this-month':
            return devisDate >= firstDayOfMonth;
          case 'last-month':
            return devisDate >= firstDayOfLastMonth && devisDate <= lastDayOfLastMonth;
          case 'this-year':
            return devisDate >= firstDayOfYear;
          default:
            return true;
        }
      });
    }
    
    // Filtre par numéro de devis
    if (this.numeroFilter) {
      result = result.filter(d => d.numDevis.toString().includes(this.numeroFilter));
    }
    
    // Filtre par statut
    if (this.statutFilter !== 'all') {
      result = result.filter(d => d.statut.toLowerCase() === this.statutFilter.toLowerCase());
    }
    
    // Filtre par montant
    if (this.montantFilter) {
      const montant = parseFloat(this.montantFilter.replace(',', '.'));
      if (!isNaN(montant)) {
        result = result.filter(d => 
          Math.abs(d.montantTotal - montant) < 0.01 || // Égal
          d.montantTotal.toString().includes(this.montantFilter) // Contient le texte
        );
      }
    }
    
    // Appliquer le tri
    result = this.sortDevis(result);
    
    // Mettre à jour les devis filtrés
    this.filteredDevisList = result;
    
    // Mettre à jour la pagination
    this.updatePagination();
  }
  
  // Tri des devis
  sortDevis(devis: any[]) {
    return devis.sort((a, b) => {
      let comparison = 0;
      
      switch(this.sortColumn) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'numDevis':
          comparison = parseInt(a.numDevis) - parseInt(b.numDevis);
          break;
        case 'montantTotal':
          comparison = a.montantTotal - b.montantTotal;
          break;
        case 'statut':
          comparison = a.statut.localeCompare(b.statut);
          break;
      }
      
      // Inverser le tri si c'est descendant
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
  
  // Change la colonne de tri ou inverse la direction
  sortBy(column: string) {
    if (this.sortColumn === column) {
      // Inverser la direction si on clique sur la même colonne
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Nouvelle colonne, trier par défaut en ordre descendant
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    
    this.applyFilters();
  }
  
  // Met à jour les informations de pagination
  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredDevisList.length / this.itemsPerPage));
    
    // S'assurer que la page courante est valide
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }
  
  // Naviguer vers une page spécifique
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Méthode pour changer le statut d'un devis
  changeDevisStatus(devis: any, newStatus: string) {
    console.log('Tentative de changement de statut:', { 
      devisId: devis.id, 
      devisNumero: devis.numDevis,
      ancienStatut: devis.statut, 
      nouveauStatut: newStatus 
    });
    
    // Si le statut est déjà celui sélectionné, ne rien faire
    if (devis.statut === newStatus) {
      console.log('Statut identique, aucun changement nécessaire');
      return;
    }
    
    // Sauvegarder l'ancien statut en cas d'erreur
    const previousStatus = devis.statut;
    
    // Vérification des données avant envoi
    if (!devis.id) {
      console.error('Erreur: ID du devis manquant', devis);
      alert('Erreur: ID du devis manquant. Impossible de mettre à jour le statut.');
      return;
    }
    
    console.log(`Appel API pour mettre à jour le statut: PUT ${this.devisService['apiDevisUrl']}/update-status/${devis.id}`);
    console.log('Payload:', { statut: newStatus });
    
    this.devisService.updateDevisStatus(devis.id, newStatus).subscribe({
      next: (response) => {
        console.log('Réponse API complète:', response);
        
        // Mettre à jour le statut dans l'interface
        console.log(`Mise à jour du statut dans l'UI: ${previousStatus} -> ${newStatus}`);
        devis.statut = newStatus;
        
        // Afficher une notification de succès
        if (response && response.message) {
          console.log('Message de succès:', response.message);
          alert(`✅ ${response.message}`);
        } else {
          const successMsg = `Statut du devis ${devis.numDevis} mis à jour: ${newStatus}`;
          console.log(successMsg);
          alert(`✅ ${successMsg}`);
        }
        
        // Forcer le rafraîchissement des données
        setTimeout(() => {
          // Vérification de l'état après mise à jour
          console.log('État du devis après mise à jour:', devis);
          
          // Rafraîchir le filtrage
          this.applyFilters();
        }, 100);
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        
        // Restaurer le statut précédent en cas d'erreur
        console.log(`Restauration du statut précédent: ${newStatus} -> ${previousStatus}`);
        devis.statut = previousStatus;
        
        // Afficher l'erreur
        let errorMsg = 'Erreur lors de la mise à jour du statut';
        
        // Extraire le message d'erreur de la réponse API si disponible
        if (err.error && err.error.message) {
          errorMsg = err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        console.error('Message d\'erreur:', errorMsg);
        alert(`❌ ${errorMsg}`);
      }
    });
  }
  
  // Méthode pour toggler l'affichage du dropdown
  toggleStatusDropdown(devisId: number, event: MouseEvent) {
    // Empêcher la propagation de l'événement pour éviter les fermetures involontaires
    event.stopPropagation();
    
    if (this.activeDropdownDevisId === devisId) {
      this.activeDropdownDevisId = null;
    } else {
      this.activeDropdownDevisId = devisId;
    }
  }
  
  // Méthode pour récupérer un devis par son ID
  getDevisById(id: number | null): any {
    if (id === null) return null;
    return this.devisList.find(d => d.id === id) || null;
  }
  
  // Méthode appelée lors du changement d'entreprise dans le formulaire
  onEntrepriseChange() {
    const entrepriseId = this.devisForm.get('entrepriseId')?.value;
    if (entrepriseId) {
      this.loadProduitsServices(entrepriseId);
    }
  }
  
  loadProduitsServices(entrepriseId: number) {
    this.devisService.getProduitsServicesByEntreprise(entrepriseId).subscribe({
      next: (data) => {
        this.produitsServices = data.$values ?? []; // ✅ prend la vraie liste
      },
      error: (err) => {
        console.error("Erreur lors du chargement des produits:", err);
        this.produitsServices = [];
      }
    });
  }
  
  get produits(): FormArray {
    return this.devisForm.get('produitsServices') as FormArray;
  }

  addProduit() {
    const produitGroup = this.fb.group({
      produitServiceId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]]
    });
    this.produits.push(produitGroup);
  }

  removeProduit(index: number) {
    this.produits.removeAt(index);
  }

  submit() {
    if (this.devisForm.invalid) {
      alert("Formulaire invalide");
      return;
    }
  
    const formValue = this.devisForm.value;
  
    // Format the date to match the backend's expected format
    const formattedDate = new Date(formValue.date).toISOString();
  
    const dto = {
      numDevis: "", // Backend will generate this
      date: formattedDate,
      entrepriseId: Number(formValue.entrepriseId),
      produitsServices: formValue.produitsServices.map((item: any) => ({
        produitServiceId: Number(item.produitServiceId),
        quantite: Number(item.quantite)
      }))
    };
    
    console.log('Sending DTO:', JSON.stringify(dto, null, 2)); // Pretty print the DTO
    
    this.devisService.createDevis(dto).subscribe({
      next: (res) => {
        console.log('Success response:', res);
        if (res.message) {
          alert(`✅ ${res.message}`);
          this.devisForm.reset({
            date: new Date().toISOString().substring(0, 10)
          });
          // Créer un nouveau champ produit par défaut
          this.produits.clear();
          this.addProduit();
          
          // Si l'entreprise était déjà sélectionnée, on peut recharger les devis
          if (formValue.entrepriseId) {
            this.selectedEntrepriseId = Number(formValue.entrepriseId);
            this.activeTab = 'list';
            this.chargerDevis();
          }
        }
      },
      error: (err) => {
        console.error('Full error object:', err);
        console.error('Error response:', err.error);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        const errorMessage = err.error?.message || 'Erreur inconnue';
        alert('❌ Erreur lors de la création du devis: ' + errorMessage);
      }
    });
  }
} 