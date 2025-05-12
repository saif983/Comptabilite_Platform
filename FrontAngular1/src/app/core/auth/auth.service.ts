import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';

export interface RegisterDto {
    nom: string;
    email: string;
    motDePasse: string;
    role: string;
    nomEntreprise?: string; // Peut être utilisé plus tard si besoin
}

export interface LoginDto {
    email: string;
    motDePasse: string;
}

@Injectable({providedIn: 'root'})
export class AuthService
{
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private baseUrl = 'https://localhost:7141/api/auth';

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        sessionStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return sessionStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post(`${this.baseUrl}/forgot-password`, { email });
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post(`${this.baseUrl}/reset-password`, { password });
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: LoginDto): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError(() => 'User is already logged in.');
        }

        console.log('Tentative de connexion à:', `${this.baseUrl}/login`);
        console.log('Avec les identifiants:', credentials);

        // Modifier pour ne pas utiliser observe: 'response' et traiter directement le corps de la réponse
        return this._httpClient.post(`${this.baseUrl}/login`, credentials).pipe(
            switchMap((response: any) =>
            {
                // Comme nous traitons directement le corps, response est déjà le corps
                console.log('Réponse du serveur:', response);
                
                // Pour debug - afficher toutes les propriétés disponibles dans la réponse
                console.log('Propriétés disponibles dans la réponse:', Object.keys(response));
                
                // Store the access token in the local storage
                if (response && response.token) {
                    this.accessToken = response.token;
                    
                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Déterminer l'avatar en fonction du rôle
                    let avatarPath = 'assets/images/avatars/default-user.png';
                    if (response.role === 'Administrateur') {
                        avatarPath = 'assets/images/avatars/male-02.jpg';
                    } else if (response.role === 'Comptable') {
                        avatarPath = 'assets/images/avatars/female-02.jpg';
                    }

                    // Store the user on the user service
                    this._userService.user = {
                        id: response.id || 0,
                        name: response.name || credentials.email, // Utiliser le nom si disponible, sinon l'email
                        email: credentials.email,
                        avatar: avatarPath,
                        status: 'online',
                        role: response.role || 'User',
                        defaultEntrepriseId: response.defaultEntrepriseId || null
                    };
                    
                    console.log('Utilisateur stocké:', this._userService.user);
                } else {
                    console.error('Token non trouvé dans la réponse:', response);
                    return throwError(() => 'Erreur: Token non trouvé dans la réponse');
                }

                // Return a new observable with the response
                return of(response);
            }),
            catchError(error => {
                console.error('Erreur HTTP lors de la connexion:', error);
                
                // Format de l'erreur plus détaillé
                let errorMessage = 'Une erreur est survenue lors de la connexion.';
                
                if (error.error && typeof error.error === 'object') {
                    if (error.error.message) {
                        errorMessage = error.error.message;
                    } else if (error.error.title) {
                        errorMessage = error.error.title;
                    }
                } else if (typeof error.error === 'string') {
                    errorMessage = error.error;
                }
                
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
                
                // Retourner l'erreur avec un message amélioré
                return throwError(() => ({
                    status: error.status,
                    message: errorMessage,
                    originalError: error
                }));
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // If the token doesn't exist, return false immediately
        if (!this.accessToken) {
            return of(false);
        }

        // Get the current token expiration status
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            console.log('Token expiré, déconnexion automatique');
            this.signOut();
            return of(false);
        }

        // Try to decode token and set user
        try {
            const decodedToken = AuthUtils.decodeToken(this.accessToken);
            
            if (decodedToken) {
                this._authenticated = true;
                
                // Déterminer l'avatar en fonction du rôle
                let avatarPath = 'assets/images/avatars/default-user.png';
                const role = decodedToken[AuthUtils.CLAIM_ROLE] || '';
                if (role === 'Administrateur') {
                    avatarPath = 'assets/images/avatars/male-02.jpg';
                } else if (role === 'Comptable') {
                    avatarPath = 'assets/images/avatars/female-02.jpg';
                }
                
                // Set user from token claims
                this._userService.user = {
                    id: decodedToken[AuthUtils.CLAIM_USER_ID] || 0,
                    name: decodedToken[AuthUtils.CLAIM_NAME] || '',
                    email: decodedToken[AuthUtils.CLAIM_EMAIL] || '',
                    avatar: avatarPath,
                    status: 'online',
                    role: role,
                    defaultEntrepriseId: decodedToken['defaultEntrepriseId'] || null
                };
                
                return of(true);
            }
        } catch (error) {
            console.error('Erreur lors du décodage du token:', error);
        }
        
        return of(false);
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Appelle le endpoint de déconnexion
        // Comme JWT est stateless, on peut simplement supprimer le token
        // On envoie quand même une requête au serveur pour traçabilité
        return this._httpClient.post(`${this.baseUrl}/logout`, {}, {
            // Si le token est invalide ou l'appel échoue, on ignore et on déconnecte localement
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }).pipe(
            catchError(() => {
                // En cas d'erreur, on déconnecte quand même localement
                return of(true);
            }),
            switchMap(() => {
                // Remove the access token from the local storage
                sessionStorage.removeItem('accessToken');

                // Set the authenticated flag to false
                this._authenticated = false;

                // Reset user data
                this._userService.user = null;

                // Return the observable
                return of(true);
            })
        );
    }

    /**
     * Sign up - register new user
     *
     * @param user
     */
    signUp(user: RegisterDto): Observable<any>
    {
        console.log('Tentative d\'inscription avec les données:', user);
        console.log('URL d\'API:', `${this.baseUrl}/register`);
        
        return this._httpClient.post(`${this.baseUrl}/register`, user)
            .pipe(
                catchError(error => {
                    console.error('Erreur lors de l\'inscription:', error);
                    if (error.status === 0) {
                        console.error('Problème de connexion réseau ou CORS');
                    }
                    return throwError(() => error);
                })
            );
    }

    /**
     * Register - alias for signUp
     */
    register(user: RegisterDto): Observable<any>
    {
        return this.signUp(user);
    }

    /**
     * Login - alias for signIn
     */
    login(credentials: LoginDto): Observable<any>
    {
        return this.signIn(credentials);
    }

    /**
     * Logout - alias for signOut
     */
    logout(): Observable<any>
    {
        return this.signOut();
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
