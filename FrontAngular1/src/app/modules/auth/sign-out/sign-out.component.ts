import { I18nPluralPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize, Subject, takeUntil, takeWhile, tap, timer } from 'rxjs';

@Component({
    selector     : 'auth-sign-out',
    templateUrl  : './sign-out.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [NgIf, RouterLink, I18nPluralPipe],
})
export class AuthSignOutComponent implements OnInit, OnDestroy
{
    countdown: number = 5;
    countdownMapping: any = {
        '=1'   : '# seconde',
        'other': '# secondes',
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
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
        // Log pour le débogage
        console.log('Sign-out component initialized');
        
        // Vérifier si l'utilisateur est authentifié
        this._authService.check().subscribe((authenticated) => {
            console.log('État d\'authentification avant la déconnexion:', authenticated);
        });
        
        // Sign out
        this._authService.signOut().subscribe({
            next: () => {
                console.log('Déconnexion réussie, token supprimé');
                
                // Vérifier que l'utilisateur est bien déconnecté
                this._authService.check().subscribe((authenticated) => {
                    console.log('État d\'authentification après la déconnexion:', authenticated);
                });
            },
            error: (error) => {
                console.error('Erreur lors de la déconnexion:', error);
            }
        });

        // Redirect after the countdown
        timer(1000, 1000)
            .pipe(
                finalize(() =>
                {
                    console.log('Redirection vers la page de connexion');
                    this._router.navigate(['sign-in']);
                }),
                takeWhile(() => this.countdown > 0),
                takeUntil(this._unsubscribeAll),
                tap(() => this.countdown--),
            )
            .subscribe();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
