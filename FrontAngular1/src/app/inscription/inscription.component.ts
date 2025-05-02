import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select'; // <-- Ajout pour liste déroulante
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService, RegisterDto } from '../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-inscription',
    templateUrl: './inscription.component.html',
    styleUrl: './inscription.component.scss',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        NgIf,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatSelectModule, // <-- Ajout ici aussi
    ],
})
export class InscriptionComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.signUpForm = this._formBuilder.group({
            nom: ['', Validators.required], // Ajoute le champ 'nom'
            email: ['', [Validators.required, Validators.email]],
            motDePasse: ['', Validators.required],
            role: ['', Validators.required],
            agreements: [false, Validators.requiredTrue],
        });
    }

    signUp() {
        if (this.signUpForm.invalid) {
            return;
        }

        this.signUpForm.disable();
        this.showAlert = false;

        // Créer l'objet RegisterDto conforme à l'API backend
        const user: RegisterDto = {
            nom: this.signUpForm.value.nom,
            email: this.signUpForm.value.email,
            motDePasse: this.signUpForm.value.motDePasse,
            role: this.signUpForm.value.role
            // Ne pas envoyer "state" car ce n'est pas dans le RegisterRequest du backend
        };

        console.log('Envoi de la requête d\'inscription avec les données:', user);
        console.log('URL API:', this.authService['baseUrl'] + '/register');

        this.authService.register(user).subscribe({
            next: (response) => {
                console.log('Réponse d\'inscription:', response);
                this.alert = {
                    type: 'success',
                    message: 'Compte créé avec succès !',
                };
                this.showAlert = true;
                setTimeout(() => this._router.navigate(['/login']), 2000);
            },
            error: (error: HttpErrorResponse) => {
                console.error('Erreur d\'inscription complète:', error);
                
                let errorMessage = 'Erreur lors de l\'inscription.';
                
                if (error.error && typeof error.error === 'object') {
                    // Si l'erreur contient un objet avec un message
                    if (error.error.message) {
                        errorMessage = error.error.message;
                    } else if (error.error.title) {
                        errorMessage = error.error.title;
                    }
                } else if (typeof error.error === 'string') {
                    // Si l'erreur est une chaîne directe
                    errorMessage = error.error;
                } else if (error.status === 0) {
                    // Erreur de connexion réseau
                    errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet ou le serveur API.';
                } else if (error.status === 400) {
                    errorMessage = 'Données invalides. Vérifiez les champs du formulaire.';
                } else if (error.status === 404) {
                    errorMessage = 'Service d\'inscription non disponible.';
                } else if (error.status === 500) {
                    errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                }
                
                this.signUpForm.enable();
                this.alert = {
                    type: 'error',
                    message: errorMessage
                };
                this.showAlert = true;
            },
        });
    }
}
