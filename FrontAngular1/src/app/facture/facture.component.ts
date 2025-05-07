import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FactureService } from './facture.component.service';

@Component({
  selector: 'app-facture',
  templateUrl: './facture.component.html',
  styleUrls: ['./facture.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class FactureComponent implements OnInit {
  // Propriétés du formulaire
  factureForm: FormGroup;
  produitsServices: any[] = [];
  entreprises: any[] = [];
  
  // Propriétés pour les factures
  factures: any[] = [];
  filteredFactures: any[] = [];
  selectedEntrepriseId: number | null = null;
  activeTab: 'create' | 'list' | 'payment' = 'list'; // Ajout de l'onglet payment
  
  // Propriétés pour les filtres
  searchTerm: string = '';
  dateFilter: string = 'all';
  numeroFilter: string = '';
  clientFilter: string = '';
  montantFilter: string = '';
  statutFilter: string = 'all';
  
  // Propriétés pour le tri
  sortColumn: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Propriétés pour la pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  // Exposer Math pour le template
  Math = Math;

  // Propriétés pour les paiements
  paiementForm: FormGroup;
  selectedFacture: any = null;
  paiements: any[] = [];

  constructor(private fb: FormBuilder, private factureService: FactureService) {
    this.factureForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      nomClient: ['', Validators.required],
      adressClient: ['', Validators.required],
      telClient: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      cinClient: ['', Validators.required],
      estPayee: [false],
      entrepriseId: ['', Validators.required],
      modePaiement: [''],
      produitsServices: this.fb.array([])
    });

    // Initialiser le formulaire de paiement
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.paiementForm = this.fb.group({
      factureId: [null, Validators.required],
      montant: [0, [Validators.required, Validators.min(0.01)]],
      datePaiement: [tomorrow.toISOString().substring(0, 10), Validators.required],
      modePaiement: ['Bancaire', Validators.required],
      description: ['', Validators.required],
      type: [0, Validators.required] // 0 pour Actif par défaut
    });
  }

  chargerFactures() {
    // Si on a un ID d'entreprise (soit du formulaire, soit de la sélection dans l'onglet liste)
    const entrepriseId = this.selectedEntrepriseId;
    
    if (entrepriseId) {
      this.factureService.getFacturesByEntreprise(entrepriseId).subscribe({
        next: (res) => {
          // Gérer les différents formats de réponse possibles
          if (res.$values) {
            // Ajout du mode de paiement dans chaque facture
            this.factures = res.$values.map(facture => {
              // Vérifie s'il y a des paiements associés
              if (facture.paiements && facture.paiements.$values && facture.paiements.$values.length > 0) {
                // Prendre le premier paiement et extraire son mode de paiement
                facture.modePaiement = facture.paiements.$values[0].modePaiement;
              } else {
                // Si aucun paiement n'est trouvé, laisser vide
                facture.modePaiement = 'Non spécifié';
              }
              return facture;
            });
          } else {
            this.factures = [];
            console.warn("Format de réponse inattendu:", res);
          }
          
          // Appliquer les filtres initiaux et mettre à jour la pagination
          this.applyFilters();
        },
        error: (err) => {
          console.error("Erreur chargement factures:", err);
          this.factures = [];
          this.filteredFactures = [];
          this.updatePagination();
        }
      });
    } else {
      // Réinitialiser si aucune entreprise sélectionnée
      this.factures = [];
      this.filteredFactures = [];
      this.updatePagination();
    }
  }
  
  ngOnInit(): void {
    // Chargement des entreprises
    this.factureService.getEntreprises().subscribe({
      next: (data) => {
        this.entreprises = data.$values || data;
        // Si des entreprises sont trouvées, on sélectionne la première par défaut
        if (this.entreprises.length > 0) {
          this.selectedEntrepriseId = this.entreprises[0].id;
          this.factureForm.get('entrepriseId')?.setValue(this.selectedEntrepriseId);
          this.chargerFactures();
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des entreprises:", err);
        this.entreprises = [];
      }
    });

    // Réagir au changement d'entreprise dans le formulaire
    this.factureForm.get('entrepriseId')?.valueChanges.subscribe(id => {
      if (id) {
        this.loadProduitsServices(id);
      }
    });
  
    this.addProduit(); // Champ par défaut
    this.onEstPayeeChange();

    // Chargement des paiements
    this.chargerPaiements();
  }

  // Méthode pour charger tous les paiements
  chargerPaiements() {
    this.factureService.getAllPaiements().subscribe({
      next: (res) => {
        if (res.$values) {
          this.paiements = res.$values;
        } else {
          this.paiements = [];
          console.warn("Format de réponse inattendu pour les paiements:", res);
        }
      },
      error: (err) => {
        console.error("Erreur chargement paiements:", err);
        this.paiements = [];
      }
    });
  }

  // Applique tous les filtres aux factures
  applyFilters() {
    let result = [...this.factures];
    
    // Filtre de recherche globale
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      result = result.filter(f => 
        f.numFacture.toString().includes(search) ||
        f.nomClient.toLowerCase().includes(search) ||
        f.cinClient.toLowerCase().includes(search) ||
        (f.telClient && f.telClient.includes(search))
      );
    }
    
    // Filtre par date
    if (this.dateFilter !== 'all') {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      
      result = result.filter(f => {
        const factureDate = new Date(f.date);
        
        switch(this.dateFilter) {
          case 'this-month':
            return factureDate >= firstDayOfMonth;
          case 'last-month':
            return factureDate >= firstDayOfLastMonth && factureDate <= lastDayOfLastMonth;
          case 'this-year':
            return factureDate >= firstDayOfYear;
          default:
            return true;
        }
      });
    }
    
    // Filtre par numéro de facture
    if (this.numeroFilter) {
      result = result.filter(f => f.numFacture.toString().includes(this.numeroFilter));
    }
    
    // Filtre par nom du client
    if (this.clientFilter) {
      const search = this.clientFilter.toLowerCase();
      result = result.filter(f => f.nomClient.toLowerCase().includes(search));
    }
    
    // Filtre par montant
    if (this.montantFilter) {
      const montant = parseFloat(this.montantFilter.replace(',', '.'));
      if (!isNaN(montant)) {
        result = result.filter(f => 
          Math.abs(f.montantTotal - montant) < 0.01 || // Égal
          f.montantTotal.toString().includes(this.montantFilter) // Contient le texte
        );
      }
    }
    
    // Filtre par statut
    if (this.statutFilter !== 'all') {
      result = result.filter(f => 
        (this.statutFilter === 'paid' && f.estPayee) || 
        (this.statutFilter === 'unpaid' && !f.estPayee)
      );
    }
    
    // Appliquer le tri
    result = this.sortFactures(result);
    
    // Mettre à jour les factures filtrées
    this.filteredFactures = result;
    
    // Mettre à jour la pagination
    this.updatePagination();
  }
  
  // Tri des factures
  sortFactures(factures: any[]) {
    return factures.sort((a, b) => {
      let comparison = 0;
      
      switch(this.sortColumn) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'numFacture':
          comparison = a.numFacture - b.numFacture;
          break;
        case 'nomClient':
          comparison = a.nomClient.localeCompare(b.nomClient);
          break;
        case 'montantTotal':
          comparison = a.montantTotal - b.montantTotal;
          break;
        case 'montantTTC':
          comparison = a.montantTTC - b.montantTTC;
          break;
        case 'estPayee':
          comparison = (a.estPayee === b.estPayee) ? 0 : a.estPayee ? 1 : -1;
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
    this.totalPages = Math.max(1, Math.ceil(this.filteredFactures.length / this.itemsPerPage));
    
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

  // Méthode appelée lors du changement d'entreprise dans le formulaire
  onEntrepriseChange() {
    const entrepriseId = this.factureForm.get('entrepriseId')?.value;
    if (entrepriseId) {
      this.loadProduitsServices(entrepriseId);
    }
  }
  
  loadProduitsServices(entrepriseId: number) {
    this.factureService.getProduitsServicesByEntreprise(entrepriseId).subscribe({
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
    return this.factureForm.get('produitsServices') as FormArray;
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

  onEstPayeeChange() {
    this.factureForm.get('estPayee')?.valueChanges.subscribe((isPayee) => {
      const modeControl = this.factureForm.get('modePaiement');
      if (isPayee) {
        modeControl?.setValidators([Validators.required]);
      } else {
        modeControl?.clearValidators();
        modeControl?.setValue('');
      }
      modeControl?.updateValueAndValidity();
    });
  }

  submit() {
    if (this.factureForm.invalid) {
      alert("Formulaire invalide");
      return;
    }
  
    const formValue = this.factureForm.value;
  
    const dto = {
      numFacture: "", // Sending empty string since backend auto-generates it
      date: formValue.date,
      nomClient: formValue.nomClient,
      adressClient: formValue.adressClient,
      telClient: formValue.telClient,
      cinClient: formValue.cinClient,
      estPayee: formValue.estPayee,
      entrepriseId: Number(formValue.entrepriseId),
      modePaiement: formValue.estPayee ? formValue.modePaiement : null,
      produitsServices: formValue.produitsServices.map((item: any) => ({
        produitServiceId: Number(item.produitServiceId),
        quantite: Number(item.quantite)
      }))
    };
    
    this.factureService.createFacture(dto).subscribe({
      next: (res) => {
        alert('✅ Facture créée avec succès !');
        this.factureForm.reset({
          date: new Date().toISOString().substring(0, 10),
          estPayee: false
        });
        // Créer un nouveau champ produit par défaut
        this.produits.clear();
        this.addProduit();
        
        // Si l'entreprise était déjà sélectionnée, on peut recharger les factures
        if (formValue.entrepriseId) {
          this.selectedEntrepriseId = Number(formValue.entrepriseId);
          this.activeTab = 'list';
          this.chargerFactures();
        }
      },
      error: (err) => {
        console.error(err);
        alert('❌ Erreur lors de la création de la facture.');
      }
    });
  }

  // Méthode pour gérer l'importation de facture PDF
  onPDFFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.factureService.importerFacturePDF(file).subscribe({
        next: (response) => {
          alert('✅ ' + response.message);
          // La page se rechargera automatiquement grâce au window.location.reload() dans le service
        },
        error: (error) => {
          console.error('Erreur lors de l\'importation de la facture:', error);
          alert('❌ Erreur lors de l\'importation de la facture PDF: ' + 
                (error.error?.message || error.message || 'Une erreur est survenue'));
        }
      });
      
      // Réinitialiser l'input file pour permettre de sélectionner le même fichier à nouveau
      event.target.value = '';
    } else if (file) {
      alert('❌ Veuillez sélectionner un fichier PDF valide.');
      event.target.value = '';
    }
  }

  // Nouvelles méthodes pour la gestion des paiements
  ouvrirFormulairePaiement(facture: any) {
    this.selectedFacture = facture;
    
    // Use tomorrow's date as default for payment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Calculate remaining amount to pay
    const montantRestant = this.calculerMontantRestant(facture);
    
    this.paiementForm.patchValue({
      factureId: facture.id,
      montant: montantRestant,
      datePaiement: tomorrow.toISOString().substring(0, 10),
      modePaiement: 'Bancaire',
      description: `Paiement pour facture numéro ${facture.numFacture}`,
      type: 0 // 0 for Actif
    });
    
    console.log('Payment form initialized with:', this.paiementForm.value);
    this.activeTab = 'payment';
  }

  calculerMontantRestant(facture: any): number {
    // Calculer le montant déjà payé
    let montantPaye = 0;
    if (facture.paiements && facture.paiements.$values) {
      montantPaye = facture.paiements.$values.reduce((acc: number, paiement: any) => acc + paiement.montant, 0);
    }
    
    // Calculer le montant restant arrondi à 2 décimales
    return Math.round((facture.montantTotal - montantPaye) * 100) / 100;
  }

  soumettreFormulairePaiement() {
    if (this.paiementForm.invalid) {
      alert("Formulaire de paiement invalide");
      return;
    }

    // Create a copy of the form value to avoid modifying the original
    const formValue = { ...this.paiementForm.value };
    
    // Ensure the date is in the format expected by the backend
    if (formValue.datePaiement) {
      // Convert local date to UTC format
      const date = new Date(formValue.datePaiement);
      formValue.datePaiement = date.toISOString();
    }
    
    // Ensure numeric values are parsed as numbers
    formValue.factureId = Number(formValue.factureId);
    formValue.montant = Number(formValue.montant);
    formValue.type = Number(formValue.type);
    
    console.log('Sending payment data:', JSON.stringify(formValue, null, 2));
    
    this.factureService.ajouterPaiement(formValue).subscribe({
      next: (response) => {
        alert('✅ ' + response.message);
        this.activeTab = 'list';
        this.chargerFactures();
        this.chargerPaiements();
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du paiement:', error);
        
        // More detailed error information
        if (error.error && error.error.message) {
          alert('❌ Erreur: ' + error.error.message);
        } else if (error.status === 500) {
          alert('❌ Erreur serveur (500). Vérifiez les données du formulaire ou contactez l\'administrateur.');
        } else {
          alert('❌ Erreur lors de l\'ajout du paiement: ' + 
                (error.statusText || 'Une erreur est survenue'));
        }
      }
    });
  }

  // Méthode pour obtenir la liste des pages à afficher dans la pagination
  getPagesToShow(): number[] {
    const pagesToShow: number[] = [];
    
    // Afficher toutes les pages sans limite
    for (let i = 1; i <= this.totalPages; i++) {
      pagesToShow.push(i);
    }
    
    return pagesToShow;
  }
}
