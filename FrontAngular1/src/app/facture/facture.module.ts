import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { factureRoutes } from './facture.routes';
import { FactureComponent } from './facture.component';

@NgModule({
    declarations: [
        FactureComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(factureRoutes),
        ReactiveFormsModule
    ]
})
export class FactureModule { } 