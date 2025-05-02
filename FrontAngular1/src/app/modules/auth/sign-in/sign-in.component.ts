import { NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';
import { AuthService, LoginDto } from 'app/core/auth/auth.service';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [RouterLink, FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
})
export class AuthSignInComponent implements OnInit, OnDestroy
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    @ViewChild('forgetPNgForm') forgetPNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    forgetPForm: UntypedFormGroup;
    showAlert: boolean = false;
    emailFP: boolean = false;
    codeFP: boolean = false;
    passwordFP: boolean = false;
    codeE: string = "";
    authSubscription!: Subscription;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private socialAuthService: SocialAuthService
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
        // Redirect if already logged in
        this._authService.check().subscribe((authenticated) => {
            if (authenticated) {
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                this._router.navigateByUrl(redirectURL);
            }
        });

        this.authSubscription = this.socialAuthService.authState.subscribe((user) => {
            console.log('user', user);
        });

        // Create the form
        this.signInForm = this._formBuilder.group({
            email     : ['', [Validators.required, Validators.email]],
            password  : ['', Validators.required],
            rememberMe: [''],
        });

        this.forgetPForm = this._formBuilder.group({
            emailP: ['', [Validators.required, Validators.email]],
            passwordN: ['', Validators.required],
            codeP: ['', Validators.required],
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Google sign in
     */
    googleSignin(googleWrapper: any): void {
        googleWrapper.click();
    }

    /**
     * Sign in
     */
    signIn(): void
    {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Create login dto
        const loginDto: LoginDto = {
            email: this.signInForm.get('email').value,
            motDePasse: this.signInForm.get('password').value,
        };

        // Sign in
        console.log('Tentative de connexion avec:', loginDto);
        this._authService.signIn(loginDto)
            .subscribe({
                next: (response) => {
                    console.log('Connexion réussie:', response);

                    // Rediriger vers la route signed-in-redirect qui pointera vers la liste des entreprises
                    this._router.navigateByUrl('/signed-in-redirect');
                },
                error: (error) => {
                    console.error('Erreur lors de la connexion:', error);
                    console.error('Type d\'erreur:', typeof error);
                    
                    // Détail complet de l'erreur pour debug
                    console.error('Détail de l\'erreur:', JSON.stringify(error, null, 2));

                    // Set error message
                    let errorMessage = 'Une erreur est survenue lors de la connexion.';
                    
                    // Utiliser le message spécifique si disponible
                    if (error && error.message) {
                        errorMessage = error.message;
                    } else if (error && error.status) {
                        // Erreurs HTTP spécifiques
                        if (error.status === 0) {
                            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet ou si le serveur est en ligne.';
                        } else if (error.status === 401) {
                            errorMessage = 'Email ou mot de passe incorrect.';
                        } else if (error.status === 400) {
                            errorMessage = 'Données invalides. Vérifiez vos informations de connexion.';
                        } else if (error.status === 404) {
                            errorMessage = 'Service d\'authentification non disponible. URL incorrecte ou serveur inaccessible.';
                        } else if (error.status === 500) {
                            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                        }
                    }

                    // Re-enable the form
                    this.signInForm.enable();

                    // Show the error message
                    this.alert = {
                        type: 'error',
                        message: errorMessage
                    };
                    this.showAlert = true;
                }
            });
    }

    /**
     * Forget password
     */
    forgetPassword(): void {
        this.emailFP = true;
    }

    /**
     * Change password
     */
    changePassword(): void {
        if (this.passwordFP && this.forgetPForm.value.passwordN) {
            console.log(this.forgetPForm.value);
        }
        else if (this.codeFP && this.forgetPForm.value.codeP) {
            if (this.forgetPForm.value.codeP !== this.codeE) {
                alert("wrong code");
            }
            else {
                this.codeFP = false;
                this.passwordFP = true;
            }
        }
        else if (this.emailFP && this.forgetPForm.value.emailP) {
            this.emailFP = false;
            this.codeFP = true;
        }
        else {
            return;
        }
    }
}
