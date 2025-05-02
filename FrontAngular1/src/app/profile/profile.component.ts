
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { user } from '../mock-api/common/user/data';
@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations,
  imports      : [RouterLink, NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
})
export class ProfileComponent implements OnInit{

  @ViewChild('signUpNgForm') signUpNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
      type   : 'success',
      message: '',
  };
  profileForm: UntypedFormGroup;
  showAlert: boolean = false;
  userC:any={}

  /**
   * Constructor
   */
  constructor(
      private _formBuilder: UntypedFormBuilder,
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
    const token=localStorage.getItem("employe")
    this.profileForm = this._formBuilder.group({
      name     : [this.userC.name, Validators.required],
      email     : [this.userC.email, [Validators.required, Validators.email]],
      password  : [this.userC.password],
      number   : [this.userC.number],
      birthD   : [this.userC.birthD],

  })


    // Create the form

  }
  modify(){
    if ( this.profileForm.invalid )
    {
        return;
    }

    // Disable the form
    // this.profileForm.disable();

    // Hide the alert
    // this.showAlert = false;
    var user=this.profileForm.value
    if(!user.password.length){
      delete user.password
    }
    console.log(this.userC._id)
    console.log(user)

  }

}
