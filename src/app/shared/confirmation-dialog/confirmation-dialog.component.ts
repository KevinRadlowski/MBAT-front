import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  passwordForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; requirePassword?: boolean },
    private fb: FormBuilder
  ) {
    // Initialise le formulaire seulement si le mot de passe est requis
    this.passwordForm = this.fb.group({
      password: ['', data.requirePassword ? Validators.required : null]
    });
  }

  onConfirm(): void {
    if (this.data.requirePassword) {
      this.dialogRef.close(this.passwordForm.value.password); // Retourne le mot de passe
    } else {
      this.dialogRef.close(true); // Retourne juste "true" si pas de mot de passe requis
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}