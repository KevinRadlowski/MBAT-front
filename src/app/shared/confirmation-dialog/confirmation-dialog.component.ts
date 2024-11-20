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
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; requirePassword?: boolean, requireSecretAnswer?: boolean, secretQuestion?: string },
    private fb: FormBuilder
  ) {
    // Initialise le formulaire seulement si le mot de passe est requis
    this.passwordForm = this.fb.group({
      password: ['', data.requirePassword ? Validators.required : null],
      secretAnswer: ['', data.requireSecretAnswer ? Validators.required : null]
    });
  }

  onConfirm(): void {
    if (this.data.requirePassword && !this.data.requireSecretAnswer) {
      // Retourne uniquement le mot de passe si seule la vérification du mot de passe est requise
      this.dialogRef.close(this.passwordForm.value.password);
    } else if (this.data.requireSecretAnswer) {
      // Retourne le mot de passe et la réponse à la question secrète si les deux sont requis
      this.dialogRef.close(this.passwordForm.value.secretAnswer);
    } else {
      // Retourne simplement "true" si aucune vérification supplémentaire n'est requise
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}