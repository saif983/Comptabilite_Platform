import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BilanService } from '../services/bilan.service';
import { UserService } from 'app/core/user/user.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-bilan-comptable',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './bilan-comptable.component.html',
  styleUrl: './bilan-comptable.component.scss'
})
export class BilanComptableComponent implements OnInit {
  enterprises: any[] = [];
  selectedEnterpriseId: number | null = null;
  capital: number | null = null;
  bilanData: any = null;
  loading = false;
  error: string | null = null;
  debug: string | null = null;
  currentDate = new Date();

  constructor(
    private bilanService: BilanService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur a une entreprise par défaut
    this.userService.user$.subscribe(
      user => {
        if (user && user.defaultEntrepriseId) {
          console.log('Entreprise par défaut trouvée:', user.defaultEntrepriseId);
          this.selectedEnterpriseId = user.defaultEntrepriseId;
        }
        // Charger les entreprises dans tous les cas
        this.loadEnterprises();
      },
      error => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        this.debug = `Erreur utilisateur: ${JSON.stringify(error)}`;
        this.loadEnterprises();
      }
    );
  }

  loadEnterprises(): void {
    this.loading = true;
    this.bilanService.getEnterprises().subscribe({
      next: (data) => {
        console.log('Données des entreprises reçues:', data);
        if (data && data.length > 0) {
          this.enterprises = data;
          
          // Afficher les propriétés de la première entreprise pour le débogage
          if (data.length > 0) {
            const firstEnterprise = data[0];
            const props = Object.keys(firstEnterprise).join(', ');
            console.log('Propriétés de l\'entreprise:', props);
            console.log('Première entreprise:', JSON.stringify(firstEnterprise, null, 2));
            this.debug = `${data.length} entreprises trouvées. Propriétés: ${props}`;
          } else {
            this.debug = `${data.length} entreprises trouvées.`;
          }
          
          // Si pas d'entreprise sélectionnée, utiliser la première
          if (!this.selectedEnterpriseId && data.length > 0) {
            this.selectedEnterpriseId = data[0].id;
          }
        } else {
          this.error = 'Aucune entreprise trouvée. Veuillez d\'abord créer une entreprise.';
          this.debug = 'Liste d\'entreprises vide';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des entreprises:', err);
        this.error = 'Impossible de charger les entreprises. Veuillez réessayer.';
        this.debug = `Erreur API: ${JSON.stringify(err)}`;
        this.loading = false;
      }
    });
  }

  generateBilan(): void {
    if (!this.selectedEnterpriseId) {
      this.error = 'Veuillez sélectionner une entreprise';
      return;
    }

    this.loading = true;
    this.error = null;
    this.bilanData = null;
    this.debug = null;

    console.log(`Demande de génération du bilan pour l'entreprise ID: ${this.selectedEnterpriseId}, Capital: ${this.capital || 'Non spécifié'}`);

    this.bilanService.generateBilan(this.selectedEnterpriseId, this.capital || undefined).subscribe({
      next: (data) => {
        console.log('Données du bilan reçues:', data);
        
        // Vérifier si la réponse contient une erreur
        if (data && data.error) {
          this.error = data.message || 'Une erreur est survenue lors de la génération du bilan';
          this.debug = `Erreur du serveur: ${JSON.stringify(data.details)}`;
          this.loading = false;
          return;
        }
        
        this.bilanData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la génération du bilan:', err);
        this.error = 'Impossible de générer le bilan. Veuillez réessayer.';
        this.debug = `Erreur génération bilan: ${JSON.stringify(err)}`;
        this.loading = false;
      }
    });
  }

  printBilan(): void {
    // Sauvegarder les contenus actuels du corps
    const originalContents = document.body.innerHTML;
    
    // Obtenir le contenu de la section à imprimer
    const printContents = document.getElementById('bilan-print-section')?.innerHTML;
    
    if (printContents) {
      // Préparer le document pour l'impression avec les styles CSS appropriés
      let popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
      if (popupWin) {
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <title>Bilan Comptable</title>
              <style>
                body {
                  font-family: 'Roboto', 'Segoe UI', sans-serif;
                  padding: 20px;
                  color: #333;
                }
                .bilan-title {
                  text-align: center;
                  color: #3f51b5;
                  margin-bottom: 20px;
                }
                .bilan-tables {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 30px;
                }
                .bilan-table {
                  flex: 1 1 45%;
                  min-width: 300px;
                }
                .table-title {
                  font-size: 20px;
                  margin-bottom: 15px;
                  padding-bottom: 5px;
                  border-bottom: 2px solid;
                  font-weight: 500;
                }
                .actif-title {
                  color: #3949ab;
                  border-color: #3949ab;
                }
                .passif-title {
                  color: #5e35b1;
                  border-color: #5e35b1;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 20px;
                }
                th, td {
                  padding: 10px;
                  text-align: left;
                  border-bottom: 1px solid #ddd;
                }
                th {
                  background-color: #f5f7fa;
                  font-weight: 500;
                }
                .section-header {
                  background-color: #eceef2;
                  font-weight: 500;
                }
                .subtotal-row {
                  background-color: #f5f7fa;
                  font-weight: 500;
                }
                .total-row {
                  background-color: #3f51b5;
                  color: white;
                  font-weight: 500;
                }
                .amount {
                  text-align: right;
                  font-family: monospace;
                }
                .bilan-footer {
                  margin-top: 30px;
                  text-align: right;
                  color: #757575;
                  font-size: 12px;
                  border-top: 1px solid #eee;
                  padding-top: 10px;
                }
                @media print {
                  body {
                    padding: 0;
                    margin: 0;
                  }
                  .bilan-tables {
                    display: block;
                  }
                  .bilan-table {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                  }
                }
              </style>
            </head>
            <body onload="window.print();window.close()">
              ${printContents}
            </body>
          </html>
        `);
        popupWin.document.close();
      }
    }
  }

  exportToExcel(): void {
    try {
      if (!this.bilanData) {
        this.error = 'Aucune donnée de bilan disponible pour l\'exportation';
        return;
      }

      // Préparer les données pour l'export Excel
      const workbook = XLSX.utils.book_new();
      
      // Créer les données pour l'actif
      const actifData = [
        ['Bilan Comptable - Actif', '', ''],
        ['', '', ''],
        ['Postes', '', 'Montant (TND)']
      ];
      
      // Ajouter les immobilisations
      actifData.push(['Immobilisations', '', '']);
      this.bilanData.actif.immobilisations.forEach((item: any) => {
        actifData.push(['', item.label, this.formatNumberForExcel(item.montant)]);
      });
      actifData.push(['', 'Total immobilisations', this.formatNumberForExcel(this.bilanData.actif.total_immobilisations)]);
      
      // Ajouter l'actif circulant
      actifData.push(['Actif circulant', '', '']);
      this.bilanData.actif.actif_circulant.forEach((item: any) => {
        actifData.push(['', item.label, this.formatNumberForExcel(item.montant)]);
      });
      actifData.push(['', 'Total actif circulant', this.formatNumberForExcel(this.bilanData.actif.total_actif_circulant)]);
      
      // Ajouter le total actif
      actifData.push(['TOTAL ACTIF', '', this.formatNumberForExcel(this.bilanData.actif.total_actif)]);
      
      // Créer les données pour le passif
      const passifData = [
        ['Bilan Comptable - Passif', '', ''],
        ['', '', ''],
        ['Postes', '', 'Montant (TND)']
      ];
      
      // Ajouter les capitaux propres
      passifData.push(['Capitaux propres', '', '']);
      this.bilanData.passif.capitaux_propres.forEach((item: any) => {
        passifData.push(['', item.label, this.formatNumberForExcel(item.montant)]);
      });
      passifData.push(['', 'Total capitaux propres', this.formatNumberForExcel(this.bilanData.passif.total_capitaux_propres)]);
      
      // Ajouter les dettes
      passifData.push(['Dettes', '', '']);
      this.bilanData.passif.dettes.forEach((item: any) => {
        passifData.push(['', item.label, this.formatNumberForExcel(item.montant)]);
      });
      passifData.push(['', 'Total dettes', this.formatNumberForExcel(this.bilanData.passif.total_dettes)]);
      
      // Ajouter le total passif
      passifData.push(['TOTAL PASSIF', '', this.formatNumberForExcel(this.bilanData.passif.total_passif)]);
      
      // Créer les worksheets et les ajouter au workbook
      const actifWorksheet = XLSX.utils.aoa_to_sheet(actifData);
      XLSX.utils.book_append_sheet(workbook, actifWorksheet, 'Actif');
      
      const passifWorksheet = XLSX.utils.aoa_to_sheet(passifData);
      XLSX.utils.book_append_sheet(workbook, passifWorksheet, 'Passif');
      
      // Générer le fichier Excel
      const date = new Date().toISOString().slice(0, 10);
      const fileName = `Bilan_Comptable_${date}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error('Erreur lors de l\'exportation vers Excel:', err);
      this.error = 'Erreur lors de l\'exportation vers Excel. Veuillez réessayer.';
    }
  }
  
  private formatNumberForExcel(value: number): string {
    return value ? value.toString() : '0';
  }
}
