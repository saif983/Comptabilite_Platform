import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { devisRoutes } from './devis.routes';
import { DevisComponent } from './devis.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(devisRoutes),
    ReactiveFormsModule,
    FormsModule
  ]
})
export class DevisModule { } 