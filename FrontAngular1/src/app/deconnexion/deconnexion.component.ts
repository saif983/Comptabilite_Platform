import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-deconnexion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './deconnexion.component.html',
  styleUrl: './deconnexion.component.scss'
})
export class DeconnexionComponent implements OnInit {
  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    // Appeler la méthode signOut du service d'authentification
    this._authService.signOut().subscribe(() => {
      console.log('Déconnexion réussie');
      
      // Nettoyer également les autres données locales si nécessaire
      sessionStorage.removeItem("employe");
      sessionStorage.removeItem("admin");
      
      // Rediriger vers la page de connexion
      this._router.navigate(["sign-in"]);
    });
  }
}
