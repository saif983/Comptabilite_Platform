import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({providedIn: 'root'})
export class UserService
{
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private apiUrl = `${environment.apiUrl}/utilisateur`;

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User>
    {
        return this._httpClient.get<User>('api/common/user').pipe(
            tap((user) =>
            {
                this._user.next(user);
            }),
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) =>
            {
                this._user.next(response);
            }),
        );
    }

    /**
     * Get user profile from the API
     */
    getUserProfile(): Observable<User>
    {
        return this._httpClient.get<any>(`${this.apiUrl}/profile`)
            .pipe(
                map(response => {
                    const user: User = {
                        id: response.id.toString(),
                        name: response.nom,
                        email: response.email,
                        defaultEntrepriseId: response.defaultEntrepriseId
                    };
                    this._user.next(user);
                    return user;
                })
            );
    }

    /**
     * Set default enterprise for the user
     */
    setDefaultEntreprise(entrepriseId: number): Observable<any>
    {
        return this._httpClient.post(`${environment.apiUrl}/entreprises/${entrepriseId}/set-default`, {})
            .pipe(
                tap(response => {
                    // Update user with new default enterprise
                    this.getUserProfile().subscribe();
                })
        );
    }

    /**
     * Delete the user's default entreprise
     */
    deleteDefaultEntreprise(): Observable<any>
    {
        return this._httpClient.post(`${environment.apiUrl}/entreprises/delete-default`, {})
            .pipe(
                tap(response => {
                    // Update user profile after deletion
                    this.getUserProfile().subscribe();
                })
        );
    }
}
