import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-google-signin',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations,
  templateUrl: './google-signin.component.html',
  styleUrl: './google-signin.component.scss'
})
export class GoogleSigninComponent {
  @Output() loginWithGoogle: EventEmitter<any> = new EventEmitter<any>();

  createFakeGoogleWrapper = () => {
    const googleLoginWrapper = document.createElement('div');
    googleLoginWrapper.style.display = 'none';
    googleLoginWrapper.classList.add('custom-google-button');
    document.body.appendChild(googleLoginWrapper);
    window.google.accounts.id.renderButton(googleLoginWrapper, {
      type: 'icon',
      width: '200',
    });

    const googleLoginWrapperButton = googleLoginWrapper.querySelector(
      'div[role=button]'
    ) as HTMLElement;

    return {
      click: () => {
        googleLoginWrapperButton?.click();
      },
    };
  };

  handleGoogleLogin() {
    this.loginWithGoogle.emit(this.createFakeGoogleWrapper());
  }
}
