import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AbonnementService, Abonnement } from './abonnement.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-abonnement',
  standalone: true,
  templateUrl: './abonnement.component.html',
  styleUrls: ['./abonnement.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FuseAlertComponent
  ]
})
export class AbonnementComponent implements OnInit {

  selectedType: string = '';
  currentAbonnement: Abonnement | null = null;
  isLoading: boolean = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: ''
  };
  showAlert: boolean = false;
  currentSubscriptionType: string | null = null;

  constructor(
    private abonnementService: AbonnementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentSubscription();
  }

  loadCurrentSubscription(): void {
    this.abonnementService.getMonAbonnement().subscribe({
      next: (abonnement: Abonnement) => {
        this.currentAbonnement = abonnement;
  
        // ✅ Assure-toi que le champ 'type' existe et est bien défini
        this.currentSubscriptionType = abonnement?.type || null;
      },
      error: (error) => {
        console.error('Erreur chargement abonnement actuel:', error);
        this.currentSubscriptionType = null;
      }
    });
  }

  choisirAbonnement(type: string): void {
    if (!type) {
      this.alert = {
        type: 'error',
        message: 'Veuillez sélectionner un type d\'abonnement'
      };
      this.showAlert = true;
      return;
    }

    this.isLoading = true;
    this.abonnementService.changerAbonnement(type).subscribe({
      next: (response) => {
        this.currentAbonnement = {
          type: response.type,
          prix: response.prix,
          dateDebut: response.dateDebut,
          dateFin: response.dateFin
        };
        this.currentSubscriptionType = response.type;

        // Mettre à jour sessionStorage
        sessionStorage.setItem('currentSubscriptionType', response.type);

        this.alert = {
          type: 'success',
          message: response.message
        };
        this.showAlert = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du changement d\'abonnement:', error);
        this.alert = {
          type: 'error',
          message: error.error?.message || 'Une erreur est survenue lors du changement d\'abonnement'
        };
        this.showAlert = true;
        this.isLoading = false;
      }
    });
  }
}
