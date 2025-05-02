import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    // Import the standalone component
    ConfirmDialogComponent
  ],
  exports: [
    // Re-export the component so it can be used by modules importing SharedModule
    ConfirmDialogComponent
  ]
})
export class SharedModule { } 