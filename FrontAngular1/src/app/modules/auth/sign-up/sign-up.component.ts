import { NgIf, CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService, RegisterDto } from 'app/core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector     : 'auth-sign-up',
    templateUrl  : './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [
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
        MatSelectModule
    ],
})
export class AuthSignUpComponent implements OnInit
{
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.signUpForm = this._formBuilder.group({
                nom: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
                motDePasse: ['', Validators.required],
                role: ['', Validators.required],
                agreements: [false, Validators.requiredTrue],
            },
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void
    {
        // Do nothing if the form is invalid
        if (this.signUpForm.invalid)
        {
            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Créer l'objet RegisterDto conforme à l'API backend
        const user: RegisterDto = {
            nom: this.signUpForm.value.nom,
            email: this.signUpForm.value.email,
            motDePasse: this.signUpForm.value.motDePasse,
            role: this.signUpForm.value.role
        };

        console.log('Envoi de la requête d\'inscription avec les données:', user);

        // Sign up
        this._authService.register(user).subscribe({
            next: (response) => {
                console.log('Réponse d\'inscription:', response);
                this.alert = {
                    type: 'success',
                    message: 'Compte créé avec succès !',
                };
                this.showAlert = true;
                setTimeout(() => this._router.navigate(['/sign-in']), 2000);
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
                
                    // Re-enable the form
                    this.signUpForm.enable();

                    // Set the alert
                    this.alert = {
                    type: 'error',
                    message: errorMessage,
                    };

                    // Show the alert
                    this.showAlert = true;
            }
        });
    }
}
