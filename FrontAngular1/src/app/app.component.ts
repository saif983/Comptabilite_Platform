import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import firebase from 'firebase/compat/app';




const Config = {
    apiKey: "AIzaSyC_-l5ENkZs0O9_Y50MlW1VhvmUjpOhE1I",
    authDomain: "chat-2d48b.firebaseapp.com",
    databaseURL: "https://chat-2d48b-default-rtdb.firebaseio.com",
    projectId: "chat-2d48b",
    storageBucket: "chat-2d48b.appspot.com",
    messagingSenderId: "1059249712065",
    appId: "1:1059249712065:web:f63556a343ae3268441d40"
  };

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class AppComponent {
    /**
     * Constructor
     */
    constructor()
    {pdfMake.vfs = pdfFonts.pdfMake.vfs;}

    ngOnInit() {
        firebase.initializeApp(Config);
        // Initialisez Firestore ici si vous en avez besoin
}
}