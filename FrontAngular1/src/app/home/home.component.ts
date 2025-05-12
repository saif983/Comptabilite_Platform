import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  mobileMenuOpen = false;

  constructor() { }

  ngOnInit(): void {
    // Charger Font Awesome si nécessaire
    this.loadFontAwesome();
    
    // Ajouter les effets d'animation au chargement
    this.initAnimation();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.animateOnScroll();
  }

  // Gérer l'ouverture/fermeture du menu mobile
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // Initialiser les animations
  private initAnimation(): void {
    setTimeout(() => {
      this.animateOnScroll();
    }, 100);
  }

  // Animation au défilement
  private animateOnScroll(): void {
    const featureCards = document.querySelectorAll('.feature-card');
    const ctaSection = document.querySelector('.bg-green-100');
    const featureCardsInteractive = document.querySelectorAll('.feature-card-interactive');
    
    // Animer les cartes de fonctionnalités interactives
    featureCardsInteractive.forEach((card: Element, index) => {
      const cardPosition = card.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;
      
      if (cardPosition < screenPosition) {
        setTimeout(() => {
          (card as HTMLElement).style.opacity = '1';
          (card as HTMLElement).style.transform = 'translateY(0)';
        }, index * 150);
      }
    });
    
    // Animer les cartes de fonctionnalités standard
    featureCards.forEach((card: Element, index) => {
      const cardPosition = card.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;
      
      if (cardPosition < screenPosition) {
        setTimeout(() => {
          (card as HTMLElement).style.opacity = '1';
          (card as HTMLElement).style.transform = 'translateY(0)';
        }, index * 150);
      }
    });
    
    // Animer la section CTA
    if (ctaSection) {
      const ctaPosition = ctaSection.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.1;
      
      if (ctaPosition < screenPosition) {
        (ctaSection as HTMLElement).style.opacity = '1';
        (ctaSection as HTMLElement).style.transform = 'translateY(0)';
      }
    }
  }

  // Fonction pour charger dynamiquement Font Awesome si nécessaire
  private loadFontAwesome(): void {
    // Vérifier si Font Awesome est déjà chargé
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }
}
